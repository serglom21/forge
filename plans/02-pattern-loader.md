# Plan 02 — Load patterns from disk

## Goal
A function `loadPatterns(dir)` that reads every `*.yaml` under a
directory, parses them with `PatternSchema`, and returns them. Throws
on any invalid pattern (fail loud, not silent). Also supports loading
from multiple directories (shared patterns + project custom patterns).

**Reference:** PROJECT_CONTEXT.md Parts 3-4 define the pattern model.
The schema files from Plan 01 are the contract — this loader uses them.

## Acceptance criteria
- [ ] `src/patterns/loader.ts` exports `loadPatterns(dir: string): Pattern[]`
- [ ] `src/patterns/loader.ts` exports `loadPatternsFromDirs(dirs: string[]): Pattern[]`
      that merges patterns from multiple directories (shared + custom)
- [ ] Duplicate pattern IDs across directories throw with both filenames
      in the error message
- [ ] Test: given `patterns/` with the committed three MVP patterns,
      returns exactly three patterns with the expected ids
- [ ] Test: given a fixture directory with a malformed YAML, throws
      with the filename in the error message
- [ ] Test: given two directories with a duplicate pattern ID, throws
- [ ] `make verify` passes

## Files allowed
- src/patterns/loader.ts
- src/patterns/loader.test.ts
- src/patterns/__fixtures__/malformed/*.yaml
- src/patterns/__fixtures__/duplicate/*.yaml
- package.json (add `yaml` parser dep, pin exact version)
- pnpm-lock.yaml

## Files forbidden
- MISSION.md, CLAUDE.md, PROJECT_CONTEXT.md
- .github/workflows/
- patterns/ (the real patterns — read-only as test fixtures)
- templates/
- plans/
- src/schema/* (locked after Plan 01)
- Anything else not listed above

## Definition of done
- All acceptance criteria met
- `make verify` green
- Diff only touches allowed files
- Diff reviewed by a human