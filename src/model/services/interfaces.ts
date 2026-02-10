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

import { 
    QuotaSnapshot, 
    LanguageServerInfo, 
    QuotaUpdateCallback, 
    ErrorCallback,
    CacheInfo, 
    BrainTask, 
    CodeContext, 
    FileItem,
    UsageBucket,
    CachedTreeState
} from "../../shared/utils/types";

export interface IQuotaService {
  setServerInfo(info: LanguageServerInfo): void;
  fetchQuota(): Promise<QuotaSnapshot | null>;
  onUpdate(callback: QuotaUpdateCallback): void;
  onError(callback: ErrorCallback): void;
}

export interface ICacheService {
    getCacheInfo(): Promise<CacheInfo>;
    getBrainTasks(): Promise<BrainTask[]>;
    getCodeContexts(): Promise<CodeContext[]>;
    getTaskFiles(taskId: string): Promise<FileItem[]>;
    getContextFiles(contextId: string): Promise<FileItem[]>;
    getResourceFiles(resourcePath: string): Promise<FileItem[]>;
    deleteTask(taskId: string): Promise<void>;
    deleteContext(contextId: string): Promise<void>;
    deleteFile(filePath: string): Promise<void>;
    cleanCache(keepCount?: number): Promise<{ deletedCount: number, freedBytes: number }>;
}

export interface IStorageService {
    recordQuotaPoint(usage: Record<string, number>): Promise<void>;
    calculateUsageBuckets(displayMinutes: number, bucketMinutes: number): UsageBucket[];
    
    setLastTreeState(state: CachedTreeState): Promise<void>;
    getLastTreeState(): CachedTreeState | null;

    setLastViewState<T>(state: T): Promise<void>;
    getLastViewState<T>(): T | null;

    setLastSnapshot<T>(snapshot: T): Promise<void>;
    getLastSnapshot<T>(): T | null;

    setLastDisplayPercentage(pct: number): Promise<void>;
    getLastDisplayPercentage(): number;

    setLastPrediction(usageRate: number, runway: string, groupId: string): Promise<void>;
    getLastPrediction(): { usageRate: number; runway: string; groupId: string };

    setLastUserInfo<T>(userInfo: T): Promise<void>;
    getLastUserInfo<T>(): T | null;

    setLastTokenUsage<T>(tokenUsage: T): Promise<void>;
    getLastTokenUsage<T>(): T | null;

    setLastCacheSize(size: number): Promise<void>;
    getLastCacheSize(): number;
    
    // Config/State getters/setters as needed by AppViewModel
}
