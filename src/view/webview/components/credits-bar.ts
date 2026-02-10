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
 * CreditsBar - Credits display bar component
 * Shows Prompt Consumption and Execution Consumption credits
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TokenUsageData, WindowWithVsCode } from '../types.js';

@customElement('credits-bar')
export class CreditsBar extends LitElement {
  @property({ type: Object })
  tokenUsage: TokenUsageData | null = null;

  // Light DOM mode for consistent styling
  createRenderRoot() { return this; }

  render() {
    if (!this.tokenUsage) {
      return html``;
    }

    const { promptCredits, flowCredits, formatted } = this.tokenUsage;
    const t = (window as unknown as WindowWithVsCode).__TRANSLATIONS__ || {};

    // If no data, don't render
    if (!promptCredits && !flowCredits) {
      return html``;
    }

    return html`
      <style>
        .credits-bar {
          padding: 8px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .credits-title {
          font-size: 0.75em;
          text-transform: uppercase;
          opacity: 0.7;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .credit-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .credit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9em;
        }
        .credit-label {
          font-weight: 500;
        }
        .credit-value {
          opacity: 0.8;
          font-family: var(--vscode-editor-font-family);
          font-size: 0.85em;
        }
        .credit-progress {
          height: 4px;
          background: var(--vscode-progressBar-background);
          border-radius: 2px;
          overflow: hidden;
        }
        .credit-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
      </style>
      <div class="credits-bar">
        <div class="credits-title">AI Credits</div>
        ${promptCredits ? html`
          <div class="credit-item" data-tooltip="${t.promptTooltip || 'Reasoning Credits'}">
            <div class="credit-header">
              <span class="credit-label">Prompt Consumption</span>
              <span class="credit-value">${formatted.promptAvailable}/${formatted.promptMonthly}</span>
            </div>
            <div class="credit-progress">
              <div class="credit-fill" style="width: ${promptCredits.remainingPercentage}%; background: ${this._getColor(promptCredits.remainingPercentage)};"></div>
            </div>
          </div>
        ` : ''}
        ${flowCredits ? html`
          <div class="credit-item" data-tooltip="${t.flowTooltip || 'Execution Credits'}">
             <div class="credit-header">
              <span class="credit-label">Execution Consumption</span>
              <span class="credit-value">${formatted.flowAvailable}/${formatted.flowMonthly}</span>
             </div>
            <div class="credit-progress">
              <div class="credit-fill" style="width: ${flowCredits.remainingPercentage}%; background: ${this._getColor(flowCredits.remainingPercentage)};"></div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _getColor(remainingPct: number): string {
    if (remainingPct <= 10) return 'var(--vscode-charts-red, #f14c4c)';
    if (remainingPct <= 30) return 'var(--vscode-charts-yellow, #cca700)';
    return 'var(--vscode-charts-green, #89d185)';
  }
}
