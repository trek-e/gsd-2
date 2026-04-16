---
phase: 07-vendor-swap
plan: "03"
subsystem: infra
tags: [pi-mono, vendor, pi-agent-core, upgrade]

# Dependency graph
requires:
  - "07-02 — pi-ai swapped to 0.67.2"
  - "/tmp/pi-mono-0.67.2 — pi-mono source at v0.67.2"
provides:
  - "packages/pi-agent-core — upgraded to 0.67.2 source with @gsd/pi-* imports and piVersion marker"
affects: [07-04, 07-05, 07-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "piVersion field in package.json marks each vendored package version for traceability (D-10)"
    - "@mariozechner/pi-* → @gsd/pi-* import rename applied via sed across all source files"

key-files:
  created:
    - "packages/pi-agent-core/src/agent-loop.ts (replaced)"
    - "packages/pi-agent-core/src/agent.ts (replaced)"
    - "packages/pi-agent-core/src/proxy.ts (replaced)"
    - "packages/pi-agent-core/src/types.ts (replaced)"
    - "packages/pi-agent-core/src/index.ts (replaced)"
  modified:
    - "packages/pi-agent-core/package.json (added piVersion: 0.67.2)"

key-decisions:
  - "0.67.2 source for packages/agent does not include test files (agent-loop.test.ts, agent.test.ts) — deleted as intentional upstream removal"
  - "Build gate passed with 0 type errors — no TS2307 fixes required"

requirements-completed: [VEND-01]

# Metrics
duration: 5min
completed: 2026-04-16
---

# Phase 07 Plan 03: Swap pi-agent-core Summary

**pi-agent-core source replaced with 0.67.2 upstream, @mariozechner/pi-* imports renamed to @gsd/pi-*, piVersion marker added, and build gate passed with zero type errors**

## Performance

- **Duration:** ~5 min
- **Completed:** 2026-04-16
- **Tasks:** 2 (1 committed, 1 verification-only)
- **Files modified:** 5 source files replaced, 1 package.json updated

## Accomplishments

- Replaced pi-agent-core/src/ with 0.67.2 source from /tmp/pi-mono-0.67.2/packages/agent/src/
- Renamed all @mariozechner/pi-* imports to @gsd/pi-* across 4 files (agent.ts, proxy.ts, agent-loop.ts, types.ts)
- Added piVersion: "0.67.2" to package.json per D-10 traceability requirement
- Build gate (`npm run build:pi-agent-core`) passed: 0 type errors, 0 TS2307, no panics

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 3-1 | Replace pi-agent-core source and add piVersion | 7bbc53fa1 | packages/pi-agent-core/src/* (5 files), packages/pi-agent-core/package.json |
| 3-2 | Build gate for pi-agent-core | (no files modified — verification only) | — |

## Files Created/Modified

- `packages/pi-agent-core/src/agent-loop.ts` — replaced with 0.67.2, @gsd/pi-* imports
- `packages/pi-agent-core/src/agent.ts` — replaced with 0.67.2, @gsd/pi-* imports
- `packages/pi-agent-core/src/proxy.ts` — replaced with 0.67.2, @gsd/pi-* imports
- `packages/pi-agent-core/src/types.ts` — replaced with 0.67.2, @gsd/pi-* imports
- `packages/pi-agent-core/src/index.ts` — replaced with 0.67.2
- `packages/pi-agent-core/package.json` — added `piVersion: "0.67.2"`

## Decisions Made

- 0.67.2 source does not ship test files (agent-loop.test.ts, agent.test.ts) — these were deleted as intentional upstream removal, not a regression
- Build gate passed cleanly with 0 type errors — no inline TS2307 fixes were needed

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — build infrastructure only, no new network endpoints or auth paths.

## Self-Check

- packages/pi-agent-core/src/ exists with 0.67.2 files: PASS
- piVersion === "0.67.2" in package.json: PASS
- No @mariozechner/pi-* imports remain in src/: PASS
- Build gate: 0 type errors, 0 TS2307: PASS
- Commit 7bbc53fa1 exists: PASS

## Self-Check: PASSED

---
*Phase: 07-vendor-swap*
*Completed: 2026-04-16*
