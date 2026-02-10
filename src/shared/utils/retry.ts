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
 * Generic retry utility
 */

export type BackoffStrategy = "fixed" | "linear" | "exponential";

export interface RetryConfig<T> {
  attempts: number;
  baseDelay: number;
  maxDelay?: number;
  backoff?: BackoffStrategy;
  shouldRetry?: (result: T | null, error?: Error) => boolean;
  onRetry?: (attempt: number, delay: number) => void;
}

function calculateDelay(attempt: number, baseDelay: number, strategy: BackoffStrategy, maxDelay: number): number {
  let delay = baseDelay;
  switch (strategy) {
    case "linear": delay = baseDelay * attempt; break;
    case "exponential": delay = baseDelay * Math.pow(2, attempt - 1); break;
  }
  return Math.min(delay, maxDelay);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function retry<T>(fn: () => Promise<T | null>, config: RetryConfig<T>): Promise<T | null> {
  const { attempts, baseDelay, maxDelay = 30000, backoff = "fixed", shouldRetry = (r) => r === null, onRetry } = config;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await fn();
      if (!shouldRetry(result, undefined)) return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (!shouldRetry(null, lastError)) throw lastError;
    }

    if (attempt < attempts) {
      const delay = calculateDelay(attempt, baseDelay, backoff, maxDelay);
      onRetry?.(attempt, delay);
      await sleep(delay);
    }
  }

  if (lastError) throw lastError;
  return null;
}
