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
 * QuotaDashboard - Quota dashboard container component (Light DOM)
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { QuotaDisplayItem } from '../types.js';

import './quota-pie.js';
import './quota-bar.js';

@customElement('quota-dashboard')
export class QuotaDashboard extends LitElement {
  @property({ type: Array })
  quotas: QuotaDisplayItem[] | null = null;

  @property({ type: String })
  gaugeStyle: string = 'semi-arc';

  // Light DOM mode
  createRenderRoot() { return this; }

  protected render() {
    const items = this.quotas || [];
    
    if (this.gaugeStyle === 'bar') {
      return html`
        <div class="bars-container" style="display: flex; flex-direction: column; gap: 2px; padding: 8px 0;">
          ${items.map(item => html`
            <quota-bar .data=${item}></quota-bar>
          `)}
        </div>
      `;
    }

    return html`
      <style>
        .pies-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px; /* Tighter gap */
          padding: 8px 0;
        }
        quota-pie {
          display: block;
          width: 100%;
          min-width: 0;
        }
        /* Compact Tweaks */
        quota-pie .gauge-container {
          margin-bottom: 0 !important;
        }
        quota-pie .gauge-visual {
          width: 100%;
          max-width: 50px; /* Much smaller */
          margin: 0 auto;
        }
        quota-pie .gauge-value {
          font-size: 0.9em !important; /* Smaller text */
          margin-top: 2px !important;
        }
        quota-pie .gauge-label {
          font-size: 0.75em !important;
          margin-top: 2px !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        quota-pie .gauge-sub-label {
          display: none !important;
        }
      </style>
      <div class="pies-container">
        ${items.map(item => html`
          <quota-pie 
            label=${item.label}
            .data=${item}
            .color=${item.themeColor}
            .gaugeStyle=${this.gaugeStyle}
          ></quota-pie>
        `)}
      </div>
    `;
  }
}
