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
 * QuotaService: Handles quota API calls to Antigravity Language Server
 */

import { retry } from '../../shared/utils/retry';
import { httpRequest } from '../../shared/utils/http_client';
import { logQuotaParseError, warnLog } from '../../shared/utils/logger';
import type { IQuotaService } from './interfaces';
import type { ConfigManager } from '../../shared/config/config_manager';
import type {
    ModelQuotaInfo,
    PromptCreditsInfo,
    FlowCreditsInfo,
    TokenUsageInfo,
    QuotaSnapshot,
    QuotaUpdateCallback,
    ErrorCallback,
    LanguageServerInfo,
    UserInfo,
} from '../../shared/utils/types';

const HTTP_TIMEOUT_MS = 12000;

export class QuotaService implements IQuotaService {
    private serverInfo: LanguageServerInfo | null = null;
    private configManager: ConfigManager;
    private updateCallback?: QuotaUpdateCallback;
    private errorCallback?: ErrorCallback;
    public parsingError: string | null = null;

    constructor(configManager: ConfigManager) {
        this.configManager = configManager;
    }

    setServerInfo(info: LanguageServerInfo): void {
        this.serverInfo = info;
    }

    onUpdate(callback: QuotaUpdateCallback): void {
        this.updateCallback = callback;
    }

    onError(callback: ErrorCallback): void {
        this.errorCallback = callback;
    }

    async fetchQuota(): Promise<QuotaSnapshot | null> {
        this.parsingError = null;
        if (!this.serverInfo) {
            warnLog("Cannot fetch quota: server info not available.");
            return null;
        }

        try {
            const snapshot = await retry(() => this.doFetchQuota(), {
                attempts: 2,
                baseDelay: 1000,
                backoff: 'fixed',
            });

            if (snapshot) {
                this.updateCallback?.(snapshot);
            }
            return snapshot;
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.errorCallback?.(err);
            return null;
        }
    }

    private async doFetchQuota(): Promise<QuotaSnapshot | null> {
        const config = this.configManager.getConfig();
        const apiPath = config["system.apiPath"];

        const response = await this.request<ServerUserStatusResponse>(
            apiPath,
            {
                metadata: {
                    ideName: 'antigravity',
                    extensionName: 'antigravity',
                    locale: 'en',
                },
            }
        );

        if (response.statusCode === 401 || response.statusCode === 403) {
            this.parsingError = `AUTH_FAILED_${response.statusCode}`;
            return null;
        }

        const data = response.data;
        if (!data || !data.userStatus) {
            this.parsingError = response.statusCode !== 200
                ? `HTTP_ERROR_${response.statusCode}`
                : 'Invalid Response Structure';
            logQuotaParseError(this.parsingError, data);
            return null;
        }

        try {
            return this.parseResponse(data);
        } catch (e) {
            this.parsingError = 'Response Parsing Failed';
            logQuotaParseError(this.parsingError, data);
            throw e;
        }
    }

    protected async request<T>(path: string, body: object) {
        if (!this.serverInfo) {
            throw new Error("Server info not set");
        }

        const config = this.configManager.getConfig();
        const host = config["system.serverHost"];

        // SECURITY: Enforce localhost for quota requests 
        // (already enforced in http_client, but explicit here via config default)
        
        return await httpRequest<T>({
            hostname: host,
            port: this.serverInfo.port,
            path,
            method: 'POST',
            headers: {
                'Connect-Protocol-Version': '1',
                'X-Codeium-Csrf-Token': this.serverInfo.csrfToken,
            },
            body: JSON.stringify(body),
            timeout: HTTP_TIMEOUT_MS,
            allowFallback: true,
        });
    }

