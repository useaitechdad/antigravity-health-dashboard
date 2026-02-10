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
 * Toolbar - Toolbar component (Light DOM)
 */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { WindowWithVsCode } from '../types.js';

@customElement('app-toolbar')
export class AppToolbar extends LitElement {
  // Light DOM mode
  createRenderRoot() { return this; }

  private _postMessage(type: string): void {
    const vscode = (window as unknown as WindowWithVsCode).vscodeApi;
    vscode?.postMessage({ type });
  }

  protected render() {
    const t = (window as unknown as WindowWithVsCode).__TRANSLATIONS__;
    return html`
      <div class="toolbar">
        <button class="toolbar-btn primary" 
                @click=${() => this._postMessage('openRules')}>
          <i class="codicon codicon-symbol-ruler"></i>
          ${t?.rules || 'Rules'}
        </button>
        <button class="toolbar-btn primary" 
                @click=${() => this._postMessage('openMcp')}>
          <i class="codicon codicon-plug"></i>
          ${t?.mcp || 'MCP'}
        </button>
        <button class="toolbar-btn primary" 
                @click=${() => this._postMessage('openBrowserAllowlist')}>
          <i class="codicon codicon-globe"></i>
          ${t?.allowlist || 'Allowlist'}
        </button>
      </div>
    `;
  }
}
