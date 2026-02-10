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
 * FolderNode - Folder node component (Light DOM)
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { FileItem } from '../types.js';

import './file-item.js';

@customElement('folder-node')
export class FolderNode extends LitElement {
  @property({ type: String })
  folderId = '';

  @property({ type: String })
  label = '';

  @property({ type: String })
  size = '';

  @property({ type: Array })
  files: FileItem[] = [];

  @property({ type: Boolean })
  expanded = false;

  @property({ type: Boolean })
  allowDelete = true;

  // Light DOM mode
  createRenderRoot() { return this; }

  private _onFolderClick(): void {
    this.dispatchEvent(new CustomEvent('folder-toggle', {
      bubbles: true,
      composed: true,
      detail: { folderId: this.folderId }
    }));
  }

  private _onDelete(e: Event): void {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('folder-delete', {
      bubbles: true,
      composed: true,
      detail: { folderId: this.folderId }
    }));
  }

  protected render() {
    const chevronIcon = this.expanded ? 'codicon-chevron-down' : 'codicon-chevron-right';
    const folderIcon = this.expanded ? 'codicon-folder-opened' : 'codicon-folder';

    return html`
      <style>
        :host {
          display: block;
          font-family: var(--vscode-font-family);
        }
        .folder {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          cursor: pointer; /* No extra padding needed for left icon */
          border-radius: 4px;
          transition: background-color 0.1s;
          gap: 6px;
          position: relative;
        }
        .folder:hover {
          background-color: var(--vscode-list-hoverBackground);
        }
        .codicon {
          font-size: 14px;
          flex-shrink: 0;
        }
        .folder-icon {
          color: var(--vscode-charts-blue, #3794ff);
        }
        .folder-label {
          flex: 1; /* Take available width */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 13px;
          line-height: 1.4;
        }
        .folder-size {
          font-size: 11px;
          opacity: 0.5;
          margin-right: 4px;
          flex-shrink: 0;
        }
        .folder-delete {
          opacity: 1;
          cursor: pointer;
          font-size: 14px;
          margin-right: 4px;
          transition: transform 0.1s;
          display: inline-block; /* For transform */
          line-height: 1;
          filter: grayscale(100%); /* Start gray/dim */
        }
        .folder-delete:hover {
          transform: scale(1.2);
          filter: none; /* Full color on hover */
        }
        .files-container {
          padding-left: 20px;
          border-left: 1px solid var(--vscode-tree-indentGuidesStroke);
          margin-left: 10px;
        }
      </style>
      <div class="folder" @click=${this._onFolderClick}>
        <i class="codicon ${chevronIcon}"></i>
        ${this.allowDelete ? html`<span class="folder-delete" @click=${this._onDelete} title="Delete">🗑️</span>` : nothing}
        <i class="codicon ${folderIcon} folder-icon"></i>
        <span class="folder-label" title="${this.folderId}">${this.label}</span>
        <span class="folder-size">${this.size}</span>
      </div>
      ${this.expanded ? html`
        <div class="files-container">
          ${this.files.length > 0
          ? this.files.map(file => html`
                <file-item 
                  .name=${file.name}
                  .path=${file.path}
                ></file-item>
              `)
          : nothing
        }
        </div>
      ` : nothing}
    `;
  }
}
