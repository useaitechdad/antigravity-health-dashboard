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

import { GaugeRenderer } from '../types';
import { renderSemiArc } from './semi-arc';
import { renderClassicDonut } from './classic-donut';

export const gaugeRenderers: Record<string, GaugeRenderer> = {
    'semi-arc': renderSemiArc,
    'classic-donut': renderClassicDonut,
};

export const getGaugeRenderer = (style: string): GaugeRenderer => {
    return gaugeRenderers[style] || renderSemiArc;
};
