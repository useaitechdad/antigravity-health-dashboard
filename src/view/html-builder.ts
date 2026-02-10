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
 * WebviewHtmlBuilder: Generates Webview HTML skeleton
 *
 * Architecture: No VS Code dependency - accepts plain strings
 * External CSS for CSP compliance (no 'unsafe-inline')
 */

import * as crypto from "crypto";

export interface WebviewHtmlConfig {
    cspSource: string;
    codiconsUri: string;
    webviewUri: string;
}

export function generateNonce(): string {
    return crypto.randomBytes(32).toString('base64');
}

export class WebviewHtmlBuilder {
    private config: WebviewHtmlConfig | null = null;

    setHead(cspSource: string, codiconsUri: string, webviewUri: string): this {
        this.config = { cspSource, codiconsUri, webviewUri };
        return this;
    }

    private translations: Record<string, string> = {};

    setTranslations(translations: Record<string, string>): this {
        this.translations = translations;
        return this;
    }


    build(): string {
        if (!this.config) {
            throw new Error("WebviewHtmlBuilder: setHead() must be called before build()");
        }

        const { cspSource, codiconsUri, webviewUri } = this.config;
        const nonce = generateNonce();

        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${cspSource}; img-src ${cspSource} data:;">
  <link href="${codiconsUri}" rel="stylesheet" />
</head>
<body>
  <script nonce="${nonce}">
    window.__TRANSLATIONS__ = ${JSON.stringify(this.translations)};
  </script>
  <sidebar-app></sidebar-app>
  <script nonce="${nonce}" type="module" src="${webviewUri}"></script>
</body>
</html>`;
    }
}
