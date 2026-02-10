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
 * QuotaPie - Quota pie chart component (Light DOM)
 */

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { getGaugeRenderer } from './quota/renderers/index';
import { QuotaData } from './quota/types';

@customElement('quota-pie')
export class QuotaPie extends LitElement {
  @property({ type: Object }) data?: QuotaData;

  @property({ type: String }) color: string = '#007acc';

  @property({ type: String }) label: string = '';

  @property({ type: String }) gaugeStyle: string = 'semi-arc';

  // Light DOM mode
  createRenderRoot() { return this; }

  protected render() {
    const renderFunc = getGaugeRenderer(this.gaugeStyle);
    return renderFunc({
      data: {
        hasData: this.data?.hasData ?? false,
        remaining: this.data?.remaining ?? 0,
        resetTime: this.data?.resetTime ?? '',
        subLabel: this.data?.subLabel
      },
      color: this.color,
      label: this.label
    });
  }
}
