---
phase: "07"
plan: "05"
subsystem: pi-coding-agent
tags: [vendor-swap, pi-coding-agent, 0.67.2, build-gate]
dependency_graph:
  requires: [07-04]
  provides: [pi-coding-agent-0.67.2]
  affects: [gsd-agent-core, gsd-agent-modes]
tech_stack:
  added: []
  patterns: [full-replace-with-gsd-reapply, d-05-build-gate]
key_files:
  created: []
  modified:
    - packages/pi-coding-agent/package.json
    - packages/pi-coding-agent/src/index.ts
    - packages/pi-coding-agent/src/core/index.ts
    - packages/pi-coding-agent/src/core/extensions/index.ts
    - packages/pi-coding-agent/src/core/keybindings.ts
    - packages/pi-coding-agent/src/core/lsp/lspmux.ts
    - packages/pi-coding-agent/src/core/messages.ts
    - packages/pi-coding-agent/src/modes/interactive/components/chat-frame.ts
    - packages/pi-coding-agent/src/modes/interactive/components/provider-manager.ts
    - packages/pi-coding-agent/src/modes/interactive/components/tree-render-utils.ts
    - packages/pi-coding-agent/src/modes/interactive/theme/theme.ts
decisions:
  - "GSD extensions/index.ts replaced upstream; broken 0.57.1 exports removed from re-export list (types removed in 0.67.2 are TS2305, not TS2307)"
  - "provider-manager.ts stubbed model-discovery and models-json-writer (removed in 0.67.2)"
  - "constants.ts removed in 0.67.2; lspmux.ts now inlines LSP_LIVENESS_TIMEOUT_MS and LSP_STATE_CACHE_TTL_MS"
  - "AppKeybinding/ResolvedCommand/SourceInfo/defineTool/isBashToolResult guards sourced from their 0.67.2 direct files in src/index.ts"
  - "Module augmentation @mariozechner/pi-tui → @gsd/pi-tui fixed in keybindings.ts and theme.ts"
metrics:
  duration: ~45min
  completed: "2026-04-16"
  tasks_completed: 3
  files_modified: 11
---

# Phase 07 Plan 05: Swap pi-coding-agent Summary

