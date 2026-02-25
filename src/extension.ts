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
 * Antigravity Panel Extension - Main Entry Point (Lean)
 */

import * as vscode from "vscode";
import { ProcessFinder } from "./shared/platform/process_finder";
import { QuotaService } from "./model/services/quota.service";
import { CacheService } from "./model/services/cache.service";
import { StorageService } from "./model/services/storage.service";
import { QuotaStrategyManager } from "./model/strategy";
import { ConfigManager, IConfigReader, TfaConfig } from "./shared/config/config_manager";
import { AppViewModel } from "./view-model/app.vm";
import { StatusBarManager } from "./view/status-bar";
import { SidebarProvider } from "./view/sidebar-provider";
import { initLogger, setDebugMode, infoLog, errorLog, warnLog, debugLog, logQuotaSnapshot } from "./shared/utils/logger";
import { getExpectedWorkspaceIds } from "./shared/utils/workspace_id";
import { getDetailedOSVersion } from "./shared/utils/platform";

/**
 * VS Code implementation of IConfigReader
 */
class VscodeConfigReader implements IConfigReader, vscode.Disposable {
  private readonly section = "tfa";
  private disposables: vscode.Disposable[] = [];

  get<T>(key: string, defaultValue: T): T {
    const config = vscode.workspace.getConfiguration(this.section);
    return config.get<T>(key, defaultValue) as T;
  }

