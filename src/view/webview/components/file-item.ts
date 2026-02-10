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
 * FileItem - File item component (Light DOM)
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getFileIcon, getFileIconColorClass } from '../styles/shared.js';

@customElement('file-item')
export class FileItemComponent extends LitElement {
  @property({ type: String })
  name = '';

  @property({ type: String })
  path = '';

  @property({ type: Boolean, reflect: true })
  selected = false;

  // Light DOM mode
  createRenderRoot() { return this; }

  private _onClick(e: Event): void {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('file-click', {
      bubbles: true,
      composed: true,
      detail: { path: this.path }
    }));
  }

  private _onDelete(e: Event): void {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('file-delete', {
      bubbles: true,
      composed: true,
      detail: { path: this.path }
    }));
  }

  private _getIconClass(): string {
    const iconClass = getFileIcon(this.name);
    const colorClass = getFileIconColorClass(iconClass);
    return `codicon ${iconClass} file-icon ${colorClass}`;
  }

  protected render() {
    const selectedClass = this.selected ? 'selected' : '';

    return html`
      <div class="file ${selectedClass}" @click=${this._onClick}>
        <i class="${this._getIconClass()}"></i>
        <span class="file-name">${this.name}</span>
        <div class="file-actions">
          <button class="file-action-btn" title="Delete File" @click=${this._onDelete}>
            <i class="codicon codicon-trash"></i>
          </button>
        </div>
      </div>
    `;
  }
}
