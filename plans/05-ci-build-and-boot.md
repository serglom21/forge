# Plan 05 — Add build + boot CI checks

## Goal
Extend the CI gate so every PR proves the generator's output builds
and boots. This is the validation gate promise.

**Reference:** PROJECT_CONTEXT.md Parts 3-4 define the pattern model,
vocabulary rules, span sources, and composition. The schema and
generator must match those decisions exactly.

## Acceptance criteria
- [ ] `.github/workflows/validation-gate.yml` gains two new jobs:
  - `generated-app-builds`: runs the generator against test-specs/acme-fintech.json, then `pnpm install --frozen-lockfile && tsc --noEmit && pnpm build` inside both frontend and backend
  - `generated-app-boots`: starts both servers via pnpm dev, probes /health on both ports, expects 200 within 30s
- [ ] Both jobs block merge (added to `validation-gate-passed` dependency list)
- [ ] A deliberately broken pattern (local test only, not committed) makes the jobs fail

## Files allowed
- .github/workflows/validation-gate.yml   (this plan EXPLICITLY permits it)
- scripts/ci-boot-check.ts  (if needed)

## Files forbidden
- MISSION.md, CLAUDE.md
- PROJECT_CONTEXT.md
- patterns/, templates/
- All source files locked by prior plans

## Special authorization
This plan modifies .github/workflows/ which is normally forbidden.
The PR for this plan MUST carry the `human-reviewed` label to pass
the protect-curated-assets check.

## Definition of done
- Acceptance criteria met
- CI green with `human-reviewed` label
