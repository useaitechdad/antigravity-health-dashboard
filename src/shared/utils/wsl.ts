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

import * as fs from 'fs';

export function isWsl(platformOverride?: string, versionReader?: () => string): boolean {
    const platform = platformOverride || process.platform;
    if (platform !== 'linux') return false;
    try {
        const reader = versionReader || (() => fs.readFileSync('/proc/version', 'utf8'));
        const version = reader().toLowerCase();
        return version.includes('microsoft') || version.includes('wsl');
    } catch {
        return false;
    }
}

export function getWslHostIp(resolvReader?: () => string): string | null {
    try {
        const reader = resolvReader || (() => fs.readFileSync('/etc/resolv.conf', 'utf8'));
        const resolvConf = reader();
        const match = resolvConf.match(/^nameserver\s+([0-9.]+)/m);
        const nameserver = match ? match[1] : null;
        if (nameserver === '10.255.255.254') return null;
        return nameserver;
    } catch {
        return null;
    }
}
