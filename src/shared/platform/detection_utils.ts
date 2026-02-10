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

import { httpRequest } from "../utils/http_client";

export async function verifyServerGateway(
    hostname: string,
    port: number,
    csrfToken: string,
    endpoint: string = "/exa.language_server_pb.LanguageServerService/GetUserStatus"
): Promise<{
    success: boolean;
    statusCode: number;
    protocol: "https" | "http";
    error?: string;
}> {
    try {
        const response = await httpRequest<{ wrapper_data: any }>({
            hostname,
            port,
            path: endpoint,
            method: 'POST',
            headers: {
                "X-Codeium-Csrf-Token": csrfToken,
                "Connect-Protocol-Version": "1",
            },
            body: JSON.stringify({ wrapper_data: {} }),
            timeout: 5000,
            allowFallback: true
        });
        
        return {
            success: response.statusCode === 200,
            statusCode: response.statusCode,
            protocol: response.protocol
        };
    } catch (err) {
        return {
            success: false,
            statusCode: 0,
            protocol: "https",
            error: err instanceof Error ? err.message : String(err)
        };
    }
}

export function getPortListCommand(pid: number, platform: string, unixAvailableCmd?: string): string {
    if (platform === "win32") {
        return `chcp 65001 >nul && netstat -ano | findstr "${pid}" | findstr "LISTENING"`;
    }

    if (platform === "darwin") {
        return `lsof -nP -a -iTCP -sTCP:LISTEN -p ${pid} 2>/dev/null | grep -E "^\\S+\\s+${pid}\\s"`;
    }

    if (unixAvailableCmd === "lsof") {
        return `lsof -nP -a -iTCP -sTCP:LISTEN -p ${pid} 2>/dev/null | grep -E "^\\S+\\s+${pid}\\s"`;
    } else if (unixAvailableCmd === "ss") {
        return `ss -tlnp 2>/dev/null | grep "pid=${pid},"`;
    } else if (unixAvailableCmd === "netstat") {
        return `netstat -tulpn 2>/dev/null | grep ${pid}`;
    }

    // Default fallback
    return `ss -tlnp 2>/dev/null | grep "pid=${pid}" || lsof -nP -a -iTCP -sTCP:LISTEN -p ${pid} 2>/dev/null | grep -E "^\\S+\\s+${pid}\\s"`;
}
