# Requirements

This file is the explicit capability and coverage contract for the project.

## Active

(No active requirements — all M001 requirements validated.)

## Validated

### R001 — Centralized GitService class
- Class: core-capability
- Status: validated
- Description: A single `GitService` class in `git-service.ts` that owns all git mechanics — commit, branch, merge, checkout, staging
- Why it matters: Moves git operations from probabilistic LLM prompts to deterministic code. The foundational trust boundary fix.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S02
- Validation: git-service.ts exists with GitServiceImpl class. npm run build passes. Unit tests pass.
- Notes: Uses existing `runGit()` pattern from worktree.ts

### R002 — Smart staging with exclusion filter
- Class: core-capability
- Status: validated
- Description: Replace `git add -A` with filtered staging that excludes known runtime paths (.gsd/runtime/, .gsd/activity/, .gsd/STATE.md, .gsd/auto.lock, .gsd/metrics.json)
- Why it matters: Prevents accidental commits of runtime/bookkeeping files that should never be tracked
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: RUNTIME_EXCLUSION_PATHS in git-service.ts. Fallback to git add -A verified by unit test.
- Notes: Fallback to `git add -A` with warning if filtering fails

### R003 — Conventional commit type inference
- Class: quality-attribute
- Status: validated
- Description: Infer commit type (feat/fix/refactor/docs/test/chore) from slice title keywords instead of hardcoding `feat`
- Why it matters: Accurate git history that can be filtered and parsed by conventional-commits tooling
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: inferCommitType() with COMMIT_TYPE_RULES in git-service.ts. Unit tests verify keyword matching.
- Notes: Default to `feat` when no keywords match. Plurals handled (D013).

### R004 — Git preferences schema
- Class: core-capability
- Status: validated
- Description: Add `git?: GitPreferences` to GSDPreferences interface with validation, merge logic, and documentation
- Why it matters: Enables all preference-gated git features (auto_push, merge guards, etc.) via existing preferences system
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S05
- Validation: GitPreferences on line 55 of preferences.ts. Validation logic, template, and docs/preferences-reference.md exist.
- Notes: Fields: auto_push, push_branches, remote, snapshots, pre_merge_check, commit_type

### R005 — worktree.ts thin facade delegation
- Class: core-capability
- Status: validated
- Description: worktree.ts keeps existing exports but delegates internally to GitService. All existing callers continue to work without changes.
- Why it matters: Backward compatibility — existing imports from worktree.ts don't break
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: worktree.ts delegates to GitServiceImpl. npm run build passes. Existing worktree tests pass.
- Notes: New code should import from GitService directly

### R006 — auto.ts wired to GitService
- Class: core-capability
- Status: validated
- Description: Replace inline git calls in auto.ts (git add -A, autoCommitCurrentBranch, ensureSliceBranch, switchToMain, mergeSliceToMain) with GitService methods
- Why it matters: The orchestrator is the primary caller of git operations — it must route through the centralized service
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: auto.ts imports and initializes GitServiceImpl. Only init bootstrap retains inline git (allowed by spec).
- Notes: git status --porcelain for idle detection and git rev-parse --git-dir for init check remain inline as allowed

### R007 — Bug fix: worktree create ordering
- Class: quality-attribute
- Status: validated
- Description: Move autoCommitCurrentBranch() BEFORE createWorktree() in worktree-command.ts so new worktrees fork from committed state
- Why it matters: Previously new worktrees forked from pre-commit HEAD, missing the user's latest saved state
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: worktree-command.ts reordered per S03. npm run build passes.
- Notes: Fixed in S03

### R008 — Bug fix: worktree merge dispatch
- Class: quality-attribute
- Status: validated
- Description: Use deterministic mergeWorktreeToMain() helper as default merge path in worktree-command.ts. Keep LLM-mediated path only for complex conflict resolution.
- Why it matters: The deterministic helper already exists but wasn't used as the default — merge went through LLM unnecessarily
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: worktree-command.ts uses deterministic helper as default per S03.
- Notes: Fixed in S03

### R009 — Bug fix: hardcoded feat commit type
- Class: quality-attribute
- Status: validated
- Description: Replace hardcoded `feat(...)` in mergeSliceToMain with inferCommitType() from GitService
- Why it matters: Bugfix slices, docs slices, refactor slices were mislabeled as `feat`
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S02
- Validation: mergeSliceToMain calls inferCommitType(). Unit tests verify correct type inference.
- Notes: Fixed in S01, wired in S02

