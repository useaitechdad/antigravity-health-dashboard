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
 * Logger: Unified logging using VS Code Output Channel
 */

import * as vscode from 'vscode';
import type { QuotaSnapshot } from '../../model/types/entities'; // Will need to adjust imports if structure changes, but types.ts likely in different path?
// Wait, I put types in shared/utils/types.ts, so path is ./types
import type { QuotaSnapshot as QS } from './types'; 

let outputChannel: vscode.OutputChannel | null = null;
let isDebugMode = true;

export function initLogger(context: vscode.ExtensionContext): vscode.OutputChannel {
  outputChannel = vscode.window.createOutputChannel("Antigravity Health Panel");
  context.subscriptions.push(outputChannel);
  return outputChannel;
}

export function getLogger(): vscode.OutputChannel | null {
  return outputChannel;
}

export function setDebugMode(enabled: boolean): void {
  isDebugMode = enabled;
}

export function debugLog(message: string, data?: unknown): void {
  if (!isDebugMode || !outputChannel) return;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  outputChannel.appendLine(`[${timestamp}] DEBUG: ${message}`);
  if (data !== undefined) {
    outputChannel.appendLine(JSON.stringify(data, null, 2));
  }
}

export function infoLog(message: string): void {
  if (!outputChannel) return;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  outputChannel.appendLine(`[${timestamp}] INFO: ${message}`);
}

export function warnLog(message: string): void {
  if (!outputChannel) return;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  outputChannel.appendLine(`[${timestamp}] WARN: ${message}`);
}

export function errorLog(message: string, error?: unknown): void {
  if (!outputChannel) return;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  outputChannel.appendLine(`[${timestamp}] ERROR: ${message}`);
  if (error) {
    outputChannel.appendLine(String(error));
  }
}

export function logQuotaSnapshot(snapshot: QS): void {
  if (!isDebugMode || !outputChannel) return;
  // Simplified logging for lean version
  outputChannel.appendLine(`Quota Update: ${new Date().toISOString()}`);
  outputChannel.appendLine(JSON.stringify(snapshot, null, 2));
}

export function logQuotaParseError(error: string, rawData?: unknown): void {
    if (!isDebugMode || !outputChannel) return;
    outputChannel.appendLine(`Quota Parse Error: ${error}`);
    if (rawData) outputChannel.appendLine(JSON.stringify(rawData));
}

export function showLog(): void {
    outputChannel?.show();
}
