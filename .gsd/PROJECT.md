# Project

## What This Is

GSD (Get Shit Done) is a coding agent harness built as a pi extension. It manages structured planning and execution workflows — milestones, slices, tasks — with automated git branching, LLM-driven execution, and mechanical verification.

This project is the GSD extension itself (`gsd-pi`), a TypeScript package that provides the `/gsd` command, auto-mode orchestration, worktree management, and all planning/execution infrastructure.

## Core Value

Deterministic, reliable git operations that keep main clean and working while agents do the coding. The user never touches git — the system handles branching, committing, merging, and recovery.

## Current State

GSD is a working, shipped product (v2.4.0). The trust boundary between deterministic code and LLM prompts has been fixed: all git operations now route through a centralized `GitService` class. Smart staging excludes runtime files, commit types are inferred from slice titles, merge guards auto-detect and run tests before landing on main, hidden snapshot refs enable rollback, and prompts contain no raw git commands. The thin facade in `worktree.ts` preserves backward compatibility while delegating to `GitServiceImpl`.

## Architecture / Key Patterns

- TypeScript, compiled with `tsc`, tested with Node's built-in test runner
- Extension entry: `src/resources/extensions/gsd/index.ts`
- Orchestrator: `auto.ts` (2600+ lines) — dispatches units, manages lifecycle
- Git operations: `git-service.ts` (centralized GitService), `worktree.ts` (thin facade for backward compat), `worktree-manager.ts` (git worktrees), `worktree-command.ts` (CLI commands)
- Prompts: `prompts/*.md` — Handlebars-templated instructions for LLM units (no raw git commands)
- Preferences: `preferences.ts` — YAML frontmatter in markdown files, includes `git?: GitPreferences`
- Patterns: `execSync` for git via `runGit()` helper, `SKIP_PATHS` for diff filtering, smart staging with exclusion filter

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: Deterministic GitService — Centralized all git mechanics into GitService, fixed bugs, removed git from prompts, added merge guards and recovery. All 18 requirements validated.
