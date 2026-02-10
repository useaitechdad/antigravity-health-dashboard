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
 * QuotaBar - Linear progress bar component for quotas
 * 
 * Logic:
 * 100% -> Green
 * 60-99% -> Blue
 * 40-59% -> Amber
 * <40% -> Red
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { QuotaDisplayItem } from '../types.js';

@customElement('quota-bar')
export class QuotaBar extends LitElement {
  @property({ type: Object })
  data: QuotaDisplayItem | null = null;

  static styles = css`
    :host {
      display: block;
      margin-bottom: 8px;
    }
    .bar-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .label {
      font-size: 0.85em;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0.9;
    }
    .value {
      font-size: 0.8em;
      font-family: var(--vscode-editor-font-family);
      opacity: 0.8;
    }
    .progress-track {
      height: 6px;
      background: var(--vscode-progressBar-background);
      border-radius: 3px;
      overflow: hidden;
      width: 100%;
    }
    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease, background-color 0.3s ease;
    }
  `;

  private _getColor(percentage: number): string {
    if (percentage >= 100) return 'var(--vscode-charts-green, #89d185)';
    if (percentage >= 60) return 'var(--vscode-charts-blue, #3794ff)'; // Or a nice distinct blue
    if (percentage >= 40) return 'var(--vscode-charts-yellow, #cca700)';
    return 'var(--vscode-charts-red, #f14c4c)';
  }

  render() {
    if (!this.data) return html``;

    const { label, remaining, resetTime } = this.data;
    const color = this._getColor(remaining);
    
    // Ensure width is valid percentage
    const width = Math.max(0, Math.min(100, remaining));

    return html`
      <div class="bar-container" title="${label}: ${Math.round(remaining)}% remaining (Reset: ${resetTime})">
        <div class="header">
          <span class="label">${label}</span>
          <span class="value">${Math.round(remaining)}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${width}%; background-color: ${color};"></div>
        </div>
      </div>
    `;
  }
}
