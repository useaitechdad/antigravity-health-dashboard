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
 * UsageChart - Usage bar chart component (Light DOM)
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { UsageChartData, WindowWithVsCode } from '../types.js';

@customElement('usage-chart')
export class UsageChart extends LitElement {
  @property({ type: Object })
  data: UsageChartData | null = null;

  // Light DOM mode
  createRenderRoot() { return this; }

  protected render() {
    if (!this.data || !this.data.buckets || this.data.buckets.length === 0) {
      return nothing;
    }

    const { maxUsage, interval, prediction } = this.data;
    const t = (window as unknown as WindowWithVsCode).__TRANSLATIONS__;

    return html`
      <div class="usage-chart">
        <div class="usage-summary">
          <div class="usage-metric">
            <span class="metric-label">Peak Usage (Last ${this.data.displayMinutes} min):</span>
            <span class="metric-value">${maxUsage.toFixed(1)}%</span>
          </div>
          
          <div class="usage-metric">
            <span class="metric-label">Sampling Interval:</span>
            <span class="metric-value">${interval}s per data point</span>
          </div>

          ${prediction && prediction.usageRate > 0 ? html`
            <div class="usage-metric">
              <span class="metric-label">🔥 Current Burn Rate:</span>
              <span class="metric-value">${prediction.usageRate.toFixed(1)}% per hour</span>
            </div>
            <div class="usage-metric">
              <span class="metric-label">⏱️ Estimated Runway:</span>
              <span class="metric-value">${prediction.runway} until quota exhausted</span>
            </div>
          ` : (prediction ? html`
            <div class="usage-metric">
              <span class="metric-label">⏱️ Status:</span>
              <span class="metric-value">Stable (no significant usage detected)</span>
            </div>
          ` : nothing)}
        </div>
      </div>
    `;
  }
}
