---
status: complete
phase: 07-vendor-swap
source: [07-01-SUMMARY.md, 07-02-SUMMARY.md, 07-03-SUMMARY.md, 07-04-SUMMARY.md, 07-05-SUMMARY.md, 07-06-SUMMARY.md]
started: 2026-04-15T00:00:00Z
updated: 2026-04-15T12:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Build:pi passes gate
expected: Run `npm run build:pi` from workspace root — completes without compiler crash or TS2307 errors. API shape errors (TS2305/TS2322/TS2345) are acceptable.
result: pass
note: TS5055 stale-dist issue fixed (prebuild clean added). 24 TS2305/TS2724/TS2345/TS2551 errors present — all catalogued, no TS2307.

### 2. piVersion markers at 0.67.2
expected: Run `grep -r '"piVersion"' packages/pi-*/package.json` — returns "0.67.2" for all four packages (pi-ai, pi-agent-core, pi-tui, pi-coding-agent).
result: pass

### 3. Vendor seam: @mariozechner imports resolve via file: aliases
expected: @mariozechner/pi-* imports in source resolve to local packages via file: aliases in package.json (the rename approach was reverted in favour of file: aliases per commit 1640e6583).
result: pass
note: imports present as expected; pi-coding-agent/package.json maps @mariozechner/pi-* to file:../pi-{ai,agent-core,tui}. Original test expectation was wrong (derived from pre-revert SUMMARYs).

### 4. Error catalogue exists and is populated
expected: `.planning/phases/07-vendor-swap/type-errors.md` exists and lists 24 type errors, all attributed to @gsd/pi-coding-agent — verifiable by opening the file or running `wc -l .planning/phases/07-vendor-swap/type-errors.md`.
result: pass
note: 43 lines confirmed, matches Plan 06 output exactly.

### 5. GSD additions intact in pi-coding-agent
expected: Key GSD-authored files are present in pi-coding-agent after the swap: `packages/pi-coding-agent/src/core/extensions/` contains GSD extension files, and `packages/pi-coding-agent/src/modes/interactive/components/` contains chat-frame.ts, provider-manager.ts, tree-render-utils.ts.
result: pass
note: All three GSD component files confirmed present. Extensions directory complete.

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
