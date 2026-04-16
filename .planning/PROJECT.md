# GSD 2 — Pi Clean Seam

## What This Is

GSD 2 is a standalone CLI coding agent built on the Pi SDK (pi-mono), distributed as `gsd-pi` on npm. It vendors four pi-mono packages as source copies and has accumulated ~79 GSD-authored TypeScript files mixed inside those vendored packages. This milestone extracts that GSD code into two new compiler-enforced workspace packages, establishing a clean boundary between GSD logic and pi-mono upstream code.

## Core Value

When a new pi-mono release ships, a maintainer can update the vendored pi packages and fix type errors only in GSD-owned packages — no file-by-file archaeology required.

## Previous Milestone: v1.0 Pi Clean Seam ✓

Extracted all GSD-authored code into `@gsd/agent-core` and `@gsd/agent-modes`, enforcing the seam at the compiler level. Shipped on branch `refactor/pi-clean-seam` (PR #4282).

## Current Milestone: v1.1 Pi 0.67.2 Upgrade

**Goal:** Update vendored pi-mono packages from 0.57.1 → 0.67.2, migrate all breaking API changes, fix the circular type dep between pi-coding-agent and GSD packages, and ship as gsd-pi@2.8.0.

**Target features:**
- Vendor pi-mono 0.67.2 source into `packages/` (replacing 0.57.1)
- Migrate `session_switch`/`session_fork` → `session_start` with `event.reason` (v0.65.0 breaking change)
- Migrate `ModelRegistry` public constructor → `create()`/`inMemory()` factory methods
- Adopt `createAgentSessionRuntime()`/`AgentSessionRuntime` pattern in `gsd-agent-core`
- Fix `edit` tool callers to use `edits[]` exclusively (v0.63.2)
- Fix circular type dep (`pi-coding-agent` ↔ `gsd-agent-core`/`gsd-agent-modes`) via `@gsd/agent-types` shared package
- Fix any remaining integration/dependency issues surfaced during upgrade
- Bump version to 2.8.0

**Delivery:** All work continues on branch `refactor/pi-clean-seam` (PR #4282).

## Requirements

### Validated

- [x] `@gsd/agent-modes` package scaffolded with `package.json`, `tsconfig.json`, `index.ts` *(Phase 02: Package Scaffolding)*
- [x] All run-mode and CLI files migrated from `pi-coding-agent/src/` to `gsd-agent-modes/src/` *(Phase 03: @gsd/agent-modes Extraction)*
- [x] `@gsd/agent-core` package scaffolded with `package.json`, `tsconfig.json`, `index.ts` *(Phase 04: @gsd/agent-core Extraction)*
- [x] All session orchestration files migrated from `pi-coding-agent/src/core/` to `gsd-agent-core/src/` *(Phase 04: @gsd/agent-core Extraction)*
- [x] `pi-coding-agent` contains only upstream files + extension system (no GSD business logic) *(Phase 03–05)*
- [x] Extension loader virtual module map updated with `@gsd/agent-core` and `@gsd/agent-modes` *(Phase 06-02)*
- [x] All internal-path imports fixed to use public package exports *(Phase 05–06)*
- [x] Workspace build script updated to 5-step dependency order *(Phase 02)*
- [x] Full build passes (`tsc --noEmit`, binary builds) *(Phase 06-01/02)*
- [x] Existing extensions load and execute without modification *(Phase 06-02, VER-06)*
- [x] `gsd --version` produces correct output from built binary *(Phase 06-02, VER-04)*
- [x] Vendored pi-mono packages updated to 0.67.2 *(Phase 07: Vendor Swap)*

### Active

- [ ] `session_switch`/`session_fork` extension events migrated to `session_start` with `event.reason`
- [ ] `ModelRegistry` callers migrated to `create()`/`inMemory()` factory methods
- [ ] `createAgentSessionRuntime()`/`AgentSessionRuntime` adopted in `gsd-agent-core`
- [ ] `edit` tool callers use `edits[]` exclusively
- [ ] Circular type dep between `pi-coding-agent` ↔ `gsd-agent-core`/`gsd-agent-modes` resolved
- [ ] All integration/dependency issues from pi upgrade resolved
- [ ] Full build passes and test suite at 0 new failures vs upgraded baseline
- [ ] Version bumped to 2.8.0

### Out of Scope

- Moving pi packages to npm dependencies (`@mariozechner/pi-*`) — Phase 2, blocked by `@gsd/native` imports and extension API gap
- Creating an abstraction layer over pi types — GSD packages use pi types directly (intentional)
- Upstreaming GSD modifications to pi-mono — desirable long-term, out of scope
- Pi-mono v0.67.2 update / `session_switch`/`session_fork` migration — easier after seam is in place, deferred
- Any user-facing CLI behavior changes — install experience must be identical

## Context

**Current structure:** Four pi-mono packages vendored as source copies in `/packages/`: `pi-agent-core`, `pi-ai`, `pi-tui`, `pi-coding-agent`. GSD-authored code (~79 files) lives inside `pi-coding-agent/src/`, mixed with upstream pi code.

**The problem:** No reliable way to distinguish GSD files from pi files without reading them individually. Pi-mono is 10 versions behind upstream (0.57.1 vs 0.67.2 as of April 2026). A breaking API change (`session_switch`/`session_fork` removal in v0.65.0) is unresolved.

**Key files moving to `@gsd/agent-core`:** `agent-session.ts` (98KB), `sdk.ts`, `compaction/`, `system-prompt.ts`, `bash-executor.ts`, `fallback-resolver.ts`, `lifecycle-hooks.ts`, `image-overflow-recovery.ts`, `contextual-tips.ts`, `keybindings.ts`, `artifact-manager.ts`, `blob-store.ts`, `export-html/`

**Key files moving to `@gsd/agent-modes`:** `modes/interactive/` (~30 files), `modes/rpc/`, `modes/print/`, `modes/shared/`, `cli/args.ts`, `cli/config-selector.ts`, `cli/session-picker.ts`, `cli/list-models.ts`, `cli/file-processor.ts`, `main.ts`

**Known issues to fix during migration** (from ADR-010):
- `web/bridge-service.ts` imports `AgentSessionEvent` from internal pi-coding-agent path
- `clearQueue()` may need public type export
- `buildSessionContext()` on `SessionManager` — evaluate re-export vs remove dependency

## Constraints

- **Compatibility:** End-user install (`npm install -g gsd-pi@latest`) must produce identical binary behavior
- **Extension API:** Extension authors must not need to change import paths — extension API surface stays in `@gsd/pi-coding-agent`
- **Module boundary:** Pi packages must not import `@gsd/agent-core` or `@gsd/agent-modes` — enforced by TypeScript compiler
- **No abstraction layer:** GSD code may freely use pi types (`AgentMessage`, `Model`, `TUI`, etc.) — seam is a clear seam, not an indirection layer
- **Branch discipline:** All work on `refactor/pi-clean-seam`, PR at end, no commits to main

## Development Methodology

- **Principles:** DRY, encapsulation, functional decomposition, abstraction, generics, functional overloading, rest parameters, SRP, modularization, closures
- **Process:** Red/green/refactor TDD + rubber duck methodology

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Two packages (agent-core + agent-modes) over one | Headless/RPC consumers should not pull in TUI; concerns have different consumers | ✓ Shipped — both packages compile and export cleanly |
| Extension system stays in pi-coding-agent | It is legitimately pi-typed; moving it would require re-expressing pi types in GSD terms | ✓ Confirmed — extension API surface unchanged for extension authors |
| Seam is compiler-enforced (packages), not convention | A future accidental cross-import caught by compiler, not code review | ✓ Confirmed — pi packages have zero @gsd/* imports (VER-06) |
| Pi v0.67.2 update deferred | Update is dramatically simpler once seam is in place | ✓ Remains deferred — seam now in place, update unblocked for next milestone |
| private modifier reverted on FallbackResolver._findAvailableInChain | TypeScript treats private members from different module paths as nominally incompatible (src vs dist); dual-module-path issue breaks TS2322 | ✓ Fixed Phase 06-01 — reverted to underscore-prefix convention |
| clean script scoped to pi-chain packages only (not packages/\*) | Circular type deps between pi-coding-agent ↔ gsd-agent-core/agent-modes: cleaning all dist makes bootstrap impossible | ✓ Fixed Phase 06-04 — `npm run clean` targets native + pi-* only |
| Vendor seam via `file:` aliases, not import renames | Renaming @mariozechner→@gsd in upstream src couples GSD to every future upgrade; file: aliases keep upstream source unmodified | ✓ Phase 07 — pi-coding-agent/package.json maps @mariozechner/pi-* to file:../pi-{ai,agent-core,tui} |
| `prebuild` clean in pi-coding-agent | tsc incremental mode causes TS5055 "would overwrite input file" when dist/.d.ts files exist from a prior build; prebuild rm -rf makes build:pi idempotent | ✓ Phase 07 UAT — committed to packages/pi-coding-agent/package.json |
| `partial-json` added as runtime dep in pi-ai | New in 0.67.2 — `src/utils/json-parse.ts` imports it at runtime for streaming partial JSON; must be `dependencies`, not `devDependencies` | ✓ Phase 07-02 — added to packages/pi-ai/package.json |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-16 — Phase 07 complete: all four pi-mono packages at 0.67.2, vendor seam established via file: aliases, 24 API shape errors catalogued for Phase 08*
