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
 * StatusBarManager: Encapsulates status bar UI
 * 
 * Subscribes to AppViewModel for updates.
 */

import * as vscode from "vscode";
import { AppViewModel } from "../view-model/app.vm";
import { StatusBarData, StatusBarGroupItem } from "../view-model/types";
import { ConfigManager } from "../shared/config/config_manager";
import { formatBytes } from "../shared/utils/format";
import { TfaConfig } from "../shared/utils/types";

export class StatusBarManager implements vscode.Disposable {
    private item: vscode.StatusBarItem;
    private _disposables: vscode.Disposable[] = [];

    constructor(
        private readonly viewModel: AppViewModel,
        private readonly configManager: ConfigManager
    ) {
        this.item = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.item.command = "tfa.openPanel";

        // Subscribe to state changes
        this._disposables.push(
            this.viewModel.onStateChange(() => this.update()),
            this.viewModel.onQuotaChange(() => this.update()),
            this.viewModel.onCacheChange(() => this.update())
        );
    }

    showLoading(): void {
        this.item.text = "$(sync~spin) Antigravity";
        this.item.tooltip = "Antigravity Health Dashboard: Detecting...";
        this.item.show();
    }

    showError(message: string): void {
        this.item.text = "$(warning) Antigravity";
        this.item.tooltip = `Antigravity Health Dashboard: ${message}`;
        this.item.show();
    }

    update(): void {
        const config = this.configManager.getConfig();
        const appState = this.viewModel.getState();
        const statusData = this.viewModel.getStatusBarData();
        const cache = appState.cache;

        if (config["status.showQuota"] || config["status.showCache"]) {
            this.render(
                statusData,
                cache,
                config["status.showQuota"],
                config["status.showCache"],
                config["status.displayFormat"],
                config["status.scope"],
                config["status.warningThreshold"],
                config["status.criticalThreshold"],
                config["dashboard.includeSecondaryModels"]
            );
        } else {
            this.item.hide();
        }
    }

    private render(
        statusData: StatusBarData,
        cache: { totalSize: number } | null,
        showQuota: boolean,
        showCache: boolean,
        statusBarStyle: TfaConfig['status.displayFormat'],
        scope: TfaConfig['status.scope'],
        warningThreshold: number,
        criticalThreshold: number,
        includeSecondaryModels: boolean
    ): void {
        const parts: string[] = [];
        const tooltipRows: string[] = [];

        const visibleGroups = statusData.allGroups.filter(g =>
            includeSecondaryModels || g.id !== 'gpt'
        );

        if (showQuota) {
            if (scope === 'all' && visibleGroups.length > 0) {
                visibleGroups.forEach(group => {
                    const statusEmoji = this.getStatusEmoji(
                        group.percentage,
                        warningThreshold,
                        criticalThreshold
                    );
                    const displayText = this.formatQuotaDisplay(group, statusBarStyle);
                    parts.push(`${statusEmoji} ${displayText}`);
                });
            } else {
                const primary = statusData.primary;
                if (includeSecondaryModels || primary.id !== 'gpt') {
                    const statusEmoji = this.getStatusEmoji(
                        primary.percentage,
                        warningThreshold,
                        criticalThreshold
                    );
                    const displayText = this.formatQuotaDisplay(primary, statusBarStyle);
                    parts.push(`${statusEmoji} ${displayText}`);
                }
            }
            visibleGroups.forEach(g => {
                const emoji = this.getStatusEmoji(g.percentage, warningThreshold, criticalThreshold);
                tooltipRows.push(`| ${emoji} ${g.label} | ${g.percentage}% |  | ⏱ ${g.resetTime} |`);
            });
        }

        if (showCache && cache) {
            parts.push(formatBytes(cache.totalSize));
            tooltipRows.push(`| 💿 Cache | ${formatBytes(cache.totalSize)} |  | |`);
        }

        if (parts.length === 0) {
            this.item.text = "$(check) Antigravity"; 
        } else {
            this.item.text = parts.join(" | ");
        }

        if (tooltipRows.length > 0) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown('|  |  |  |  |\n');
            md.appendMarkdown('|:--|--:|:--:|:--|\n');
            md.appendMarkdown(tooltipRows.join('\n'));
            this.item.tooltip = md;
        } else {
            this.item.tooltip = "Antigravity Health Dashboard";
        }
        this.item.show();
    }

    private formatQuotaDisplay(
        group: StatusBarGroupItem,
        style: TfaConfig['status.displayFormat']
    ): string {
        switch (style) {
            case 'resetTime':
                return `${group.shortLabel} ${group.resetTime}`;
            case 'resetTimestamp':
                if (group.resetDate) {
                    const date = group.resetDate;
                    const now = new Date();
                    const isToday = now.getDate() === date.getDate() &&
                        now.getMonth() === date.getMonth() &&
                        now.getFullYear() === date.getFullYear();

                    const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
                    const timeStr = timeFormatter.format(date);

                    if (isToday) {
                        return `${group.shortLabel} ${timeStr}`;
                    } else {
                        const dateFormatter = new Intl.DateTimeFormat(undefined, { month: '2-digit', day: '2-digit' });
                        return `${group.shortLabel} ${dateFormatter.format(date)} ${timeStr}`;
                    }
                }
                return `${group.shortLabel} ${group.resetTime}`;
            case 'used':
                return `${group.shortLabel} ${100 - group.percentage}/100`;
            case 'remaining':
                return `${group.shortLabel} ${group.percentage}/100`;
            case 'percentage':
            default:
                return `${group.shortLabel} ${group.percentage}%`;
        }
    }

    private getStatusEmoji(
        percentage: number,
        warningThreshold: number,
        criticalThreshold: number
    ): string {
        if (percentage <= criticalThreshold) return '🔴';
        else if (percentage <= warningThreshold) return '🟡';
        return '🟢';
    }

    dispose(): void {
        this.item.dispose();
        this._disposables.forEach(d => d.dispose());
    }
}
