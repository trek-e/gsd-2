# S06: Cleanup and archive

**Goal:** Delete remaining design input files and verify doc consistency across the milestone.
**Demo:** `ONBOARDING-PLAN.md` no longer exists, no references to any of the 4 design input files remain in the codebase, docs match code behavior, prompts contain no raw git commands, and `npm run build` passes.

## Must-Haves

- `ONBOARDING-PLAN.md` deleted
- Zero references to `CODEX-GIT-SYNTHESIS.md`, `CLAUDE-GIT-SYNTHESIS.md`, `GEMINI-GIT-SYNTHESIS.md`, or `ONBOARDING-PLAN.md` in the codebase
- README.md branch lifecycle claims match code (deleted after merge, not preserved)
- GSD-WORKFLOW.md checkpoint/branch docs match code
- No raw git commands in execute-task.md, complete-slice.md, replan-slice.md, complete-milestone.md
- `npm run build` exits 0

## Proof Level

- This slice proves: final-assembly (milestone cleanup — all design inputs archived, all docs consistent)
- Real runtime required: no
- Human/UAT required: no

## Verification

- `test ! -f ONBOARDING-PLAN.md` — file deleted
- `test ! -f CODEX-GIT-SYNTHESIS.md && test ! -f CLAUDE-GIT-SYNTHESIS.md && test ! -f GEMINI-GIT-SYNTHESIS.md` — synthesis files stay deleted
- `rg -l 'CODEX-GIT-SYNTHESIS|CLAUDE-GIT-SYNTHESIS|GEMINI-GIT-SYNTHESIS|ONBOARDING-PLAN' --type md --glob '!.gsd/**' | wc -l` returns 0
- `rg 'git add|git commit|git checkout|git merge|git branch' src/resources/extensions/gsd/prompts/execute-task.md src/resources/extensions/gsd/prompts/complete-slice.md src/resources/extensions/gsd/prompts/replan-slice.md src/resources/extensions/gsd/prompts/complete-milestone.md | wc -l` returns 0
- `npm run build` exits 0

## Observability / Diagnostics

Not applicable — this is a delete-only cleanup slice with no runtime surface, no new code, and no state changes.

- Runtime signals: none
- Inspection surfaces: none
- Failure visibility: none
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: S03 doc fixes (README, GSD-WORKFLOW), S04 prompt cleanup, S05 preference wiring
- New wiring introduced in this slice: none
- What remains before the milestone is truly usable end-to-end: nothing — this is the final slice

## Tasks

- [x] **T01: Delete ONBOARDING-PLAN.md and verify milestone doc consistency** `est:10m`
  - Why: Only remaining design input file. Doc consistency check closes R018 and validates all prior slice doc work holds.
  - Files: `ONBOARDING-PLAN.md`
  - Do: Delete `ONBOARDING-PLAN.md`. Verify the 3 synthesis files remain deleted. Grep for references to all 4 files. Grep prompts for raw git commands. Verify README branch lifecycle claims. Verify GSD-WORKFLOW checkpoint docs. Run `npm run build`.
  - Verify: All verification commands in the Verification section above pass.
  - Done when: File deleted, zero references found, zero raw git commands in prompts, build passes.

## Files Likely Touched

- `ONBOARDING-PLAN.md` (deleted)
