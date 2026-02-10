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

import * as vscode from "vscode";

export function getExpectedWorkspaceIds(): string[] {
  const ids = getWorkspaceIdsFromFolders(vscode.workspace.workspaceFolders || []);
  const workspaceFile = vscode.workspace.workspaceFile;
  if (workspaceFile && workspaceFile.scheme === 'file') {
    const id = process.platform === "win32" ? normalizeWindowsPath(workspaceFile.fsPath) : normalizeUnixPath(workspaceFile.fsPath);
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

export function getWorkspaceIdsFromFolders(folders: readonly vscode.WorkspaceFolder[]): string[] {
  if (!folders || folders.length === 0) return [];
  return folders.map(folder => {
    return process.platform === "win32" 
      ? normalizeWindowsPath(folder.uri.fsPath) 
      : normalizeUnixPath(folder.uri.fsPath);
  });
}

export function normalizeWindowsPath(path: string): string {
  const driveMatch = path.match(/^([A-Za-z]):(.*)/);
  if (!driveMatch) return normalizeUnixPath(path);
  const driveLetter = driveMatch[1].toLowerCase();
  const restOfPath = driveMatch[2];
  const encodedSegments = restOfPath.split(/[\\/]/).filter(s => s.length > 0).map(encodeURIComponent).join("_");
  const normalizedRest = encodedSegments.replace(/[^a-zA-Z0-9]/g, "_");
  return `file_${driveLetter}_3A_${normalizedRest}`;
}

export function normalizeUnixPath(path: string): string {
  const normalizedSlashes = path.replace(/\\/g, "/");
  const urlEncoded = normalizedSlashes.split("/").map(encodeURIComponent).join("/");
  const normalizedPath = urlEncoded
    .replace(/^[^a-zA-Z0-9]+/, "")
    .replace(/[^a-zA-Z0-9]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_");
  return `file_${normalizedPath}`;
}
