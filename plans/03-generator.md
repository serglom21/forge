# Plan 03 — Deterministic generator

## Goal
A pure function `generate(spec, patterns, templateDir, outDir)` that
copies the template to `outDir` and replaces marker comments with
content derived from the spec + patterns.

**Reference:** PROJECT_CONTEXT.md Parts 3-4 define the pattern model,
vocabulary rules, span sources, and composition. The schema and
generator must match those decisions exactly.

## Acceptance criteria
- [ ] `src/generator/generate.ts` exports `generate(...)`
- [ ] Given the test spec `test-specs/acme-fintech.json` and the
      committed template + pattern, produces output at `outDir` that:
  - Contains all files listed in the artifact contract (README.md,
    IMPLEMENTATION_GUIDE.md, engagement-spec.json, sentry-dashboard.json,
    reference-app/*)
  - `reference-app/backend/src/routes/transfers.ts` contains the
    pattern's spans inline as `Sentry.startSpan({...}, async () => {...})`
  - `.env.example` contains `SENTRY_DSN=` placeholder
- [ ] Test uses a tmp dir, cleans up after
- [ ] `make verify` passes

## Implementation constraint
Use literal string `.replace()` on marker comments in the template.
NO ts-morph, NO AST manipulation. Markers look like:
  // BRACK:INSERT_ROUTE_SPAN:<span_id>
The generator finds them and replaces the entire line with a span
wrapper block.

## Files allowed
- src/generator/generate.ts
- src/generator/generate.test.ts
- src/generator/markers.ts
- test-specs/acme-fintech.json
- package.json, pnpm-lock.yaml

## Files forbidden
- MISSION.md, CLAUDE.md
- .github/workflows/
- patterns/
- templates/  (the template is committed; generator READS but doesn't modify)
- src/schema/*, src/patterns/*  (locked after earlier plans)

## Definition of done
- Acceptance criteria met
- `make verify` green
- Diff only touches allowed files
