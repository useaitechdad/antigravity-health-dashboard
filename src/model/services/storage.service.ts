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
 * StorageService: Manages persistent state and quota history
 */

import * as vscode from 'vscode';
import type { IStorageService } from './interfaces';
import type { QuotaHistoryPoint, UsageBucket, CachedTreeState } from '../../shared/utils/types';

const STORAGE_KEY = 'tfa.quotaHistory_v2';
const MAX_HISTORY_HOURS = 24 * 7; 

export class StorageService implements IStorageService {
    private history: QuotaHistoryPoint[] = [];
    private readonly globalState: vscode.Memento;

    constructor(globalState: vscode.Memento) {
        this.globalState = globalState;
        this.load();
    }

    async recordQuotaPoint(usage: Record<string, number>): Promise<void> {
        const point: QuotaHistoryPoint = { timestamp: Date.now(), usage };
        this.history.push(point);
        await this.save();
    }

    getRecentHistory(minutes: number): QuotaHistoryPoint[] {
        const cutoff = Date.now() - minutes * 60 * 1000;
        return this.history.filter(p => p.timestamp > cutoff);
    }

    calculateUsageBuckets(displayMinutes: number, bucketMinutes: number): UsageBucket[] {
        const now = Date.now();
        const startTime = now - displayMinutes * 60 * 1000;
        const buckets: UsageBucket[] = [];
        const bucketCount = Math.ceil(displayMinutes / bucketMinutes);
        const relevantHistory = this.getRecentHistory(displayMinutes + bucketMinutes);
        const allGroupIds = new Set<string>();
        relevantHistory.forEach(p => Object.keys(p.usage).forEach(k => allGroupIds.add(k)));

        for (let i = 0; i < bucketCount; i++) {
            const bucketStart = startTime + i * bucketMinutes * 60 * 1000;
            const bucketEnd = Math.min(bucketStart + bucketMinutes * 60 * 1000, now);
            const bucket: UsageBucket = { startTime: bucketStart, endTime: bucketEnd, items: [] };

            const pointsInBucket = relevantHistory.filter(p => p.timestamp >= bucket.startTime && p.timestamp < bucket.endTime);
            let startPoint: QuotaHistoryPoint | null = null;
            let endPoint: QuotaHistoryPoint | null = null;
            const pointsBefore = relevantHistory.filter(p => p.timestamp < bucket.startTime);

             if (pointsBefore.length > 0) {
                startPoint = pointsBefore[pointsBefore.length - 1];
                endPoint = pointsInBucket.length > 0 ? pointsInBucket[pointsInBucket.length - 1] : null;
            } else if (pointsInBucket.length >= 2) {
                startPoint = pointsInBucket[0];
                endPoint = pointsInBucket[pointsInBucket.length - 1];
            }

            if (startPoint && endPoint) {
                for (const groupId of allGroupIds) {
                    const startVal = startPoint.usage[groupId] ?? 0;
                    const endVal = endPoint.usage[groupId] ?? 0;
                     if (startPoint.usage[groupId] !== undefined && endPoint.usage[groupId] !== undefined) {
                        const used = Math.max(0, startVal - endVal);
                        if (used > 0) bucket.items.push({ groupId, usage: used });
                    }
                }
            }
            buckets.push(bucket);
        }
        return buckets;
    }

    getMaxUsage(buckets: UsageBucket[]): number {
        let max = 0;
        for (const bucket of buckets) {
            const total = bucket.items.reduce((s, i) => s + i.usage, 0);
            max = Math.max(max, total);
        }
        return max || 1;
    }

    getLastViewState<T>(): T | null { return this.globalState.get<T>('tfa.lastViewState') ?? null; }
    async setLastViewState<T>(state: T): Promise<void> { await this.globalState.update('tfa.lastViewState', state); }

