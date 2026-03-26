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
 * CacheService: Manages brain tasks, code contexts, and monitors storage usage
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
    getBrainDir,
    getConversationsDir,
    getCodeContextsDir,
    getKnowledgeDir,
    getBrowserRecordingsDir,
    getImplicitDir,
} from '../../shared/utils/paths';
import type { ICacheService } from './interfaces';
import type { BrainTask, CacheInfo, CodeContext, FileItem, StorageItem } from '../../shared/utils/types';

export class CacheService implements ICacheService {
    private baseBrainDir: string;
    private baseConversationsDir: string;
    private baseCodeContextsDir: string;
    private baseKnowledgeDir: string;
    private baseBrowserRecordingsDir: string;
    private baseImplicitDir: string;

    constructor(brainDir?: string, conversationsDir?: string, codeContextsDir?: string) {
        this.baseBrainDir = brainDir || getBrainDir();
        this.baseConversationsDir = conversationsDir || getConversationsDir();
        this.baseCodeContextsDir = codeContextsDir || getCodeContextsDir();
        this.baseKnowledgeDir = getKnowledgeDir();
        this.baseBrowserRecordingsDir = getBrowserRecordingsDir();
        this.baseImplicitDir = getImplicitDir();
    }

    async getCacheInfo(): Promise<CacheInfo> {
        const [
            brainSize,
            conversationsSize,
            implicitSize,
            knowledgeSize,
            browserRecordingsSize,
            brainTasks,
            codeContexts,
            conversations,
            recordingSessions,
            knowledgeEntries,
            storageItems,
        ] = await Promise.all([
            this.getDirectorySize(this.baseBrainDir),
            this.getDirectorySize(this.baseConversationsDir),
            this.getDirectorySize(this.baseImplicitDir),
            this.getDirectorySize(this.baseKnowledgeDir),
            this.getDirectorySize(this.baseBrowserRecordingsDir),
            this.getBrainTasks(),
            this.getCodeContexts(),
            this.getConversations(),
            this.getRecordingSessions(),
            this.getKnowledgeEntries(),
            this.getStorageItems(),
        ]);

        return {
            brainSize,
            conversationsSize,
            implicitSize,
            knowledgeSize,
            browserRecordingsSize,
            totalSize: brainSize + conversationsSize + implicitSize + knowledgeSize + browserRecordingsSize,
            brainCount: brainTasks.length,
            conversationsCount: conversations.length,
            brainTasks,
            conversations,
            codeContexts,
            recordingSessions,
            knowledgeEntries,
            storageItems,
        };
    }

