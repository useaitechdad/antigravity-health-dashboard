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

import { html } from 'lit';
import { GaugeRendererProps } from '../types';

export const renderClassicDonut = ({ data, color, label }: GaugeRendererProps) => {
  const remaining = data.hasData ? data.remaining : 0;
  const valueStr = data.hasData ? remaining.toFixed(0) : 'N/A';
  const resetTime = data.resetTime || '';

  // Background ring color: low opacity adapted for themes
  const emptyColor = 'rgba(128, 128, 128, 0.15)';
  const gradient = `conic-gradient(${color} 0% ${remaining}%, ${emptyColor} ${remaining}% 100%)`;

  return html`
    <div class="gauge-container style-classic-donut">
      <div class="gauge-visual">
        <div class="pie-ring" style="background: ${gradient}"></div>
        <div class="gauge-center-text">
          <div class="gauge-value">
            ${valueStr}${data.hasData ? html`<span class="gauge-unit">%</span>` : ''}
          </div>
        </div>
      </div>
      <div class="gauge-info">
        <div class="gauge-label">${label}</div>
        <div class="gauge-reset-inner">${resetTime}</div>
        ${data.subLabel ? html`<div class="gauge-sub-label" title="${data.subLabel}">${data.subLabel}</div>` : ''}
      </div>
    </div>
  `;
};
