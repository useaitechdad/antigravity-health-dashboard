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
 * Webview entry file
 * 
 * Import main app component to trigger all custom element registrations
 */

console.log('Webview script loaded');
import './components/sidebar-app.js';

// Export types for external use
export * from './types.js';

// Global context menu disable
document.addEventListener('contextmenu', event => event.preventDefault());

// Smart Tooltip Positioning System
document.addEventListener('mouseover', (event) => {
    const target = event.target as HTMLElement;
    const tooltipElement = target.closest('[data-tooltip]') as HTMLElement;

    if (tooltipElement) {
        const rect = tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const threshold = 180; // Approximate max width of tooltip

        // Check right edge collision
        // If element is close to the right edge (< 180px space), force alignment to RIGHT (tooltip grows left)
        if (rect.right + threshold > viewportWidth) {
            tooltipElement.setAttribute('data-placement', 'right');
        }
        // Check left edge collision
        // If element is close to the left edge (< 180px space), force alignment to LEFT (tooltip grows right)
        else if (rect.left - threshold < 0) {
            tooltipElement.setAttribute('data-placement', 'left');
        }
        // Otherwise clear any placement override (default center)
        else {
            tooltipElement.removeAttribute('data-placement');
        }
    }
});
