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

import * as os from "os";
import * as path from "path";
import { GEMINI_ROOT_DIR_NAME, ANTIGRAVITY_DIR_NAME } from "./constants";

export function getGeminiRootDir(): string {
  return path.join(os.homedir(), GEMINI_ROOT_DIR_NAME);
}

export function getGeminiBaseDir(): string {
  return path.join(getGeminiRootDir(), ANTIGRAVITY_DIR_NAME);
}

export function getGlobalRulesPath(): string {
  return path.join(getGeminiRootDir(), "GEMINI.md");
}

export function getBrainDir(): string {
  return path.join(getGeminiBaseDir(), "brain");
}

export function getConversationsDir(): string {
  return path.join(getGeminiBaseDir(), "conversations");
}

export function getCodeContextsDir(): string {
  return path.join(getGeminiBaseDir(), "code_tracker", "active");
}

export function getMcpConfigPath(): string {
  return path.join(getGeminiBaseDir(), "mcp_config.json");
}

export function getBrowserAllowlistPath(): string {
  return path.join(getGeminiBaseDir(), "browser_allowlist.txt");
}
