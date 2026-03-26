# Antigravity Background Processes Explained

This document outlines the three primary background processes that power the Antigravity extension, what they do, and when it is safe to manually terminate them.

You can view these active processes inside the Antigravity Health Dashboard under the **⚡ AG Processes** section.

---

## 1. 🖥️ Language Server (`language_server`)

These are the most critical processes and function as the actual "brain" of the Antigravity extension. 

Antigravity uses a distributed architecture where it spins up a dedicated, isolated Language Server for **every single workspace or folder** you have open in VS Code.
* **Why**: This strict isolation ensures that the AI's context, knowledge, and actions for one project never bleed into or contaminate another project.
* **Safe to Kill?**: **🔴 NO**. 
* **If Killed**: The Antigravity extension will instantly lose its connection to that specific VS Code workspace and enter a crashed state. You will be forced to reload your VS Code window to get the AI functioning again. For this reason, the "Kill" button is intentionally disabled for Language Servers in the dashboard.

## 2. 🔌 Pyrefly LSP (`pyrefly`)

Pyrefly is a highly optimized Python type-checker and Language Server Protocol (LSP) originally developed by Meta.

Antigravity runs Pyrefly behind the scenes to provide fast syntax analysis, linting, and code intelligence. It is primarily invoked when its agents are actively reading, writing, or debugging Python code.
* **Why**: It gives the AI agent a deep, semantic understanding of the Python codebase it is modifying, allowing it to catch errors before proposing code.
* **Safe to Kill?**: **🟢 YES**.
* **If Killed**: If an agent gets stuck in an infinite debugging or linting loop while writing Python code, killing this process will safely interrupt it. Antigravity will automatically spawn a new Pyrefly instance the next time the AI needs to analyze Python code.

## 3. 🌐 AG Browser (`Chrome`)

Whenever Antigravity uses its "Web Browser" capability—such as to search the public internet, read online documentation, or visually test a local web application—it spins up a hidden, headless instance of Google Chrome.

Because Google Chrome uses a modern multi-process architecture, a single browser session actually spawns a cluster of processes: one main process, plus several "Helper" processes (e.g., dedicated processes for the GPU, networking, rendering, and storage). This is why you will typically see 4 or more Chrome processes clustered together in the dashboard.
* **Why**: It allows the AI to "see" and interact with the web exactly like a human would.
* **Safe to Kill?**: **🟢 YES**.
* **If Killed**: If you are not actively waiting for the AI to finish a web search or browser interaction, any remaining Chrome processes are likely "orphaned" (they successfully finished their task but failed to close properly) and are consuming massive amounts of RAM. Pressing "Kill" on any one of these Chrome processes will instantly wipe out the entire cluster, freeing up your system memory.
