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
 * ViewModel Layer - Type Definitions
 * 
 * Types for ViewModel state and View consumption.
 * These types represent the UI-ready data structures.
 */

import type { UsageBucket, BucketItem } from '../model/types/entities';

// ==================== Quota View State ====================

export interface QuotaGroupState {
    id: string;
    label: string;
    remaining: number;
    resetTime: string;
    themeColor: string;
    hasData: boolean;
}

export interface QuotaDisplayItem {
    id: string;
    label: string;
    type: 'group' | 'model';
    remaining: number;
    resetTime: string;
    hasData: boolean;
    themeColor: string;
    subLabel?: string;
}

export interface UsageChartData {
    buckets: UsageBucket[];
    maxUsage: number;
    groupColors: Record<string, string>;
    displayMinutes?: number;
    interval?: number;
    prediction?: {
        groupId: string;
        groupLabel: string;
        usageRate: number;
        runway: string;
        remaining: number;
    };
}

export interface QuotaViewState {
    groups: QuotaGroupState[];
    activeGroupId: string;
    chart: UsageChartData;
    displayItems: QuotaDisplayItem[];
    lastUpdated?: number;
}

// ==================== Cache View State ====================

export interface CacheViewState {
    totalSize: number;
    brainSize: number;
    conversationsSize: number;
    brainCount: number;
    formattedTotal: string;
    formattedBrain: string;
    formattedConversations: string;
}

// ==================== Tree View State ====================

export interface TreeFileItem {
    name: string;
    path: string;
}

export interface TreeFolderItem {
    id: string;
    label: string;
    size: string;
    lastModified?: number;
    expanded: boolean;
    loading: boolean;
    files: TreeFileItem[];
}

export interface TreeSectionState {
    expanded: boolean;
    folders: TreeFolderItem[];
}

export interface TreeViewState {
    tasks: TreeSectionState;
    contexts: TreeSectionState;
    resources: TreeSectionState;
}

// ==================== StatusBar Data ====================

export interface StatusBarGroupItem {
    id: string;
    label: string;
    shortLabel: string;
    percentage: number;
    resetTime: string;
    resetDate?: Date; 
    color: string;
    usageRate: number;
    runway: string;
}

export interface StatusBarData {
    primary: StatusBarGroupItem;
    allGroups: StatusBarGroupItem[];
}

// ==================== User View State ====================

export interface UserViewState {
    name?: string;
    email?: string;
    tier?: string;
    tierDescription?: string;
    planName?: string;
    browserEnabled?: boolean;
    knowledgeBaseEnabled?: boolean;
    upgradeUri?: string;
    upgradeText?: string;
}

// ==================== Token Usage View State ====================

export interface TokenUsageViewState {
    promptCredits?: {
        available: number;
        monthly: number;
        usedPercentage: number;
        remainingPercentage: number;
    };
    flowCredits?: {
        available: number;
        monthly: number;
        usedPercentage: number;
        remainingPercentage: number;
    };
    totalAvailable: number;
    totalMonthly: number;
    overallRemainingPercentage: number;
    formatted: {
        promptAvailable: string;
        promptMonthly: string;
        flowAvailable: string;
        flowMonthly: string;
        totalAvailable: string;
        totalMonthly: string;
    };
}

// ==================== Sidebar Data ====================

export interface SidebarData {
    quotas: QuotaDisplayItem[];
    chart: UsageChartData;
    cache: CacheViewState;
    user?: UserViewState;
    tokenUsage?: TokenUsageViewState;
    tasks: TreeSectionState;
    contexts: TreeSectionState;
    resources: TreeSectionState;
    connectionStatus: ConnectionStatus;
    failureReason?: 'no_process' | 'ambiguous' | 'no_port' | 'auth_failed' | 'workspace_mismatch' | null;
    gaugeStyle?: string;
    showUserInfoCard?: boolean;
    showCredits?: boolean;
    uiScale?: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'failed' | 'detecting';

// ==================== App State ====================

export interface AppState {
    quota: QuotaViewState;
    cache: CacheViewState;
    user?: UserViewState;
    tokenUsage?: TokenUsageViewState;
    tree: TreeViewState;
    connectionStatus: ConnectionStatus;
    failureReason?: 'no_process' | 'ambiguous' | 'no_port' | 'auth_failed' | 'workspace_mismatch' | null;
    lastUpdated: number;
}

export type { UsageBucket, BucketItem };

export interface WebviewMessage {
    type: string;
    taskId?: string;
    contextId?: string;
    folderId?: string;
    path?: string;
}
