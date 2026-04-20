# Plan 04 — CLI wrapper

## Goal
A thin CLI at `scripts/generate.ts` that reads a spec JSON from a
path arg and calls `generate(...)`. This is what the UI will invoke
in later plans; for now we use it to smoke-test end-to-end.

**Reference:** PROJECT_CONTEXT.md Parts 3-4 define the pattern model,
vocabulary rules, span sources, and composition. The schema and
generator must match those decisions exactly.

## Acceptance criteria
- [ ] `pnpm exec tsx scripts/generate.ts --spec test-specs/acme-fintech.json --out /tmp/dobby-out` produces output in /tmp/dobby-out
- [ ] Running `pnpm install && pnpm build` inside `/tmp/dobby-out/reference-app/backend` succeeds
- [ ] Running `pnpm install && pnpm build` inside `/tmp/dobby-out/reference-app/frontend` succeeds
- [ ] The CLI prints a clear one-line summary of what was produced

## Files allowed
- scripts/generate.ts
- package.json  (add `tsx` for execution)
- pnpm-lock.yaml

## Files forbidden
- All files locked by prior plans
- MISSION.md, CLAUDE.md, .github/workflows/, patterns/, templates/

## Definition of done
- Acceptance criteria met
- `make verify` green
- Manual smoke test: the commands in acceptance criteria pass
