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
 * HTTP client utility: Supports automatic HTTPS → HTTP fallback
 *
 * SECURITY NOTE:
 * This client is strictly enforced to only communicate with:
 * 1. localhost
 * 2. 127.0.0.1
 * 3. WSL Host IP (10.*, 172.*, 192.*)
 */

import * as https from "https";
import * as http from "http";
import { debugLog, warnLog } from "./logger";

export type Protocol = "https" | "http";

export interface HttpRequestOptions {
  hostname: string;
  port: number;
  path: string;
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  allowFallback?: boolean;
}

export interface HttpResponse<T = unknown> {
  statusCode: number;
  data: T;
  protocol: Protocol;
}

const protocolCache = new Map<string, Protocol>();

function getCachedProtocol(hostname: string, port: number): Protocol {
  const key = `${hostname}:${port}`;
  return protocolCache.get(key) || "https";
}

function setCachedProtocol(
  hostname: string,
  port: number,
  protocol: Protocol,
): void {
  const key = `${hostname}:${port}`;
  protocolCache.set(key, protocol);
}

/**
 * Validate that the hostname is a local address.
 * Throws an error if the hostname is external.
 */
function validateLocalhost(hostname: string): void {
  // Allow exact localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return;
  }

  // Allow WSL/Private IPs (Simple check for common private ranges)
  // 10.x.x.x, 172.16-31.x.x, 192.168.x.x
  if (
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    (hostname.startsWith("172.") &&
      parseInt(hostname.split(".")[1]) >= 16 &&
      parseInt(hostname.split(".")[1]) <= 31)
  ) {
    return;
  }

  throw new Error(
    `SECURITY ALERT: External connection blocked to ${hostname}. Only localhost is allowed.`,
  );
}

export async function httpRequest<T>(
  options: HttpRequestOptions,
): Promise<HttpResponse<T>> {
  const { hostname, port, allowFallback = true } = options;

  // SECURITY CHECK
  validateLocalhost(hostname);

  const cachedProtocol = getCachedProtocol(hostname, port);

  if (cachedProtocol === "http") {
    return doRequest<T>(options, "http");
  }

  try {
    return await doRequest<T>(options, "https");
  } catch (httpsError) {
    if (allowFallback) {
      debugLog(`HTTPS failed for ${hostname}:${port}, trying HTTP fallback...`);
      try {
        const result = await doRequest<T>(options, "http");
        setCachedProtocol(hostname, port, "http");
        return result;
      } catch {
        throw httpsError;
      }
    }
    throw httpsError;
  }
}

function doRequest<T>(
  options: HttpRequestOptions,
  protocol: Protocol,
): Promise<HttpResponse<T>> {
  const {
    hostname,
    port,
    path,
    method,
    headers = {},
    body,
    timeout = 5000,
  } = options;

  return new Promise((resolve, reject) => {
    const requestModule = protocol === "https" ? https : http;

    const requestOptions: https.RequestOptions | http.RequestOptions = {
      hostname,
      port,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
        ...headers,
      },
      timeout,
      agent: false,
      // Safe for localhost
      ...(protocol === "https" ? { rejectUnauthorized: false } : {}),
    };

    const req = requestModule.request(requestOptions, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => (responseBody += chunk));
      res.on("end", () => {
        const statusCode = res.statusCode || 0;
        try {
          const data = responseBody
            ? (JSON.parse(responseBody) as T)
            : ({} as T);
          resolve({ statusCode, data, protocol });
        } catch {
          if (statusCode >= 400) {
            resolve({
              statusCode,
              data: { error: `HTTP ${statusCode}` } as any,
              protocol,
            });
          } else {
            reject(new Error(`Invalid JSON response`));
          }
        }
      });
    });

    req.on("error", (err) =>
      reject(
        new Error(`${protocol.toUpperCase()} request failed: ${err.message}`),
      ),
    );
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`${protocol.toUpperCase()} request timeout`));
    });

    if (body) req.write(body);
    req.end();
  });
}