  async update<T>(key: string, value: T): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.section);
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }

  onConfigChange(callback: (config: TfaConfig) => void, configManager: ConfigManager): vscode.Disposable {
    const disposable = vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(this.section)) {
        callback(configManager.getConfig());
      }
    });
    this.disposables.push(disposable);
    return disposable;
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // Initialize Logger
  initLogger(context);
  infoLog("Antigravity Health Dashboard: Activating...");

  // 1. Initialize Core & Configuration
  const configReader = new VscodeConfigReader();
  const configManager = new ConfigManager(configReader);
  setDebugMode(configManager.get('system.debugMode', false));
  context.subscriptions.push(configReader);

  // 2. Initialize Model Services
  const strategyManager = new QuotaStrategyManager();
  const storageService = new StorageService(context.globalState);
  const cacheService = new CacheService();
  const quotaService = new QuotaService(configManager);

  // Register debug quota logging
  quotaService.onUpdate((snapshot) => {
    logQuotaSnapshot(snapshot);
  });

  // 3. Initialize ViewModel (The Brain)
  const appViewModel = new AppViewModel(
    quotaService,
    cacheService,
    storageService,
    configManager,
    strategyManager
  );
  context.subscriptions.push(appViewModel);

  // 4. Initialize View Components
  const statusBarManager = new StatusBarManager(appViewModel, configManager);
  context.subscriptions.push(statusBarManager);

  const sidebarProvider = new SidebarProvider(context.extensionUri, appViewModel, context.extension.packageJSON.version);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider)
  );

  // 5. Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("tfa.openPanel", () => {
      vscode.commands.executeCommand("workbench.view.extension.tfa-activitybar");
    }),
    vscode.commands.registerCommand("tfa.refresh", async () => {
      await appViewModel.refresh();
    }),
    vscode.commands.registerCommand("tfa.cleanCache", async () => {
      const result = await appViewModel.cleanCache();
      vscode.window.showInformationMessage(`Cleaned ${result.deletedCount} items, freed ${formatBytes(result.freedBytes)}`);
    }),
    vscode.commands.registerCommand("tfa.restartLanguageServer", async () => {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Reconnecting to Antigravity Local Service...",
        cancellable: false
      }, async () => {
        bootRetryCount = 0;
        hasShownNotification = false;
        await bootServerConnection();
      });
    }),
    vscode.commands.registerCommand("tfa.restartUserStatusUpdater", async () => {
      // Force refresh
      await appViewModel.refreshQuota();
      vscode.window.showInformationMessage("Triggered status update");
    }),
    vscode.commands.registerCommand("tfa.showLogs", () => {
      // Output channel is exposed via logger but not directly command-callable usually
      // We can just rely on user knowing where output channel is, or expose a command if needed
      // For now, no-op or implementation if logger exposes `show()`
      import("./shared/utils/logger").then(m => m.showLog());
    }),
    vscode.commands.registerCommand("tfa.runDiagnostics", async () => {
      // Simple diagnostics for now
      const state = appViewModel.getState();
      // @ts-ignore - Accessing private property for debug
      const snapshot = appViewModel['_lastSnapshot'];

      const output = `
Antigravity Panel Diagnostics
============================
Timestamp: ${new Date().toISOString()}
Extension Version: ${context.extension.packageJSON.version}

Connection Status
-----------------
Status: ${state.connectionStatus}
Failure Reason: ${state.failureReason || 'None'}
Last Updated: ${new Date(state.lastUpdated).toISOString()}

Quota State (Frontend)
----------------------
Active Group: ${state.quota.activeGroupId}
Display Items: ${state.quota.displayItems.length}
User Tier: ${state.user?.tier || 'Unknown'}
Plan Name: ${state.user?.planName || 'Unknown'}

Raw Quota Snapshot (Last Received)
----------------------------------
${snapshot ? JSON.stringify(snapshot, null, 2) : 'No snapshot received yet'}

Configuration
-------------
Refesh Rate: ${configManager.get('dashboard.refreshRate', 60)}
Debug Mode: ${configManager.get('system.debugMode', false)}
`.trim();

      const doc = await vscode.workspace.openTextDocument({ content: output, language: 'json' });
      await vscode.window.showTextDocument(doc);
    })
  );



  // 5.5 Initial Cache Load (Independent of Server)
  appViewModel.refreshCache().catch(err => errorLog(`Cache refresh error: ${err}`));

  // 6. Start Polling & Auto-Clean
  const refreshRate = configManager.get('dashboard.refreshRate', 60);
  const pollInterval = setInterval(() => {
    appViewModel.refreshQuota().catch(err => errorLog(`Polling error: ${err}`));
  }, refreshRate * 1000);
  context.subscriptions.push(new vscode.Disposable(() => clearInterval(pollInterval)));

  // Auto-clean on startup
  appViewModel.performAutoClean().then(res => {
    if (res && res.deletedCount > 0) {
      infoLog(`Auto-cleaned ${res.deletedCount} items (${formatBytes(res.freedBytes)})`);
    }
  });


  // 7. Boot Connection
  const MAX_BOOT_RETRY = 3;
  const BOOT_RETRY_DELAY_MS = 5000;
  let bootRetryCount = 0;
  let hasShownNotification = false;

  async function bootServerConnection(): Promise<void> {
    const processFinder = new ProcessFinder();

    try {
      appViewModel.setConnectionStatus('detecting', null);
      infoLog(`🔍 Attempting to connect to Antigravity language server (attempt ${bootRetryCount + 1}/${MAX_BOOT_RETRY + 1})...`);
      const expectedIds = getExpectedWorkspaceIds();

      const serverInfo = await processFinder.detect();
      const extVersion = context.extension.packageJSON.version;
      const ideVersion = vscode.version;

      if (serverInfo) {
        quotaService.setServerInfo(serverInfo);
        appViewModel.setConnectionStatus('connected', null);
        bootRetryCount = 0;

        infoLog(`✅ Connected to language server on port ${serverInfo.port}`);

        await appViewModel.refreshQuota();

        if (!hasShownNotification && quotaService.parsingError) {
          let message = vscode.l10n.t("Server data parsing error detected, some features limited");
          if (quotaService.parsingError.startsWith('AUTH_FAILED')) {
            message = vscode.l10n.t("Please ensure you are logged into Antigravity IDE (Authentication failed).");
          }
          vscode.window.showWarningMessage(message);
          hasShownNotification = true;
        }

        infoLog("Server connection established successfully");
      } else {
        if (bootRetryCount < MAX_BOOT_RETRY) {
          bootRetryCount++;
          infoLog(`🔄 Boot retry ${bootRetryCount}/${MAX_BOOT_RETRY} in ${BOOT_RETRY_DELAY_MS / 1000}s...`);
          appViewModel.setConnectionStatus('detecting', null);

          setTimeout(() => {
            bootServerConnection();
          }, BOOT_RETRY_DELAY_MS);
          return;
        }

        bootRetryCount = 0;
        appViewModel.setConnectionStatus('failed', processFinder.failureReason);
        warnLog(`❌ Connection failed. Reason: ${processFinder.failureReason || 'unknown'}`);

        if (hasShownNotification) return;

        const reason = processFinder.failureReason || "unknown_failure";
        let msg = "Antigravity Server not found.";
        if (reason === 'no_process') msg = "Local server process not found. Please ensure Antigravity IDE is running.";
        else if (reason === 'no_port') msg = "Server process found but no listening port detected.";
        else if (reason === 'workspace_mismatch') msg = "Server process found but Workspace ID mismatch.";

        vscode.window.showErrorMessage(msg, "Retry").then(sel => {
          if (sel === "Retry") {
            bootRetryCount = 0;
            bootServerConnection();
          }
        });
        hasShownNotification = true;
      }
    } catch (err) {
      errorLog(`Critical boot error: ${err}`);
      appViewModel.setConnectionStatus('failed', null);
    }
  }

  // Monitor workspace changes to re-check connection (e.g. if expected IDs change)
  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
    infoLog("Workspace folders changed, re-detecting server...");
    bootRetryCount = 0;
    bootServerConnection();
  }));

  // Initial boot
  bootServerConnection();
}

export function deactivate() { }

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