    getLastTreeState(): CachedTreeState | null { return this.globalState.get<CachedTreeState>('tfa.lastTreeState') ?? null; }
    async setLastTreeState(state: CachedTreeState): Promise<void> { await this.globalState.update('tfa.lastTreeState', state); }

    getLastSnapshot<T>(): T | null {
        const cached = this.globalState.get<{ data: T; timestamp: number }>('tfa.lastSnapshot');
        if (!cached || cached.timestamp < (Date.now() - MAX_HISTORY_HOURS * 3600000)) return null;
        return cached.data;
    }
    async setLastSnapshot<T>(snapshot: T): Promise<void> {
        await this.globalState.update('tfa.lastSnapshot', { data: snapshot, timestamp: Date.now() });
    }

    getLastCacheWarningTime(): number { return this.globalState.get<number>('tfa.lastCacheWarningTime') ?? 0; }
    async setLastCacheWarningTime(time: number): Promise<void> { await this.globalState.update('tfa.lastCacheWarningTime', time); }

    getLastDisplayPercentage(): number { return this.globalState.get<number>('tfa.lastDisplayPercentage') ?? 0; }
    async setLastDisplayPercentage(pct: number): Promise<void> { await this.globalState.update('tfa.lastDisplayPercentage', pct); }

    getLastCacheSize(): number { return this.globalState.get<number>('tfa.lastCacheSize') ?? 0; }
    async setLastCacheSize(size: number): Promise<void> { await this.globalState.update('tfa.lastCacheSize', size); }

    getLastCacheDetails(): { brain: number; workspace: number } {
        return {
            brain: this.globalState.get<number>('tfa.lastBrainSize') ?? 0,
            workspace: this.globalState.get<number>('tfa.lastWorkspaceSize') ?? 0
        };
    }
    async setLastCacheDetails(brain: number, workspace: number): Promise<void> {
        await this.globalState.update('tfa.lastBrainSize', brain);
        await this.globalState.update('tfa.lastWorkspaceSize', workspace);
    }

    getLastPrediction(): { usageRate: number; runway: string; groupId: string } {
        return {
            usageRate: this.globalState.get<number>('tfa.lastUsageRate') ?? 0,
            runway: this.globalState.get<string>('tfa.lastRunway') ?? 'Stable',
            groupId: this.globalState.get<string>('tfa.lastPredictionGroup') ?? 'gemini'
        };
    }
    async setLastPrediction(usageRate: number, runway: string, groupId: string): Promise<void> {
        await this.globalState.update('tfa.lastUsageRate', usageRate);
        await this.globalState.update('tfa.lastRunway', runway);
        await this.globalState.update('tfa.lastPredictionGroup', groupId);
    }

    getLastUserInfo<T>(): T | null { return this.globalState.get<T>('tfa.lastUserInfo') ?? null; }
    async setLastUserInfo<T>(userInfo: T): Promise<void> { await this.globalState.update('tfa.lastUserInfo', userInfo); }

    getLastTokenUsage<T>(): T | null { return this.globalState.get<T>('tfa.lastTokenUsage') ?? null; }
    async setLastTokenUsage<T>(tokenUsage: T): Promise<void> { await this.globalState.update('tfa.lastTokenUsage', tokenUsage); }

    async clear(): Promise<void> {
        this.history = [];
        await this.globalState.update(STORAGE_KEY, []);
    }

    get count(): number { return this.history.length; }

    private load(): void {
        const data = this.globalState.get<QuotaHistoryPoint[]>(STORAGE_KEY);
        if (data && Array.isArray(data)) {
            const cutoff = Date.now() - MAX_HISTORY_HOURS * 3600000;
            this.history = data.filter(p => p.timestamp > cutoff);
        }
    }

    private async save(): Promise<void> {
        const cutoff = Date.now() - MAX_HISTORY_HOURS * 3600000;
        this.history = this.history.filter(p => p.timestamp > cutoff);
        await this.globalState.update(STORAGE_KEY, this.history);
    }
}