    // Monitor storage of Rules, Workflows, Skills, Knowledge
    private async getStorageItems(): Promise<StorageItem[]> {
        const items: StorageItem[] = [];
        const folders = vscode.workspace.workspaceFolders || [];

        for (const folder of folders) {
            const root = folder.uri.fsPath;

            // 1. Check .antigravityignore
            const ignorePath = path.join(root, '.antigravityignore');
            try {
                const stat = await fs.promises.stat(ignorePath);
                items.push({
                    name: '.antigravityignore',
                    type: 'rule',
                    path: ignorePath,
                    size: stat.size,
                    fileCount: 1
                });
            } catch { }

            // 2. Check GEMINI.md (project-level rules)
            const geminiPath = path.join(root, 'GEMINI.md');
            try {
                const stat = await fs.promises.stat(geminiPath);
                items.push({
                    name: 'GEMINI.md',
                    type: 'rule',
                    path: geminiPath,
                    size: stat.size,
                    fileCount: 1
                });
            } catch { }

            // 3. Check AGENTS.md (project-level rules, v1.20.5+)
            const agentsPath = path.join(root, 'AGENTS.md');
            try {
                const stat = await fs.promises.stat(agentsPath);
                items.push({
                    name: 'AGENTS.md',
                    type: 'rule',
                    path: agentsPath,
                    size: stat.size,
                    fileCount: 1
                });
            } catch { }

            // 4. Check Workflows (.agent/workflows or .agents/workflows)
            for (const agentDir of ['.agent', '.agents']) {
                const workflowsPath = path.join(root, agentDir, 'workflows');
                try {
                    await fs.promises.access(workflowsPath);
                    const size = await this.getDirectorySize(workflowsPath);
                    const count = await this.getFileCount(workflowsPath);
                    items.push({
                        name: 'Workflows',
                        type: 'workflow',
                        path: workflowsPath,
                        size,
                        fileCount: count
                    });
                    break; // Only add once
                } catch { }
            }

            // 5. Check Skills (.agent/skills or .agent/knowledge)
            for (const sub of ['skills', 'knowledge']) {
                const skillsPath = path.join(root, '.agent', sub);
                try {
                    await fs.promises.access(skillsPath);
                    const size = await this.getDirectorySize(skillsPath);
                    const count = await this.getFileCount(skillsPath);
                    items.push({
                        name: `Skills (${sub})`,
                        type: 'skill',
                        path: skillsPath,
                        size,
                        fileCount: count
                    });
                } catch { }
            }
        }

        // 6. Global Knowledge Base
        try {
            await fs.promises.access(this.baseKnowledgeDir);
            const entries = await fs.promises.readdir(this.baseKnowledgeDir, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory()) continue;
                const kbPath = path.join(this.baseKnowledgeDir, entry.name);
                const size = await this.getDirectorySize(kbPath);
                // Parse metadata for a nice label
                let label = entry.name.replace(/_/g, ' ');
                try {
                    const metaPath = path.join(kbPath, 'metadata.json');
                    const metaContent = await fs.promises.readFile(metaPath, 'utf-8');
                    const meta = JSON.parse(metaContent);
                    if (meta.title) label = meta.title;
                } catch { }
                items.push({
                    name: `📚 ${label}`,
                    type: 'knowledge',
                    path: kbPath,
                    size,
                    fileCount: await this.getFileCountRecursive(kbPath)
                });
            }
        } catch { }

