# Antigravity Health Dashboard

[Watch the video](https://youtu.be/fGuhlTqddyg) - Watch this to understand what this is and why you need this and how to use it.

> **Lean. Fast. Focused.**
>
> Monitor your AI quota, manage cache usage, and track storage health—all from a zero-dependency dashboard.

**Antigravity Health Dashboard** is a dedicated observability tool for the **Google Antigravity IDE**.

## ✨ Core Pillars

### 1. 🎯 Quota Observability

Stop guessing when your AI credits will reset.

- **Real-time Limits**: See remaining quota for Gemini 3.1 (Pro High/Low), Gemini 3 (Flash), Claude (Sonnet 4.5, Opus 4.5/4.6), and GPT-OSS 120B.
- **Smart Prediction**: Calculates your current usage rate and predicts "runway" before exhaustion.
- **Credit Tracking**: Monitor Prompt Consumption and Execution Consumption credits with visual breakdowns.
- **Status Bar Integration**: Get critical health metrics (Quota % / Cache Size) directly in your VS Code status bar.

### 2. � Optimizing Context Window (Memory)

Your **Context Window** is your most valuable resource. This dashboard helps you reclaim it.

- **Brain Management**: Identify "heavy" tasks (e.g., >200KB) that are consuming your context window.
  - **Single Delete**: Click the **Trash Emoji (🗑️)** on the left of any task to delete it surgically.
  - **Clear Cache**: Use the "Clear Cache" button in the footer to automatically prune all but the 5 most recent tasks.
- **Code Tracker**: See which project folders are indexed. Unlink unused contexts to prevent the agent from searching irrelevant code.
- **Resource Monitoring**: Track workspace-level configurations including Rules, Workflows, and Skills with expandable file listings.

### 3. 💾 Storage Monitoring

**[NEW]** Gain visibility into hidden `.agent` costs.

- **Workflow & Skill Analyzer**: See exactly how much space your definition files are consuming.
- **Zero-Trust Connectivity**: Connects securely to the local Language Server process without external API calls.

---

## 🚀 Getting Started

### Installation

**Option 1: Build & Install from Source**
If you have cloned this repository, follow these steps to build and install the extension:

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Package the Extension**
    Use `vsce` to create the `.vsix` installer.

    ```bash
    npx @vscode/vsce package
    ```

    _This will generate a file (e.g., `antigravity-health-dashboard-1.2.5.vsix`) in the project root._

3.  **Install into VS Code**
    - Open the **Extensions** view (`Cmd+Shift+X`).
    - Click the `...` menu (top right of the panel).
    - Select **"Install from VSIX..."**.
    - Choose the `.vsix` file you just generated.

**Option 2: Development Mode**

1.  Open this folder in VS Code.
2.  Press `F5` to launch the **Extension Development Host**.

### Quick Actions

Open the **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type `Antigravity Health`:

- `Antigravity Health: Open Dashboard`: Opens the main side panel.
- `Antigravity Health: Refresh Quota`: Forces a real-time update.
- `Antigravity Health: Clean Cache`: Triggers the smart prune (keep recent 5).

### Tools & Recovery (Footer)

The footer now provides direct access to critical actions:

- **Edit Agent Instructions**: Quickly open your `GEMINI.md`.
- **Clear Cache**: Frees up space by removing old conversation history.
- **Reconnect to Antigravity**: Reconnects to the language server (use if quota is inaccurate or charts freeze).
- **Refresh Antigravity Code Window**: Reloads the VS Code window if the agent becomes unresponsive.

---

## ⚙️ Configuration

Start with sensible defaults, or tune to your needs via **Settings**:

| Setting                | Default  | Description                                                        |
| :--------------------- | :------- | :----------------------------------------------------------------- |
| **Quota Polling**      | `90s`    | How often to refresh health metrics (min: 60s).                    |
| **Warning Threshold**  | `40%`    | Trigger yellow status bar warnings at this level.                  |
| **Critical Threshold** | `20%`    | Trigger red critical alerts at this level.                         |
| **Show Absolute Time** | `Off`    | Show absolute time of quota expiration (e.g. at 3:00 PM).          |
| **Auto-Clean Cache**   | `Off`    | If enabled, keeps only the last N tasks (default: 5).              |
| **View Mode**          | `Groups` | Visualize quota by Model Family (Gemini/GPT) or individual models. |

---

## � Known Behaviors

### Quota Sharing Between Model Groups

**Claude and GPT-OSS 120B share the same quota pool** at the backend level, even though they appear as separate groups in the dashboard.

**What this means:**

- Both model groups will show identical usage percentages (e.g., both at 80%)
- Using Claude models consumes from the same quota as GPT-OSS models
- The `quota_strategy.json` configuration only controls **display grouping and labeling**, not actual quota allocation

**Why this happens:**
The dashboard fetches quota data from the Antigravity Language Server API, which returns model-specific quota limits based on the backend configuration. If the API maps both Claude and GPT-OSS to the same underlying quota pool, they will share the same `remainingFraction` value regardless of how they're grouped in the UI.

**To investigate further:**

1. Check the Language Server logs to see what model IDs are being returned
2. Review the backend configuration to identify quota pool mappings
3. Contact the Antigravity team for clarification on intentional quota sharing

---

## �🔒 Privacy & Security

**Zero Telemetry. Zero External Calls.**
This extension is architected with a "Zero-Trust" local-first philosophy:

- **No Remote Servers**: It ONLY communicates with `127.0.0.1` (localhost).
- **Process Isolation**: It strictly monitors the local specific Antigravity process ID.
- **Data Sovereignty**: Your usage data and cache stats never leave your machine.

### Security Audit (Feb 2026)

This extension was audited for vulnerabilities found in similar extensions (e.g., "Antigravity Cockpit").

- **✅ Permissions**: Does NOT request excessive OAuth scopes.
- **✅ Credentials**: Does NOT store credentials in plaintext.
- **✅ Network**: Does NOT open insecure local servers.
- **⚠️ Process Scanning**: Uses process scanning to detect the local Antigravity Language Server. This is necessary to function without requiring a separate login, but bypasses the VS Code sandbox.

> **Note on "Process Scanning" Risk**:
> This technique is flagged as a risk in some contexts because it bypasses the standard extension sandbox. However, for this extension:
>
> 1. **Local Only**: It _only_ communicates with `localhost`. It does not send data to any external server.
> 2. **Necessary Workaround**: The Antigravity Language Server does not currently provide a public API for quota data. Scanning process arguments is the only way to retrieve the necessary port and token without manual user input.
> 3. **Open Source**: The code is fully auditable. You can verify in `src/shared/platform/process_finder.ts` that the token is never exposed externally.

---

## 🤝 Participation

This project is shared for educational purposes as part of the Use AI with Tech Dad YouTube channel. While the code is open-source under Apache 2.0, I am not accepting outside contributions at this time to keep the project focused on the curriculum.

## 📄 License

Copyright 2026 Use AI with Tech Dad

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

**NOTICE**: This file has been modified by Use AI with Tech Dad for the Antigravity series.

Antigravity Health Dashboard is an open-source project and is not affiliated with Google.

## 📝 Attributions

This project is a derivative work based on the original Toolkit for Antigravity by datafrog.io and its contributors.
