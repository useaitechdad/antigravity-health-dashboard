/*
 * Copyright 2026 Use AI with Tech Dad
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * NOTICE: This file has been modified by Use AI with Tech Dad for the Antigravity series.
 */

/**
 * ProcessFinder: Detects Antigravity Language Server process
 */

import { exec } from "child_process";
import { promisify } from "util";
import { WindowsStrategy, UnixStrategy } from "./platform_strategies";
import { retry } from "../utils/retry";
import { errorLog, debugLog } from "../utils/logger";
import { verifyServerGateway } from "./detection_utils";
import { getExpectedWorkspaceIds } from "../utils/workspace_id";
import { LanguageServerInfo, DetectOptions, ProcessInfo, PlatformStrategy, CommunicationAttempt } from "../utils/types";

const execAsync = promisify(exec);

export class ProcessFinder {
  private strategy: PlatformStrategy;
  private processName: string;
  public failureReason: "no_process" | "ambiguous" | "no_port" | "auth_failed" | "workspace_mismatch" | null = null;
  public candidateCount: number = 0;
  public attemptDetails: CommunicationAttempt[] = [];

  constructor() {
    const platform = process.platform;
    const arch = process.arch;
    if (platform === "win32") {
      this.strategy = new WindowsStrategy();
      this.processName = "language_server_windows_x64.exe";
    } else if (platform === "darwin") {
      this.strategy = new UnixStrategy("darwin");
      this.processName = `language_server_macos${arch === "arm64" ? "_arm" : ""}`;
    } else {
      this.strategy = new UnixStrategy("linux");
      this.processName = `language_server_linux${arch === "arm64" ? "_arm" : "_x64"}`;
    }
  }

  async detect(options: DetectOptions = {}): Promise<LanguageServerInfo | null> {
    const { attempts = 5, baseDelay = 1500, verbose = false } = options;
    return retry(() => this.tryDetect(), {
      attempts,
      baseDelay,
      backoff: "exponential",
      maxDelay: 10000,
      onRetry: (attempt, delay) => {
        if (verbose) debugLog(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    });
  }

  protected async tryDetect(): Promise<LanguageServerInfo | null> {
    this.failureReason = null;
    this.candidateCount = 0;
    this.attemptDetails = [];

    try {
      const expectedIds = getExpectedWorkspaceIds();
      // For lean version, we can perhaps be more aggressive or simpler.
      // But keeping original robust logic is safer.
      const cmd = this.strategy.getProcessListCommand(this.processName);
      const { stdout } = await execAsync(cmd, { timeout: 8000 });
      
      const infos = this.strategy.parseProcessInfo(stdout);
      if (!infos) {
        this.failureReason = "no_process";
        return null;
      }

      this.candidateCount = infos.length;
      
      for (const info of infos) {
          // Priority check: Workspace ID matching
          // The Language Server is 1:1 with a workspace usually.
          if (expectedIds.length > 0 && info.workspaceId && !expectedIds.includes(info.workspaceId)) {
              if (infos.length === 1) this.failureReason = "workspace_mismatch";
              continue; 
          }

          const result = await this.verifyAndConnect(info);
          if (result) return result;
      }

      return null;

    } catch (e) {
      errorLog("ProcessFinder detection error", e);
      return null;
    }
  }

  private async verifyAndConnect(info: ProcessInfo): Promise<LanguageServerInfo | null> {
    // 1. Try extension port directly from command line
    if (info.extensionPort > 0) {
        const res = await verifyServerGateway("127.0.0.1", info.extensionPort, info.csrfToken);
        if (res.success) return { port: info.extensionPort, csrfToken: info.csrfToken };
    }

    // 2. Try OS detected ports (lsof/netstat)
    // This is useful if the CLI arg port is wrong or missing
    const cmd = this.strategy.getPortListCommand(info.pid);
    try {
        const { stdout } = await execAsync(cmd);
        const ports = this.strategy.parseListeningPorts(stdout, info.pid);
        
        for (const port of ports) {
            // Avoid re-checking if we already checked it above
            if (port === info.extensionPort) continue;

            const res = await verifyServerGateway("127.0.0.1", port, info.csrfToken);
            if (res.success) return { port, csrfToken: info.csrfToken };
        }
    } catch {
        // ignore port detection error
    }

    this.failureReason = "no_port";
    return null;
  }
  
  getDiagnostics(): string {
      return this.strategy.getDiagnosticCommand();
  }
}
