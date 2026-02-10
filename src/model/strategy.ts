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
 * Quota Strategy Manager
 * 
 * Logic for grouping models and determining display properties based on configuration.
 */

import strategyData from '../shared/config/quota_strategy.json';

export interface ModelDefinition {
  id: string;
  modelName: string;
  displayName: string;
}

export interface GroupDefinition {
  id: string;
  label: string;
  themeColor: string;
  prefixes?: string[]; 
  shortLabel: string;
  models: ModelDefinition[];
}

export class QuotaStrategyManager {
  private groups: GroupDefinition[];

  constructor() {
    this.groups = strategyData.groups;
  }

  getGroups(): GroupDefinition[] {
    return this.groups;
  }

  getGroupForModel(modelId: string, modelLabel?: string): GroupDefinition {
    const def = this.getModelDefinition(modelId, modelLabel);
    if (def) {
      const group = this.groups.find(g => g.models.includes(def));
      if (group) return group;
    }

    for (const group of this.groups) {
      if (group.models.some(m => m.id === modelId)) {
        return group;
      }
    }

    const lowerId = modelId.toLowerCase();
    const lowerLabel = modelLabel?.toLowerCase() || '';

    for (const group of this.groups) {
      if (group.prefixes) {
        for (const prefix of group.prefixes) {
          const p = prefix.toLowerCase();
          if (lowerId.includes(p)) return group;
          if (modelLabel && lowerLabel.includes(p)) return group;
        }
      }
    }

    const otherGroup = this.groups.find(g => g.id === 'other');
    return otherGroup || this.groups[0];
  }

  getModelDisplayName(modelId: string, modelLabel?: string): string | undefined {
    const def = this.getModelDefinition(modelId, modelLabel);
    return def?.displayName;
  }

  getModelDefinition(modelId: string, modelLabel?: string): ModelDefinition | undefined {
    for (const group of this.groups) {
      const model = group.models.find(m => m.id === modelId);
      if (model) return model;
    }

    const normalized = modelId.toLowerCase().replace(/^model_/, '').replace(/_/g, '-');
    for (const group of this.groups) {
      const model = group.models.find(m => m.id === normalized);
      if (model) return model;
    }

    if (modelLabel) {
      const model = this.findModelByLabel(modelLabel, modelId);
      if (model) return model;
    }

    return undefined;
  }

  private findModelByLabel(label: string, modelId?: string): ModelDefinition | undefined {
    const lowerLabel = label.toLowerCase();
    const lowerId = modelId?.toLowerCase() || '';

    for (const group of this.groups) {
      const model = group.models.find(m => {
        const mName = m.modelName.toLowerCase();
        if (mName === lowerLabel || lowerLabel.includes(mName)) return true;
        if (modelId && (lowerId === mName || lowerId.includes(mName))) return true;
        return false;
      });
      if (model) return model;
    }
    return undefined;
  }
}