### R010 — Doc fixes: branch preservation + checkpoint claims
- Class: quality-attribute
- Status: validated
- Description: Fix README.md "preserved" claim to "deleted after merge". Fix GSD-WORKFLOW.md "Branch kept" to "Branch deleted". Replace checkpoint commit documentation with snapshot ref description.
- Why it matters: Docs previously claimed behaviors the code didn't implement — eroded trust
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: README.md says "deleted after merge" (line 260). GSD-WORKFLOW.md says "Branch deleted" (line 551).
- Notes: Fixed in S03

### R011 — Remove raw git commands from prompts
- Class: core-capability
- Status: validated
- Description: Replace `git add -A && git commit` instructions in execute-task.md, complete-slice.md, replan-slice.md, complete-milestone.md with "the system commits automatically" messages
- Why it matters: LLMs should not run git commands — that's the whole point of the GitService trust boundary
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: grep of 4 prompt files returns zero git command matches. worktree-merge.md unchanged.
- Notes: worktree-merge.md kept as-is (conflict resolution needs LLM judgment)

### R012 — Pre-merge verification (merge guards)
- Class: core-capability
- Status: validated
- Description: Auto-detect test/typecheck/build commands from package.json, Cargo.toml, Makefile, pyproject.toml. Run before squash merge. Abort on failure.
- Why it matters: Prevents broken code from landing on main
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: runPreMergeCheck() in git-service.ts. Runs after squash before commit, resets on failure (D015). Unit tests pass.
- Notes: Configurable via git.pre_merge_check preference: "auto" (default), false (skip), or custom command

### R013 — Hidden snapshot refs for rollback
- Class: core-capability
- Status: validated
- Description: Create refs/gsd/snapshots/<branch>/<timestamp> before merges and risky operations. Prunable after 7 days.
- Why it matters: Invisible recovery points without cluttering branch history with checkpoint commits
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: createSnapshot() in git-service.ts. Gated by prefs.snapshots === true (D018). Unit tests pass.
- Notes: Invisible to normal git log. Visible via git for-each-ref refs/gsd/snapshots/

### R014 — Optional auto-push (preference-gated)
- Class: core-capability
- Status: validated
- Description: When git.auto_push: true, push main to remote after slice merge. Optionally push slice branches during work.
- Why it matters: Remote backup and team visibility for senior engineers
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: auto-push logic in mergeSliceToMain, gated by prefs.auto_push. Unit tests verify push behavior.
- Notes: Default: false. Remote name configurable via git.remote (default: "origin")

### R015 — Rich squash commit messages with task lists
- Class: quality-attribute
- Status: validated
- Description: Squash merge commits include task list extracted from branch commit history and branch reference for forensics
- Why it matters: Self-documenting git history that reads like a changelog
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: Rich commit builder in git-service.ts. Uses -F - stdin pipe (D016). Unit tests pass.
- Notes: Format: type(scope): title\n\nTasks:\n- T01: ...\n\nBranch: gsd/M001/S01