        return items;
    }

    async getConversations(): Promise<BrainTask[]> {
        // Return empty so the UI shows the fallback info text instead of listing binary PB files.
        return [];
    }

    async getBrainTasks(): Promise<BrainTask[]> {
        try {
            const entries = await fs.promises.readdir(this.baseBrainDir, { withFileTypes: true });
            const tasks: BrainTask[] = [];

            for (const entry of entries) {
                if (!entry.isDirectory()) continue;
                const taskPath = path.join(this.baseBrainDir, entry.name);
                const [size, fileCount, label, stat] = await Promise.all([
                    this.getDirectorySize(taskPath),
                    this.getFileCount(taskPath),
                    this.getTaskLabel(taskPath, entry.name),
                    fs.promises.stat(taskPath),
                ]);

                tasks.push({
                    id: entry.name,
                    label,
                    path: taskPath,
                    size,
                    fileCount,
                    createdAt: stat.birthtimeMs || stat.mtimeMs,
                });
            }
            return tasks.sort((a, b) => b.createdAt - a.createdAt);
        } catch {
            return [];
        }
    }

    async getCodeContexts(): Promise<CodeContext[]> {
        // Code tracker has been deprecated by Antigravity (~Feb 2026).
        // The code_tracker/active directory is empty.
        // Return empty array to avoid scanning a dead directory.
        try {
            const entries = await fs.promises.readdir(this.baseCodeContextsDir, { withFileTypes: true });
            const contexts: CodeContext[] = [];
            for (const entry of entries) {
                if (!entry.isDirectory()) continue;
                const contextPath = path.join(this.baseCodeContextsDir, entry.name);
                const size = await this.getDirectorySize(contextPath);
                const cleanName = entry.name.replace(/_([a-f0-9]{32,40})$/, '');
                contexts.push({ id: entry.name, name: cleanName, size });
            }
            return contexts.sort((a, b) => a.name.localeCompare(b.name));
        } catch {
            return [];
        }
    }

    async getTaskFiles(taskId: string): Promise<FileItem[]> {
        const taskPath = path.join(this.baseBrainDir, taskId);
        return this.getFilesInDirectory(taskPath);
    }

    async getContextFiles(contextId: string): Promise<FileItem[]> {
        const contextPath = path.join(this.baseCodeContextsDir, contextId);
        return this.getFilesInDirectory(contextPath);
    }

    async getResourceFiles(resourcePath: string): Promise<FileItem[]> {
        const files: FileItem[] = [];
        await this.collectFilesRecursively(resourcePath, files, resourcePath);
        return files.sort((a, b) => a.name.localeCompare(b.name));
    }

    private async collectFilesRecursively(dir: string, collection: FileItem[], root: string): Promise<void> {
        try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await this.collectFilesRecursively(fullPath, collection, root);
                } else if (entry.isFile()) {
                    const relative = path.relative(root, fullPath);
                    collection.push({
                        name: relative,
                        path: fullPath
                    });
                }
            }
        } catch { }
    }

    async deleteTask(taskId: string): Promise<void> {
        const taskPath = path.join(this.baseBrainDir, taskId);
        await fs.promises.rm(taskPath, { recursive: true, force: true });
        const conversationFile = path.join(this.baseConversationsDir, `${taskId}.pb`);
        await fs.promises.rm(conversationFile, { force: true }).catch(() => { });
    }

    async deleteContext(contextId: string): Promise<void> {
        const contextPath = path.join(this.baseCodeContextsDir, contextId);
        await fs.promises.rm(contextPath, { recursive: true, force: true });
    }

    async deleteFile(filePath: string): Promise<void> {
        await fs.promises.rm(filePath, { force: true });
    }

    /**
     * Clear all browser recording files.
     * These are screenshot captures from the Antigravity embedded browser.
     */
    async clearBrowserRecordings(): Promise<{ deletedCount: number; freedBytes: number }> {
        let deletedCount = 0;
        let freedBytes = 0;
        try {
            const entries = await fs.promises.readdir(this.baseBrowserRecordingsDir, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory()) continue;
                const dirPath = path.join(this.baseBrowserRecordingsDir, entry.name);
                const size = await this.getDirectorySize(dirPath);
                await fs.promises.rm(dirPath, { recursive: true, force: true });
                freedBytes += size;
                deletedCount++;
            }
        } catch { }
        return { deletedCount, freedBytes };
    }

    async cleanCache(keepCount: number = 5): Promise<{ deletedCount: number, freedBytes: number }> {
        try {
            let deletedCount = 0;
            let freedBytes = 0;
            const tasks = await this.getBrainTasks();
            if (tasks.length > keepCount) {
                const tasksToDelete = tasks.slice(keepCount);
                for (const task of tasksToDelete) {
                    freedBytes += task.size;
                    const pbPath = path.join(this.baseConversationsDir, `${task.id}.pb`);
                    try {
                        const pbStat = await fs.promises.stat(pbPath);
                        freedBytes += pbStat.size;
                    } catch { }
                    await this.deleteTask(task.id);
                    deletedCount++;
                }
            }

            // Clean orphan .tmp files from conversations directory
            try {
                const files = await fs.promises.readdir(this.baseConversationsDir, { withFileTypes: true });
                for (const file of files) {
                    if (!file.isFile()) continue;
                    if (file.name.endsWith('.tmp')) {
                        const tmpPath = path.join(this.baseConversationsDir, file.name);
                        const tmpStat = await fs.promises.stat(tmpPath);
                        freedBytes += tmpStat.size;
                        await fs.promises.rm(tmpPath, { force: true });
                        deletedCount++;
                    }
                }
            } catch { }

            return { deletedCount, freedBytes };
        } catch {
            return { deletedCount: 0, freedBytes: 0 };
        }
    }

    private async getDirectorySize(dirPath: string): Promise<number> {
        try {
            const stat = await fs.promises.stat(dirPath);
            if (!stat.isDirectory()) return stat.size;
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            let totalSize = 0;
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) totalSize += await this.getDirectorySize(fullPath);
                else if (entry.isFile()) totalSize += (await fs.promises.stat(fullPath)).size;
            }
            return totalSize;
        } catch { return 0; }
    }

    private async getFileCount(dirPath: string): Promise<number> {
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            return entries.filter((e) => e.isFile()).length;
        } catch { return 0; }
    }

    private async getFileCountRecursive(dirPath: string): Promise<number> {
        let count = 0;
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile()) count++;
                else if (entry.isDirectory()) {
                    count += await this.getFileCountRecursive(path.join(dirPath, entry.name));
                }
            }
        } catch { }
        return count;
    }

    private async getTaskLabel(taskPath: string, fallbackId: string): Promise<string> {
        try {
            const taskMdPath = path.join(taskPath, 'task.md');
            const content = await fs.promises.readFile(taskMdPath, 'utf-8');
            const firstLine = content.split('\n')[0];
            if (firstLine && firstLine.startsWith('#')) {
                return firstLine.replace(/^#+\s*/, '').replace(/^Task:\s*/i, '').trim();
            }
            return (content.trim().split('\n')[0] || fallbackId).replace(/^Task:\s*/i, '');
        } catch { return fallbackId; }
    }

    private async getFilesInDirectory(dirPath: string): Promise<FileItem[]> {
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            const files: FileItem[] = [];
            for (const entry of entries) {
                if (!entry.isFile()) continue;
                const cleanName = entry.name.replace(/^([a-f0-9]{32})_/, '');
                files.push({
                    name: cleanName,
                    path: path.join(dirPath, entry.name)
                });
            }
            return files.sort((a, b) => a.name.localeCompare(b.name));
        } catch {
            return [];
        }
    }

    private async getRecordingSessions(): Promise<BrainTask[]> {
        const sessions: BrainTask[] = [];
        try {
            const entries = await fs.promises.readdir(this.baseBrowserRecordingsDir, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory()) continue;
                const sessionPath = path.join(this.baseBrowserRecordingsDir, entry.name);
                const size = await this.getDirectorySize(sessionPath);
                const fileCount = await this.getFileCount(sessionPath);
                sessions.push({
                    id: entry.name,
                    label: `Session ${entry.name.substring(0, 8)}… (${fileCount} screenshots)`,
                    path: sessionPath,
                    size,
                    fileCount,
                    createdAt: 0,
                });
            }
        } catch { /* dir may not exist */ }
        return sessions.sort((a, b) => b.size - a.size);
    }

    private async getKnowledgeEntries(): Promise<BrainTask[]> {
        const knowledgeEntries: BrainTask[] = [];
        try {
            const dirs = await fs.promises.readdir(this.baseKnowledgeDir, { withFileTypes: true });
            for (const dir of dirs) {
                if (!dir.isDirectory()) continue;
                const entryPath = path.join(this.baseKnowledgeDir, dir.name);
                const metadataPath = path.join(entryPath, 'metadata.json');
                let label = dir.name.substring(0, 12) + '…';
                try {
                    const metadata = JSON.parse(await fs.promises.readFile(metadataPath, 'utf-8'));
                    if (metadata.title) label = metadata.title;
                    else if (metadata.name) label = metadata.name;
                    else if (metadata.displayName) label = metadata.displayName;
                } catch { /* no metadata */ }
                const size = await this.getDirectorySize(entryPath);
                const fileCount = await this.getFileCount(entryPath);
                knowledgeEntries.push({
                    id: dir.name,
                    label,
                    path: entryPath,
                    size,
                    fileCount,
                    createdAt: 0,
                });
            }
        } catch { /* dir may not exist */ }
        return knowledgeEntries.sort((a, b) => a.label.localeCompare(b.label));
    }
}
