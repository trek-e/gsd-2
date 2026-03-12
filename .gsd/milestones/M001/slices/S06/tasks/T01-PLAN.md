---
estimated_steps: 5
estimated_files: 1
---

# T01: Delete ONBOARDING-PLAN.md and verify milestone doc consistency

**Slice:** S06 — Cleanup and archive
**Milestone:** M001

## Description

Delete the last remaining design input file (`ONBOARDING-PLAN.md`) and run a comprehensive consistency check across all milestone documentation. This single task covers R018 (archive design input files) and validates that all prior slice work (S03 doc fixes, S04 prompt cleanup) remains intact.

## Steps

1. Delete `ONBOARDING-PLAN.md` from the repo root.
2. Verify all 4 design input files are gone: `CODEX-GIT-SYNTHESIS.md`, `CLAUDE-GIT-SYNTHESIS.md`, `GEMINI-GIT-SYNTHESIS.md`, `ONBOARDING-PLAN.md`.
3. Grep the codebase (excluding `.gsd/`) for any references to the 4 deleted files. Expect zero hits.
4. Grep prompts (`execute-task.md`, `complete-slice.md`, `replan-slice.md`, `complete-milestone.md`) for raw git commands (`git add`, `git commit`, `git checkout`, `git merge`, `git branch`). Expect zero hits.
5. Run `npm run build` and confirm exit 0.

## Must-Haves

- [ ] `ONBOARDING-PLAN.md` deleted
- [ ] Zero references to any of the 4 design input files in non-.gsd markdown
- [ ] Zero raw git commands in the 4 prompt files
- [ ] `npm run build` passes

## Verification

- `test ! -f ONBOARDING-PLAN.md && echo PASS || echo FAIL`
- `test ! -f CODEX-GIT-SYNTHESIS.md && test ! -f CLAUDE-GIT-SYNTHESIS.md && test ! -f GEMINI-GIT-SYNTHESIS.md && echo PASS || echo FAIL`
- `rg -l 'CODEX-GIT-SYNTHESIS|CLAUDE-GIT-SYNTHESIS|GEMINI-GIT-SYNTHESIS|ONBOARDING-PLAN' --type md --glob '!.gsd/**' | wc -l` returns 0
- `rg 'git add|git commit|git checkout|git merge|git branch' src/resources/extensions/gsd/prompts/execute-task.md src/resources/extensions/gsd/prompts/complete-slice.md src/resources/extensions/gsd/prompts/replan-slice.md src/resources/extensions/gsd/prompts/complete-milestone.md | wc -l` returns 0
- `npm run build` exits 0

## Observability Impact

- Signals added/changed: None
- How a future agent inspects this: None — cleanup task with no runtime surface
- Failure state exposed: None

## Inputs

- `ONBOARDING-PLAN.md` — the file to delete
- S03 summary — confirmed README and GSD-WORKFLOW doc fixes landed
- S04 summary — confirmed prompt cleanup landed

## Expected Output

- `ONBOARDING-PLAN.md` — deleted
- All verification checks pass, confirming R018 is satisfied and milestone docs are consistent
