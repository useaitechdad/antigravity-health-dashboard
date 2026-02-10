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
 * Global Tooltip Manager
 * Handles creating and positioning a dedicated tooltip element.
 * Detached from CSS :after pseudo-elements for better control.
 */

export class TooltipManager {
    private _tooltipEl: HTMLElement;
    private _activeTarget: HTMLElement | null = null;
    private _hideTimeout: number | undefined;

    constructor() {
        this._tooltipEl = this._createTooltipElement();
        this._attachListeners();
    }

    private _createTooltipElement(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'global-tooltip';
        el.style.position = 'fixed';
        el.style.zIndex = '10000';
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.transition = 'opacity 0.15s ease';
        document.body.appendChild(el);
        return el;
    }

    private _attachListeners(): void {
        document.body.addEventListener('mouseover', this._handleMouseOver.bind(this));
        document.body.addEventListener('mouseout', this._handleMouseOut.bind(this));
    }

    private _handleMouseOver(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        const tooltipSource = target.closest('[data-tooltip]') as HTMLElement;

        if (!tooltipSource) {
            return;
        }

        // Determine content
        const content = tooltipSource.getAttribute('data-tooltip');
        if (!content) return;

        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
            this._hideTimeout = undefined;
        }

        this._activeTarget = tooltipSource;
        this._showTooltip(content, tooltipSource);
    }

    private _handleMouseOut(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        const tooltipSource = target.closest('[data-tooltip]') as HTMLElement;

        // Only hide if we are leaving the current target
        if (tooltipSource && tooltipSource === this._activeTarget) {
            this._hideTimeout = window.setTimeout(() => {
                this._hideTooltip();
            }, 50);
        }
    }

    private _showTooltip(content: string, target: HTMLElement): void {
        this._tooltipEl.textContent = content;
        this._tooltipEl.style.visibility = 'visible';
        this._tooltipEl.style.opacity = '1';

        // Position Calculation
        const rect = target.getBoundingClientRect();
        // Use document.documentElement for viewport width (ignoring scrollbars if possible)
        const viewportWidth = document.documentElement.clientWidth || document.body.clientWidth;

        // 1. Vertical Positioning: Above the element + gap
        // Use transform to shift up by own height
        const top = rect.top - 8;
        this._tooltipEl.style.top = `${top}px`;

        // 2. Horizontal Positioning: Always left-aligned with panel, full width allowed
        this._tooltipEl.style.left = '10px';
        this._tooltipEl.style.right = 'auto'; // Reset right
        this._tooltipEl.style.width = 'auto';  // Reset width
        this._tooltipEl.style.boxSizing = 'border-box';
        // Max width = viewport width - 20px (10px margin on each side)
        this._tooltipEl.style.maxWidth = `${viewportWidth - 20}px`;
        this._tooltipEl.style.transform = 'translateY(-100%)';
    }

    private _hideTooltip(): void {
        this._tooltipEl.style.opacity = '0';
        this._tooltipEl.style.visibility = 'hidden';
        this._activeTarget = null;
    }
}
