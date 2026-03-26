# Antigravity Health Dashboard Changelog

## v1.5.6 (2026-03-25)
* **Feature**: Added a dedicated **Clear ALL Cache** button to the footer UI that bypasses the standard 5-folder retention rule, allowing users to permanently wipe their entire conversation history payload in one click.

## v1.5.5 (2026-03-25)
* **Update**: Split the single `Rules` button into two distinct quick-action buttons in the footer: one dedicated to explicitly creating or opening the modern `AGENTS.md` spec, and one for the legacy `GEMINI.md`. 

## v1.5.4 (2026-03-25)
* **Fix**: Fixed the AG Process Monitor startup visibility. The tracker now properly hooks into the `refreshCache()` phase, instantly populating the process list when the dashboard is opened instead of waiting for a manual cache flush.
## v1.5.3 (2026-03-25)
* **Fix**: Changed the debug diagnostics command output from `json` to `plaintext` to prevent VS Code from showing JSON parser error warnings on the text output.

## v1.5.2 (2026-03-25)
* **Fix**: Removed the `Plan Name` field from the diagnostic debug output to prevent showing 'Unknown' or stale plan data.

## v1.5.1 (2026-03-25)
* **Fix**: Fixed the AG Process Monitor visibility. The background scanner was detecting processes properly but the list wasn't being correctly pushed to the webview state on initial load.
* **Update**: Merged the standalone Knowledge UI into the existing Resources section to reduce clutter, as knowledge entries are physically stored in the Resources directory anyway. Added an advisory tip regarding the Agent Manager.

## v1.5.0 (2026-03-25)
* **Feature**: **Expandable Browser Recordings**: Upgraded the static 🎬 Browser Recordings bar to a fully expandable folder-tree. Now lists individual recording sessions by UUID along with their file sizes and screenshot counts.
* **Feature**: **AG Process Monitor**: Added a new "⚡ AG Processes" panel to the bottom of the sidebar. It actively scans and displays processes spawned by Antigravity (Language Servers with workspace paths, AG Browser instances, and Pyrefly LSPs) along with their PIDs and a **Kill** button for non-language-server processes to easily clean up hung tools.
* **Fix**: Resolved the `workspace_mismatch` connection bug on Windows matching paths.
* **Fix**: Removed the stale `Last Updated: 1970` epoch field from diagnostics.

## v1.4.0 (2026-03-25)
* **Feature**: **`AGENTS.md` Support**: The Rules button in the sidebar will now auto-detect and open `AGENTS.md` (introduced in Antigravity v1.20.5) before falling back to `GEMINI.md`.
* **Update**: **API Compatibility Sync**:
  - Updated Claude model labels from 4.5 to **4.6** (Sonnet & Opus).
  - Adopted new server-side placeholders (`M37`, `M36`, `M47`, `M26`) for Gemini Pro and Flash models.
  - Parsed new feature flags locally (`supportsImages`, `isRecommended`, `tagTitle`, `cascadeWebSearchEnabled`, `availableCredits`).
* **Fix**: **Agent Conversations Size Bloat**: `cleanCache()` now actively scans for and removes massive orphan `.tmp` files (e.g., 26MB remnants) from the `conversations/` directory, preventing the dashboard size from endlessly growing after manual deletions.
* **Update**: **Storage Visibility**: The `implicit/` backup directory is now actively tracked and included in the total storage calculation. Deprecated the empty `code_tracker/active/` directory from the UI.

---

## Appendix: Antigravity Changelog Analysis (Background Context)

Reviewed the full [Antigravity changelog](https://antigravity.google/changelog) (v1.11.17 → v1.20.6, Dec 2025 – Mar 2026) against the current extension codebase prior to the v1.4.0 and v1.5.0 updates.

| Changelog Version | Feature | Dashboard Status |
|:---|:---|:---|
| v1.20.5 (Mar 9) | **AGENTS.md** support | ⚠️ **Needed Update** (Added in v1.4.0) |
| v1.20.5 (Mar 9) | Auto-continue deprecated (now always on) | ℹ️ Low impact |
| v1.20.6 (Mar 17) | Fix for customizations (rules/workflows) creation | ✅ No impact — IDE-side fix |
| v1.19.6 (Feb 26) | Account remediation UI for suspended users | ℹ️ Handled by API layer |
| v1.19.4 (Feb 25) | Custom themes support | ✅ No impact — IDE-level feature |
| v1.18.3 (Feb 19) | Artifact download support, settings screens | ✅ No impact — IDE-level feature |
| v1.15.6 (Jan 23) | Terminal Sandboxing (macOS) | ✅ No impact — IDE-level feature |
| v1.14.2 (Jan 13) | **Agent Skills** introduced | ✅ Already tracked (`.agent/skills`) |
| v1.13.3 (Dec 19) | **Google Workspace AI Ultra** support (higher limits) | ✅ Auto-supported via dynamic tier engine |
| v1.12.4 (Dec 17) | Gemini 3 Flash model support | ✅ Handled via API sync in v1.4.0 |
| v1.11.17 (Dec 8) | Secure Mode | ✅ No impact — IDE-level feature |

The primary driver for the recent **v1.4.0** and **v1.5.0** upgrades was identifying and adding full codebase support for the new `AGENTS.md` spec, syncing the internal quota fallback strategies to match the new dynamic model IDs (`M37`, `M36`, `M47`, `M26`), and gaining visibility into the hidden background processes like Pyrefly and headless Chrome components running within local workspaces.
