# Plan 02 — Load patterns from disk

## Goal
A function `loadPatterns(dir)` that reads every `*.yaml` under `patterns/`,
parses them with `PatternSchema`, and returns them. Throws on any
invalid pattern (fail loud, not silent).

**Reference:** PROJECT_CONTEXT.md Parts 3-4 define the pattern model,
vocabulary rules, span sources, and composition. The schema and
generator must match those decisions exactly.

## Acceptance criteria
- [ ] `src/patterns/loader.ts` exports `loadPatterns(dir: string): Pattern[]`
- [ ] Test: given `patterns/` with the committed `distributed_transaction_visibility.yaml`, returns exactly one pattern with the expected `id`
- [ ] Test: given a fixture directory with a malformed YAML, throws with the filename in the error message
- [ ] `make verify` passes

## Files allowed
- src/patterns/loader.ts
- src/patterns/loader.test.ts
- src/patterns/__fixtures__/malformed/*.yaml
- package.json  (add `yaml` parser dep, pin exact version)
- pnpm-lock.yaml

## Files forbidden
- MISSION.md, CLAUDE.md
- .github/workflows/
- patterns/  (the real patterns — don't touch)
- templates/
- src/schema/*  (locked after Plan 01)
- Anything else not listed above

## Definition of done
- Acceptance criteria met
- `make verify` green
- Diff only touches allowed files