    private parseResponse(data: ServerUserStatusResponse): QuotaSnapshot {
        const userStatus = data.userStatus;
        const planInfo = userStatus.planStatus?.planInfo;
        const availableCredits = userStatus.planStatus?.availablePromptCredits;
        const availableFlowCredits = userStatus.planStatus?.availableFlowCredits;

        // Parse Prompt Credits
        let promptCredits: PromptCreditsInfo | undefined;
        if (planInfo && availableCredits !== undefined) {
            const monthly = Number(planInfo.monthlyPromptCredits);
            const available = Number(availableCredits);
            if (monthly > 0) {
                promptCredits = {
                    available,
                    monthly,
                    usedPercentage: ((monthly - available) / monthly) * 100,
                    remainingPercentage: (available / monthly) * 100,
                };
            }
        }

        // Parse Flow Credits
        let flowCredits: FlowCreditsInfo | undefined;
        if (planInfo?.monthlyFlowCredits && availableFlowCredits !== undefined) {
            const monthly = Number(planInfo.monthlyFlowCredits);
            const available = Number(availableFlowCredits);
            if (monthly > 0) {
                flowCredits = {
                    available,
                    monthly,
                    usedPercentage: ((monthly - available) / monthly) * 100,
                    remainingPercentage: (available / monthly) * 100,
                };
            }
        }

        // Build combined token usage info
        let tokenUsage: TokenUsageInfo | undefined;
        if (promptCredits || flowCredits) {
            const totalAvailable = (promptCredits?.available || 0) + (flowCredits?.available || 0);
            const totalMonthly = (promptCredits?.monthly || 0) + (flowCredits?.monthly || 0);
            tokenUsage = {
                promptCredits,
                flowCredits,
                totalAvailable,
                totalMonthly,
                overallRemainingPercentage: totalMonthly > 0 ? (totalAvailable / totalMonthly) * 100 : 0,
            };
        }

        // Extract user subscription info
        const userTier = userStatus.userTier;
        const userInfo: UserInfo | undefined = userStatus.name || userTier ? {
            name: userStatus.name,
            email: userStatus.email,
            tier: userTier?.name || planInfo?.teamsTier,
            tierId: userTier?.id,
            tierDescription: userTier?.description,
            planName: planInfo?.planName,
            teamsTier: planInfo?.teamsTier,
            upgradeUri: userTier?.upgradeSubscriptionUri,
            upgradeText: userTier?.upgradeSubscriptionText,
            browserEnabled: planInfo?.browserEnabled,
            knowledgeBaseEnabled: planInfo?.knowledgeBaseEnabled,
            canBuyMoreCredits: planInfo?.canBuyMoreCredits,
            monthlyPromptCredits: planInfo?.monthlyPromptCredits,
            availablePromptCredits: availableCredits,
        } : undefined;

        const rawModels = userStatus.cascadeModelConfigData?.clientModelConfigs || [];
        const models: ModelQuotaInfo[] = rawModels
            .filter((m: RawModelConfig) => m.quotaInfo)
            .map((m: RawModelConfig) => {
                const now = new Date();
                let resetTime = new Date(m.quotaInfo!.resetTime);

                if (Number.isNaN(resetTime.getTime())) {
                    resetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                }

                const diff = resetTime.getTime() - now.getTime();
                const remainingFraction = m.quotaInfo!.remainingFraction ?? 0;

                return {
                    label: m.label,
                    modelId: m.modelOrAlias?.model || 'unknown',
                    remainingPercentage: remainingFraction * 100,
                    isExhausted: remainingFraction === 0,
                    resetTime,
                    timeUntilReset: this.formatTime(diff),
                };
            });

        return { timestamp: new Date(), promptCredits, flowCredits, tokenUsage, userInfo, models };
    }

    private formatTime(ms: number): string {
        if (ms <= 0) return 'Ready';
        const mins = Math.ceil(ms / 60000);
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return `${days}d ${remainingHours}h`;
        }
        return `${hours}h ${mins % 60}m`;
    }
}

interface RawModelConfig {
    label: string;
    modelOrAlias?: { model: string };
    quotaInfo?: {
        remainingFraction?: number;
        resetTime: string;
    };
}

interface ServerUserStatusResponse {
    userStatus: {
        name?: string;
        email?: string;
        userTier?: {
            id?: string;
            name?: string;
            description?: string;
            upgradeSubscriptionUri?: string;
            upgradeSubscriptionText?: string;
        };
        planStatus?: {
            planInfo: {
                monthlyPromptCredits: number;
                monthlyFlowCredits?: number;
                planName?: string;
                teamsTier?: string;
                browserEnabled?: boolean;
                knowledgeBaseEnabled?: boolean;
                canBuyMoreCredits?: boolean;
            };
            availablePromptCredits: number;
            availableFlowCredits?: number;
        };
        cascadeModelConfigData?: {
            clientModelConfigs: RawModelConfig[];
        };
    };
}
