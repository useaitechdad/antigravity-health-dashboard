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
import { getArcPath, getArcLength } from '../../../../../shared/utils/gauge_math';

export const renderSemiArc = ({ data, color, label }: GaugeRendererProps) => {
  const remaining = data.hasData ? data.remaining : 0;
  const valueStr = data.hasData ? remaining.toFixed(0) : 'N/A';
  const resetTime = data.resetTime || '';

  // Precision Arcs at Center 50,40
  const fillArcLength = getArcLength(36, 210);
  const dashOffset = fillArcLength - (remaining / 100) * fillArcLength;

  const getPath = (r: number) => getArcPath({
    centerX: 50,
    centerY: 40,
    radius: r,
    startAngle: 195,
    endAngle: -15
  });

  return html`
    <div class="gauge-container style-semi-arc">
      <div class="gauge-visual">
        <svg viewBox="0 0 100 70" class="gauge-svg">
          <path class="gauge-track-bg" d="${getPath(43)}" />
          <path class="gauge-track-fg" d="${getPath(43)}" />
          <path class="gauge-separator" d="${getPath(39.5)}" />
          <path class="gauge-separator" d="${getPath(32.5)}" />
          <path class="gauge-track-bg" d="${getPath(29)}" />
          <path class="gauge-track-fg" d="${getPath(29)}" />
          <path class="gauge-fill" d="${getPath(36)}" 
            style="stroke: ${color}; color: ${color}; stroke-dasharray: ${fillArcLength}; stroke-dashoffset: ${dashOffset};"
          />
        </svg>
        <div class="gauge-center-text">
          <div class="gauge-value">${valueStr}<span class="gauge-unit">%</span></div>
          <div class="gauge-reset-inner">${resetTime}</div>
        </div>
      </div>

      <div class="gauge-info">
        <div class="gauge-label">${label}</div>
        ${data.subLabel ? html`<div class="gauge-sub-label" title="${data.subLabel}">${data.subLabel}</div>` : ''}
      </div>
    </div>
  `;
};
