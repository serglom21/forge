# Plan 05 — Add build + boot CI checks

## Goal
Extend the CI gate so every PR proves the generator's output builds
and boots. This is the validation gate promise from MISSION.md.

**Reference:** PROJECT_CONTEXT.md Parts 8-9 define the validation gate
and what "done" means. The CLI from Plan 04 is the entry point.

## Acceptance criteria

### generated-app-builds job
- [ ] Runs the CLI against both test specs:
      `test-specs/fintech-transfers.json` and `test-specs/simple-recipes.json`
- [ ] For each generated app, runs:
      `pnpm install && tsc --noEmit && pnpm build` inside backend/
- [ ] For each generated app, runs:
      `pnpm install && pnpm build` inside frontend/
- [ ] Job fails if any of the above commands fail

### generated-app-boots job
- [ ] Depends on generated-app-builds (uses its artifacts)
- [ ] Starts both backend and frontend servers
- [ ] Probes /api/health on port 3001 (backend) and /api/health on
      port 3000 (frontend) — expects HTTP 200 within 30 seconds
- [ ] Job fails if either health check doesn't respond 200 within 30s
- [ ] Prints the app log on failure for debugging

### Integration
- [ ] Both jobs are added to the `validation-gate-passed` dependency list
- [ ] Both jobs block merge via branch protection
- [ ] The workflow uses the CLI from Plan 04:
      `pnpm exec tsx scripts/generate.ts --spec <spec> --out <dir>`

### Boot check script
- [ ] `scripts/ci-boot-check.sh` (or .ts) handles:
      starting servers, waiting for health, reporting result, cleanup
- [ ] Script exits 0 on success, 1 on failure
- [ ] Script kills server processes on exit (cleanup)

## Files allowed
- .github/workflows/validation-gate.yml (EXPLICITLY permitted)
- scripts/ci-boot-check.sh (new file)
- package.json, pnpm-lock.yaml (only if new deps needed)

## Files forbidden
- MISSION.md, CLAUDE.md, PROJECT_CONTEXT.md
- patterns/, templates/
- plans/
- src/** (all locked)

## Special authorization
This plan modifies .github/workflows/ which is normally forbidden.
The PR for this plan MUST carry the `human-reviewed` label to pass
the protect-curated-assets check.

## Definition of done
- All acceptance criteria met
- CI green with `human-reviewed` label on the PR
- Both test specs produce apps that build and boot in CI
- Diff only touches allowed files
- Diff reviewed by a human