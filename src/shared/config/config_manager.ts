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
 * Config Manager: Typed configuration access
 */
import { TfaConfig } from '../utils/types';
export type { TfaConfig };

export interface IConfigReader {
    get<T>(key: string, defaultValue: T): T;
    update<T>(key: string, value: T): Promise<void>;
    onConfigChange(callback: (config: TfaConfig) => void, configManager: ConfigManager): { dispose(): void };
}

export class ConfigManager {
  constructor(private readonly reader: IConfigReader) {}

  public get<T>(key: string, defaultValue: T): T {
    return this.reader.get(key, defaultValue);
  }

  public update<T>(key: string, value: T): Promise<void> {
    return this.reader.update(key, value);
  }

  public getConfig(): TfaConfig {
    // Helper to get with default from reader logic (assuming reader handles defaults effectively, 
    // but here we hardcode defaults for type safety if reader is generic)
    return {
      "dashboard.gaugeStyle": this.reader.get("dashboard.gaugeStyle", "semi-arc"),
      "dashboard.viewMode": this.reader.get("dashboard.viewMode", "groups"),
      "dashboard.historyRange": this.reader.get("dashboard.historyRange", 90),
      "dashboard.refreshRate": this.reader.get("dashboard.refreshRate", 90),
      "dashboard.includeSecondaryModels": this.reader.get("dashboard.includeSecondaryModels", true),
      "dashboard.showCredits": this.reader.get("dashboard.showCredits", true),
      "dashboard.uiScale": this.reader.get("dashboard.uiScale", 1.0),

      "status.showQuota": this.reader.get("status.showQuota", true),
      "status.showCache": this.reader.get("status.showCache", true),
      "status.displayFormat": this.reader.get("status.displayFormat", "remaining"),
      "status.warningThreshold": this.reader.get("status.warningThreshold", 20),
      "status.criticalThreshold": this.reader.get("status.criticalThreshold", 5),
      "status.scope": this.reader.get("status.scope", "primary"),

      "cache.autoClean": this.reader.get("cache.autoClean", false),
      "cache.autoCleanKeepCount": this.reader.get("cache.autoCleanKeepCount", 15),
      "cache.scanInterval": this.reader.get("cache.scanInterval", 120),
      "cache.warningSize": this.reader.get("cache.warningSize", 1024),
      "cache.hideEmptyFolders": this.reader.get("cache.hideEmptyFolders", true),

      "system.serverHost": this.reader.get("system.serverHost", "127.0.0.1"),
      "system.apiPath": this.reader.get("system.apiPath", "/exa.language_server_pb.LanguageServerService/GetUserStatus"),
      "system.debugMode": this.reader.get("system.debugMode", false),
    };
  }
}