**One-liner:** Full source replace of pi-coding-agent with 0.67.2 upstream, GSD additions re-applied to new paths, all TS2307 errors resolved; build gate passes with 0 TS2307 and non-empty TS2305/TS2322 stderr (Phase 08 scope).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 5-1 | Full replace + import rename + new deps | c7d911e4b | packages/pi-coding-agent/src/* (231 files), package.json |
| 5-2 | Re-apply GSD additions | 0a22be4b1 | extensions/, lsp/, theme/, resources/, types/, components/, tests/ |
| 5-3 | Build gate + TS2307 fixes | b4fe77213 | 10 files — path fixes, module augmentation renames, stubbed missing APIs |

## What Was Done

### Task 5-1: Full Replace
- Removed 0.57.1 `src/` and copied 0.67.2 upstream source from `/tmp/pi-mono-0.67.2/packages/coding-agent/src/`
- Renamed all `@mariozechner/pi-*` imports to `@gsd/pi-*` (~68 files); verified `@mariozechner/jiti` was not renamed
- Added `piVersion: "0.67.2"` to package.json
- Added new 0.67.2 deps: `ajv`, `cli-highlight`, `uuid`
- Ran `npm install`

### Task 5-2: GSD Additions Re-applied
- Restored 8 GSD-only extension files to `src/core/extensions/`
- Replaced upstream `extensions/index.ts` with GSD version (exports GSD-only symbols)
- Restored `keybindings-types.ts`, `lsp/`, `theme/` to `src/core/`
- Restored `resources/`, `types/` to `src/`
- Restored 5 GSD-only component files to new upstream path `src/modes/interactive/components/`
- Restored `tests/path-display.test.ts`
- Added GSD re-export blocks to `src/index.ts` and `src/core/index.ts`

### Task 5-3: Build Gate + TS2307 Fixes

Fixed all TS2307 (missing module) errors per D-06:

| Error | File | Fix |
|-------|------|-----|
| `../core/theme/theme.js` not found | chat-frame.ts, tree-render-utils.ts | Updated to `../../../core/theme/theme.js` |
| `../core/model-discovery.js` not found | provider-manager.ts | Removed import; stubbed `getDiscoverableProviders()` inline |
| `../core/models-json-writer.js` not found | provider-manager.ts | Removed import; stubbed `ModelsJsonWriter` class inline |
| `../core/auth-storage.js` not found | provider-manager.ts | Fixed to `../../../core/auth-storage.js` |
| `../core/model-registry.js` not found | provider-manager.ts | Fixed to `../../../core/model-registry.js` |
| `../core/theme/theme.js` not found | provider-manager.ts | Fixed to `../../../core/theme/theme.js` |
| `../constants.js` not found | lsp/lspmux.ts | Inlined `LSP_LIVENESS_TIMEOUT_MS` and `LSP_STATE_CACHE_TTL_MS` |
| `@mariozechner/pi-tui` module augmentation | keybindings.ts | Renamed to `@gsd/pi-tui` |
| `@mariozechner/pi-tui` in return type | modes/interactive/theme/theme.ts | Renamed to `@gsd/pi-tui` |
| `@mariozechner/pi-agent-core` module augmentation | core/messages.ts | Renamed to `@gsd/pi-agent-core` |
| `AppKeybinding`, `ResolvedCommand`, `SourceInfo`, `defineTool`, `isBashToolResult` etc. not in extensions/index.js | src/index.ts, core/index.ts | Sourced from `core/keybindings.js`, `core/extensions/types.js`, `core/source-info.js` directly |
| Broken exports from loader.js/wrapper.js | extensions/index.ts (GSD) | Removed `getUntrustedExtensionPaths`, `importExtensionModule`, `isProjectTrusted`, `trustProject`, `wrapToolsWithExtensions`, `wrapToolWithExtensions` (removed in 0.67.2) |

**Build Gate Result:** PASS per D-05 — 0 TS2307, stderr non-empty with TS2305/TS2322 errors (expected API shape mismatches for Phase 08).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] dist/ TS5055 overwrite conflict**
- **Found during:** Task 5-3 first build run
- **Issue:** Prior build attempts left stale `dist/*.d.ts` files; TypeScript's incremental mode re-included them causing TS5055 "would overwrite input file" errors
- **Fix:** Cleaned `dist/` and `tsconfig.tsbuildinfo` before each gate run
- **Files modified:** None (operational fix)

**2. [Rule 1 - Bug] Module augmentation uses @mariozechner/ names**
- **Found during:** Task 5-3
- **Issue:** `keybindings.ts` and `messages.ts` had `declare module "@mariozechner/pi-tui"` and `declare module "@mariozechner/pi-agent-core"` — these augmentations were not renamed by the sed pass (it only targets `from "..."` import statements)
- **Fix:** Manually renamed to `@gsd/pi-tui` and `@gsd/pi-agent-core`
- **Files modified:** `core/keybindings.ts`, `core/messages.ts`
- **Commit:** b4fe77213

**3. [Rule 1 - Bug] provider-manager.ts imports from removed 0.67.2 modules**
- **Found during:** Task 5-3
- **Issue:** GSD `provider-manager.ts` imported `model-discovery.ts` and `models-json-writer.ts` which were removed in 0.67.2 upstream
- **Fix:** Removed imports, inlined stubs for `getDiscoverableProviders()`, `ModelsJsonWriter`, and `providerDisplayName()`; fixed remaining relative paths
- **Files modified:** `modes/interactive/components/provider-manager.ts`
- **Commit:** b4fe77213

**4. [Rule 1 - Bug] lsp/lspmux.ts imports from removed constants.ts**
- **Found during:** Task 5-3
- **Issue:** GSD `lspmux.ts` imported `LSP_LIVENESS_TIMEOUT_MS` and `LSP_STATE_CACHE_TTL_MS` from `../constants.js` which was removed in 0.67.2
- **Fix:** Inlined the constant values directly in lspmux.ts
- **Files modified:** `core/lsp/lspmux.ts`
- **Commit:** b4fe77213

**5. [Rule 1 - Bug] extensions/index.ts (GSD) re-exports symbols removed in 0.67.2**
- **Found during:** Task 5-3
- **Issue:** GSD extensions/index.ts re-exported types from `./types.js` and functions from `./loader.js`/`./wrapper.js` that no longer exist in 0.67.2's versions of those files
- **Fix:** Removed broken exports; remaining TS2305 errors are API shape changes (Phase 08 scope)
- **Files modified:** `core/extensions/index.ts`
- **Commit:** b4fe77213

## Known Remaining Issues (Phase 08 scope)

These TS2305/TS2322/TS2345 errors are acceptable per D-05 (not TS2307) and are Phase 08 API migration targets:

- `extensions/index.ts`: ~17 types re-exported from `./types.js` that were removed/renamed in 0.67.2 (AppAction, AdjustToolSetEvent, SessionForkEvent, SessionSwitchEvent, ToolCompatibility, BashTransformEvent, LifecycleHook* types, SessionDirectory* types)
- `provider-manager.ts`: keybinding key name mismatches (`selectUp/Down/Cancel/Confirm` vs 0.67.2 names), private `modelsJsonPath` access
- `resources/extensions/memory/index.ts`: `getMemorySettings` removed from `SettingsManager`

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| `src/modes/interactive/components/provider-manager.ts` | `getDiscoverableProviders()` returns `[]` | `model-discovery.ts` removed in 0.67.2 |
| `src/modes/interactive/components/provider-manager.ts` | `ModelsJsonWriter` is a no-op stub | `models-json-writer.ts` removed in 0.67.2 |
| `src/modes/interactive/components/provider-manager.ts` | `providerDisplayName(name)` returns `name` | `providerDisplayName` removed from `model-selector.ts` in 0.67.2 |

These stubs are intentional for Phase 07. The ProviderManagerComponent's discovery and model-json-write functionality will be repaired in Phase 08 or 09 when the API migration is complete.

## Self-Check: PASSED

**Files verified:**
- FOUND: packages/pi-coding-agent/src/index.ts
- FOUND: packages/pi-coding-agent/src/core/index.ts
- FOUND: packages/pi-coding-agent/src/core/extensions/index.ts
- FOUND: packages/pi-coding-agent/src/core/keybindings.ts
- FOUND: packages/pi-coding-agent/src/core/lsp/lspmux.ts
- FOUND: packages/pi-coding-agent/src/core/messages.ts
- FOUND: packages/pi-coding-agent/src/modes/interactive/components/chat-frame.ts
- FOUND: packages/pi-coding-agent/src/modes/interactive/components/provider-manager.ts
- FOUND: packages/pi-coding-agent/src/modes/interactive/components/tree-render-utils.ts
- FOUND: packages/pi-coding-agent/src/modes/interactive/theme/theme.ts

**Commits verified:**
- FOUND: c7d911e4b feat(07-05): replace pi-coding-agent src with 0.67.2 upstream, rename imports, add new deps
- FOUND: 0a22be4b1 feat(07-05): re-apply GSD additions to 0.67.2 pi-coding-agent source
- FOUND: b4fe77213 fix(07-05): resolve TS2307 errors in pi-coding-agent 0.67.2 swap