### R016 — Bug fix: stale branch base with remote fetch
- Class: quality-attribute
- Status: validated
- Description: When a remote exists, git fetch --prune before cutting a new slice branch. Warn (don't block) if local main is behind origin.
- Why it matters: Prevents branching from stale trunk HEAD
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: Remote fetch in ensureSliceBranch. Behind-upstream warning verified by unit test.
- Notes: Only when remote exists and auto_push is enabled or remote is configured

### R017 — GitService unit tests
- Class: quality-attribute
- Status: validated
- Description: Unit tests using temp git repos for all GitService methods, following the existing worktree test patterns
- Why it matters: Mechanical verification that git operations work correctly
- Source: inferred
- Primary owning slice: M001/S01
- Supporting slices: M001/S05
- Validation: git-service.test.ts has 30 test cases, all passing. Uses temp git repos.
- Notes: Same test infrastructure as worktree.test.ts

### R018 — Archive design input files
- Class: quality-attribute
- Status: validated
- Description: Remove or archive CODEX-GIT-SYNTHESIS.md, CLAUDE-GIT-SYNTHESIS.md, GEMINI-GIT-SYNTHESIS.md, and ONBOARDING-PLAN.md
- Why it matters: Design input files are not permanent docs — they clutter the repo after implementation
- Source: user
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: All 4 files confirmed deleted. Git history preserves them.
- Notes: Deleted in S06

## Deferred

### R019 — PR creation workflow
- Class: core-capability
- Status: deferred
- Description: Auto-create PRs via gh CLI after slice merge when git.auto_pr is enabled
- Why it matters: Team workflow integration for shared repos with protected branches
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred — touches GitHub API, gh CLI detection, merge queue awareness. Separate concern from core GitService.

### R020 — Milestone tags on completion
- Class: quality-attribute
- Status: deferred
- Description: Create annotated git tags on milestone completion (e.g. M001)
- Why it matters: Enables git describe, changelog generation, and clear release markers
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred — low value relative to core trust boundary fix

### R021 — Full file ownership tracking
- Class: core-capability
- Status: deferred
- Description: Track every file the agent creates/modifies per unit. Only stage owned files.
- Why it matters: More precise staging than exclusion filter — prevents unrelated user edits from being committed
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred — requires threading ownership through entire execution pipeline. Exclusion filter covers 95% of the problem.

## Out of Scope

### R022 — Git Notes for metadata
- Class: anti-feature
- Status: out-of-scope
- Description: Store task plans and verification results in git notes
- Why it matters: Prevents fragile, poorly-supported metadata mechanism from entering the codebase
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Git Notes are fragile, poorly rendered by most tools, unreliable push/pull semantics

### R023 — Shadow worktrees as default model
- Class: anti-feature
- Status: out-of-scope
- Description: Make git worktrees the default execution model for all agent work
- Why it matters: Over-engineering for common single-agent case. Worktrees are already available as advanced opt-in.
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Rejected from Gemini's proposal

### R024 — AI-driven rebases
- Class: anti-feature
- Status: out-of-scope
- Description: LLM-driven interactive rebase and cross-slice conflict resolution
- Why it matters: Prevents hidden magic that makes senior engineers distrust the system
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Merge conflicts require deterministic resolution or human intervention

### R025 — Stacked branches
- Class: anti-feature
- Status: out-of-scope
- Description: Stacked branch/PR workflow as default execution model
- Why it matters: Over-engineering for solo/vibe coder workflows
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Could be opt-in advanced mode in a future milestone

### R026 — CI/CD integration
- Class: anti-feature
- Status: out-of-scope
- Description: Deployment pipeline integration from GSD
- Why it matters: GSD manages work orchestration, not infrastructure
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Merge guards handle "is it broken?" — deployment is the user's concern

### R027 — Commit signing (GPG)
- Class: anti-feature
- Status: out-of-scope
- Description: GPG commit signing for agent commits
- Why it matters: Adds friction with zero value when the agent is the committer
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Could be opt-in preference in a future milestone

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | core-capability | validated | M001/S01 | M001/S02 | git-service.ts exists, build passes |
| R002 | core-capability | validated | M001/S01 | none | smart staging + fallback in unit tests |
| R003 | quality-attribute | validated | M001/S01 | none | inferCommitType unit tests |
| R004 | core-capability | validated | M001/S02 | M001/S05 | preferences.ts git field + docs |
| R005 | core-capability | validated | M001/S02 | none | facade delegates, build passes |
| R006 | core-capability | validated | M001/S02 | none | auto.ts wired to GitServiceImpl |
| R007 | quality-attribute | validated | M001/S03 | none | worktree-command.ts reordered |
| R008 | quality-attribute | validated | M001/S03 | none | deterministic merge as default |
| R009 | quality-attribute | validated | M001/S01 | M001/S02 | inferCommitType replaces hardcoded feat |
| R010 | quality-attribute | validated | M001/S03 | none | README + GSD-WORKFLOW corrected |
| R011 | core-capability | validated | M001/S04 | none | grep confirms zero git commands |
| R012 | core-capability | validated | M001/S05 | none | runPreMergeCheck unit tests |
| R013 | core-capability | validated | M001/S05 | none | createSnapshot unit tests |
| R014 | core-capability | validated | M001/S05 | none | auto-push unit tests |
| R015 | quality-attribute | validated | M001/S05 | none | rich commit builder unit tests |
| R016 | quality-attribute | validated | M001/S05 | none | remote fetch unit tests |
| R017 | quality-attribute | validated | M001/S01 | M001/S05 | 30 tests in git-service.test.ts |
| R018 | quality-attribute | validated | M001/S06 | none | 4 files confirmed deleted |
| R019 | core-capability | deferred | none | none | unmapped |
| R020 | quality-attribute | deferred | none | none | unmapped |
| R021 | core-capability | deferred | none | none | unmapped |
| R022 | anti-feature | out-of-scope | none | none | n/a |
| R023 | anti-feature | out-of-scope | none | none | n/a |
| R024 | anti-feature | out-of-scope | none | none | n/a |
| R025 | anti-feature | out-of-scope | none | none | n/a |
| R026 | anti-feature | out-of-scope | none | none | n/a |
| R027 | anti-feature | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 0
- Validated requirements: 18
- Mapped to slices: 18
- Deferred: 3
- Out of scope: 6
- Unmapped active requirements: 0
