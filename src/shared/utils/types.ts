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
 * Common type definitions
 * Centralized management of all core interfaces to avoid type scattering
 */

// ==================== Quota Related ====================

export interface ModelQuotaInfo {
  label: string;
  modelId: string;
  remainingPercentage: number;
  isExhausted: boolean;
  resetTime: Date;
  timeUntilReset: string;
}

export interface PromptCreditsInfo {
  available: number;
  monthly: number;
  usedPercentage: number;
  remainingPercentage: number;
}

export interface FlowCreditsInfo {
  available: number;
  monthly: number;
  usedPercentage: number;
  remainingPercentage: number;
}

export interface TokenUsageInfo {
  promptCredits?: PromptCreditsInfo;
  flowCredits?: FlowCreditsInfo;
  totalAvailable: number;
  totalMonthly: number;
  overallRemainingPercentage: number;
}

export interface QuotaSnapshot {
  timestamp: Date;
  promptCredits?: PromptCreditsInfo;
  flowCredits?: FlowCreditsInfo;
  tokenUsage?: TokenUsageInfo;
  userInfo?: UserInfo;
  models: ModelQuotaInfo[];
}

export interface UserInfo {
  name?: string;
  email?: string;
  tier?: string;
  tierId?: string;
  tierDescription?: string;
  planName?: string;
  teamsTier?: string;
  upgradeUri?: string;
  upgradeText?: string;
  browserEnabled?: boolean;
  knowledgeBaseEnabled?: boolean;
  canBuyMoreCredits?: boolean;
  monthlyPromptCredits?: number;
  availablePromptCredits?: number;
}

// ==================== Process Detection Related ====================

export interface LanguageServerInfo {
  port: number;
  csrfToken: string;
}

export type Protocol = "https" | "http";

export interface CommunicationAttempt {
  pid: number;
  port: number;
  hostname: string;
  statusCode: number;
  error?: string;
  protocol?: 'https' | 'http';
  portSource?: 'cmdline' | 'netstat';
}

export interface DetectOptions {
  attempts?: number;
  baseDelay?: number;
  verbose?: boolean;
}

export interface ProcessInfo {
  pid: number;
  ppid?: number;
  extensionPort: number;
  csrfToken: string;
  workspaceId?: string;
}

export interface PlatformStrategy {
  getProcessListCommand(processName: string): string;
  parseProcessInfo(stdout: string): ProcessInfo[] | null;
  getPortListCommand(pid: number): string;
  parseListeningPorts(stdout: string, pid: number): number[];
  getProcessListByKeywordCommand?(keyword: string): string;
  getFallbackProcessListCommand?(): string;
  getDiagnosticCommand(): string;
  getTroubleshootingTips(): string[];
}

// ==================== Cache & Storage Related ====================

export interface BrainTask {
  id: string;
  label: string;
  path: string;
  size: number;
  fileCount: number;
  createdAt: number;
}

export interface CodeContext {
  id: string;
  name: string;
  size: number;
}

export interface FileItem {
  name: string;
  path: string;
  size?: number;
  type?: 'file' | 'directory';
}

// NEW: Storage Item for Rules/Skills/Workflows
export interface StorageItem {
  name: string;
  type: 'rule' | 'workflow' | 'skill';
  path: string;
  size: number;
  fileCount: number;
}

export interface CacheInfo {
  brainSize: number;
  conversationsSize: number;
  codeContextsSize: number;
  totalSize: number;
  brainCount: number;
  conversationsCount: number;
  brainTasks: BrainTask[];
  conversations: BrainTask[];
  codeContexts: CodeContext[];
  // NEW: Custom storage items
  storageItems?: StorageItem[];
}

// ==================== History & Charts ====================

export interface BucketItem {
  groupId: string;
  usage: number;
  color?: string;
}

export interface UsageBucket {
  startTime: number;
  endTime: number;
  items: BucketItem[];
}

export interface QuotaHistoryPoint {
  timestamp: number;
  usage: Record<string, number>;
}

export interface CachedTreeState {
  brainTasks: { id: string; title: string; size: string; lastModified: number }[];
  codeContexts: { id: string; name: string; size: string }[];
  brainExpanded: boolean;
  contextsExpanded: boolean;
  conversationsExpanded: boolean;
  resourcesExpanded: boolean;
  lastUpdated: number;
}

// ==================== Configuration Related ====================

export interface TfaConfig {
  // ===== 1. Dashboard Settings =====
  "dashboard.gaugeStyle": "semi-arc" | "classic-donut" | "bar";
  "dashboard.viewMode": "groups" | "models";
  "dashboard.historyRange": number;
  "dashboard.refreshRate": number;
  "dashboard.includeSecondaryModels": boolean;
  "dashboard.showCredits": boolean;
  "dashboard.showAbsoluteTime": boolean;
  "dashboard.uiScale": number;

  // ===== 2. Status Bar Settings =====
  "status.showQuota": boolean;
  "status.showCache": boolean;
  "status.displayFormat": "percentage" | "resetTime" | "resetTimestamp" | "used" | "remaining";
  "status.warningThreshold": number;
  "status.criticalThreshold": number;
  "status.scope": "primary" | "all";

  // ===== 3. Cache Settings =====
  "cache.autoClean": boolean;
  "cache.autoCleanKeepCount": number;
  "cache.scanInterval": number;
  "cache.warningSize": number;
  "cache.hideEmptyFolders": boolean;

  // ===== 4. System Settings (Automation Removed) =====
  "system.serverHost": string;
  "system.apiPath": string;
  "system.debugMode": boolean;
}

// ==================== Callback Types ====================
export type QuotaUpdateCallback = (snapshot: QuotaSnapshot) => void;
export type ErrorCallback = (error: Error) => void;
