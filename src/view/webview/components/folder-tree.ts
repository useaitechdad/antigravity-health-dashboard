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
 * FolderTree - Generic folder tree component (Light DOM)
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { FolderItem } from '../types.js';

import './folder-node.js';

@customElement('folder-tree')
export class FolderTree extends LitElement {
  @property({ type: String, reflect: true })
  title = '';

  @property({ type: String })
  stats = '';

  @property({ type: Boolean })
  collapsed = true;

  @property({ type: Boolean })
  loading = false;

  @property({ type: Array })
  folders: FolderItem[] = [];

  @property({ type: String })
  emptyText = 'No items found';

  @property({ type: Boolean })
  allowDelete = true;

  // Light DOM mode
  createRenderRoot() { return this; }

  private _onHeaderClick(): void {
    this.dispatchEvent(new CustomEvent('toggle', {
      bubbles: true,
      composed: true
    }));
  }

  protected render() {
    const chevronIcon = this.collapsed ? 'codicon-chevron-right' : 'codicon-chevron-down';

    return html`
      <style>
        .folder-tree-card {
          border: 1px solid var(--vscode-widget-border);
          border-radius: 4px;
          margin-bottom: 8px;
          overflow: hidden;
          background: var(--vscode-sideBar-background);
        }
        .section-header {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          cursor: pointer;
          background: var(--vscode-sideBarSectionHeader-background);
          color: var(--vscode-sideBarSectionHeader-foreground);
          gap: 6px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .section-header:hover {
          opacity: 0.9;
        }
        .section-title {
          flex: 1;
        }
        .section-stats {
          font-size: 10px;
          opacity: 0.7;
          font-weight: normal;
        }
        .tree-container {
          display: flex;
          flex-direction: column;
          padding: 4px 0;
          transition: max-height 0.2s ease-out;
        }
        .tree-container.hidden {
          display: none;
        }
        .loading, .empty-state {
          padding: 12px;
          text-align: center;
          opacity: 0.6;
          font-size: 12px;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      </style>
      <div class="folder-tree-card">
        <div class="section-header" @click=${this._onHeaderClick}>
          <i class="codicon ${chevronIcon}"></i>
          <span class="section-title">${this.title}</span>
          <span class="section-stats">${this.loading ? 'Loading...' : this.stats}</span>
        </div>
        <div class="tree-container ${this.collapsed ? 'hidden' : ''}">
          ${this._renderContent()}
        </div>
      </div>
    `;
  }

  private _renderContent() {
    if (this.loading) {
      return html`<div class="loading"><i class="codicon codicon-loading spin"></i></div>`;
    }

    if (this.folders.length === 0) {
      return html`<div class="empty-state">${this.emptyText}</div>`;
    }

    return this.folders.map(folder => html`
      <folder-node
        .folderId=${folder.id}
        .label=${folder.label}
        .size=${folder.size}
        .files=${folder.files}
        ?expanded=${folder.expanded}
        .allowDelete=${this.allowDelete}
      ></folder-node>
    `);
  }
}
