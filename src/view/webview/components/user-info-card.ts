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
 * UserInfoCard - User info card component
 * Shows user email and subscription tier
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { UserInfoData } from '../types.js';

@customElement('user-info-card')
export class UserInfoCard extends LitElement {
  @property({ type: Object })
  user: UserInfoData | null = null;

  // Light DOM mode for consistent styling
  createRenderRoot() { return this; }

  render() {
    if (!this.user) {
      return html``;
    }

    const email = this.user.email || '';
    const tier = this.user.tier || '';

    return html`

      <style>
        .user-info-card {
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid var(--vscode-widget-border);
        }
        .user-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .user-profile-info {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
        }
        .user-email {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
        }
        .tier-badge {
          font-size: 0.75em;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: var(--vscode-badge-background);
          color: var(--vscode-badge-foreground);
          white-space: nowrap;
          font-weight: 600;
          text-transform: uppercase;
        }
      </style>
      <div class="user-info-card">
        <div class="user-header">
          <div class="user-profile-info">
            <i class="codicon codicon-account"></i>
            <span class="user-email">${email || 'User'}</span>
          </div>
          ${tier ? html`<span class="tier-badge">${tier}</span>` : ''}
        </div>
      </div>
    `;
  }
}
