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
 * SidebarFooter - Footer component with recovery actions and links (Light DOM)
 */

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { VsCodeApi, WindowWithVsCode } from '../types.js';


@customElement('sidebar-footer')
export class SidebarFooter extends LitElement {
   @state()
   private _isCollapsed = false;

   connectedCallback() {
      super.connectedCallback();
      const cachedState = this._vscode?.getState();
      if (cachedState && cachedState.footerCollapsed !== undefined) {
         this._isCollapsed = !!cachedState.footerCollapsed;
      }
   }

   createRenderRoot() { return this; }

   private get _vscode(): VsCodeApi | undefined {
      return (window as unknown as WindowWithVsCode).vscodeApi;
   }

   private get _t() {
      return (window as unknown as WindowWithVsCode).__TRANSLATIONS__ || {};
   }

   private _postMessage(type: string): void {
      this._vscode?.postMessage({ type });
   }

   private _toggleCollapse(): void {
      this._isCollapsed = !this._isCollapsed;
      const currentState = this._vscode?.getState() || {};
      this._vscode?.setState({
         ...currentState,
         footerCollapsed: this._isCollapsed
      });
   }

   private _openUrl(url: string): void {
      this._vscode?.postMessage({ type: 'openUrl', path: url });
   }

   protected render() {
      return html`
      <!-- Main Action Card -->
      <style>
        .action-card {
           background: var(--vscode-sideBar-background);
           border-top: 1px solid var(--vscode-widget-border);
           margin-top: auto;
        }
        .action-header {
           padding: 8px 12px;
           font-size: 11px;
           text-transform: uppercase;
           opacity: 0.8;
           font-weight: 600;
           display: flex;
           justify-content: space-between;
           cursor: pointer;
        }
        .action-header:hover {
           opacity: 1;
        }
        .action-list {
           padding: 0 8px 8px 8px;
        }
        .action-item {
           display: flex;
           align-items: flex-start; /* Align top for multi-line text */
           padding: 6px 8px;
           gap: 10px;
           cursor: pointer;
           border-radius: 5px;
           color: var(--vscode-foreground);
           background: transparent;
           border: none;
           width: 100%;
           text-align: left;
           transition: background-color 0.1s;
        }
        .action-item:hover {
           background-color: var(--vscode-list-hoverBackground);
        }
        .action-icon {
           margin-top: 2px; /* Visual alignment with text */
           font-size: 16px;
           flex-shrink: 0;
        }
        .action-details {
           display: flex;
           flex-direction: column;
           gap: 2px;
           min-width: 0; /* Enable truncation in children */
        }
        .action-title {
           font-size: 13px;
           font-weight: 500;
        }
        .action-desc {
           font-size: 11px;
           opacity: 0.6;
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
        }
        .group-divider {
           height: 1px;
           background: var(--vscode-widget-border);
           margin: 4px 0;
           width: 100%;
        }
      </style>

      <!-- Main Action Card -->
      <div class="action-card">
        <!-- Sticky Header (Toggle) -->
        <div class="action-header" @click=${this._toggleCollapse}>
          <span>Tools & Recovery (v1.2.0)</span>
          <i class="codicon codicon-chevron-${this._isCollapsed ? 'up' : 'down'}"></i>
        </div>

        <div class="collapsible-wrapper ${this._isCollapsed ? 'collapsed' : ''}" style="${this._isCollapsed ? 'display: none;' : ''}">
          <div class="action-list">
             <!-- Configuration Group -->
             <button class="action-item" @click=${() => this._postMessage('openRules')}>
                <i class="codicon codicon-symbol-ruler action-icon"></i>
                <div class="action-details">
                   <span class="action-title">${this._t.rules || 'Rules'}</span>
                   <span class="action-desc">Edit Agent Instructions</span>
                </div>
             </button>
             
             <!-- Clear Cache -->
             <button class="action-item" @click=${() => this._postMessage('cleanCache')}>
                <i class="codicon codicon-trash action-icon"></i>
                <div class="action-details">
                   <span class="action-title">Clear Cache</span>
                   <span class="action-desc">Clean old tasks & history (keeps last 5)</span>
                </div>
             </button>

             <!-- Debug Info -->
             <button class="action-item" @click=${() => this._postMessage('runDiagnostics')}>
                <i class="codicon codicon-bug action-icon"></i>
                <div class="action-details">
                   <span class="action-title">Debug Info</span>
                   <span class="action-desc">Show raw quota & server data</span>
                </div>
             </button>

             <div class="group-divider"></div>

             <!-- Troubleshooting Group -->
             <button class="action-item" @click=${() => this._postMessage('restartLanguageServer')}>
                <i class="codicon codicon-sync action-icon"></i>
                <div class="action-details">
                   <span class="action-title">Restart Service</span>
                   <span class="action-desc">Reconnect Agent Connection</span>
                </div>
             </button>
             <button class="action-item" @click=${() => this._postMessage('reloadWindow')}>
                <i class="codicon codicon-window action-icon"></i>
                <div class="action-details">
                   <span class="action-title">Refresh Antigravity Code Window</span>
                   <span class="action-desc">Reload the entire window</span>
                </div>
             </button>
          </div>
        </div>
      </div>


    `;
   }
}
