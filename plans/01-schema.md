# Plan 01 — EngagementSpec + Pattern Zod schemas

## Prerequisites
This plan does not depend on `templates/` being populated. The three
pattern YAMLs in `patterns/` are the only inputs needed to design and
test the schema. The Next.js+Express template is being hand-built in
parallel and does not gate this plan.

## Goal
Two typed schemas that are the source of truth for all generator input:
`EngagementSpec` (a project) and `Pattern` (a reusable building block).

**Reference:** PROJECT_CONTEXT.md Parts 3-7 define the pattern model,
vocabulary rules, span sources, composition, and SDK version strategy.
The schema must match those decisions exactly. The three committed
pattern YAMLs in `patterns/` are the primary test fixtures.

## Acceptance criteria

### PatternSchema
- [ ] `src/schema/pattern.ts` exports `PatternSchema` (Zod)
- [ ] Schema accepts: id, title, maturity, verticals, stacks, layer
- [ ] Schema accepts vocabulary where each token is EITHER
      `{ required: true, description }` OR `{ default: string, description? }`,
      never both — enforced by a Zod discriminated union or refinement
- [ ] Schema accepts surface: { pages: [...], routes: [...] }
      (routes can be empty array for frontend-only patterns)
- [ ] Schema accepts provides: { parent_span?: string }
- [ ] Schema accepts composes_with: string[] and requires_parent: boolean
- [ ] Schema accepts spans as an array where each span has a `source`
      field that is one of: manual | sdk_auto | sdk_enhanced | derived
- [ ] source: manual spans require op (from SentryOpEnum) and attributes
- [ ] source: sdk_enhanced spans require attributes_to_inject with
      injection_point
- [ ] source: sdk_auto spans require expected_attributes only
- [ ] source: derived spans require only id and op
- [ ] SentryOpEnum includes at minimum: function, http.client,
      http.server, db.query, cache.get, cache.set, ui.render, task,
      ui.webvital, pageload, navigation
- [ ] Schema accepts sdk_requirements: array of
      { integration, package, reason?, config? }
- [ ] Schema accepts sdk_min_version: Record<string, string>
- [ ] Schema accepts reference_guidance: { in_your_codebase: string,
      what_to_keep?: string, what_to_adapt?: string }
- [ ] Validator: refuses source: manual when op is db.query,
      http.client, or http.server (no-double-instrumentation rule)
- [ ] Validator: every {token} referenced in string fields of spans,
      surface, and provides must be declared in that pattern's vocabulary
      (post-parse refinement)

### EngagementSpecSchema
- [ ] `src/schema/engagement-spec.ts` exports `EngagementSpecSchema`
- [ ] Schema accepts: id, customer (non-empty), vertical (enum),
      stack (enum), patternIds (non-empty string array)
- [ ] Schema accepts sentry: { dsn: string, projectSlug?: string,
      org?: string, dashboardId?: string }
- [ ] Schema accepts vocabulary: Record<string, Record<string, string>>
      (keyed by pattern ID, values are token→override maps)
- [ ] Validator: every pattern ID referenced in vocabulary must exist
      in patternIds (no orphan overrides)

### Cross-schema validation (exported helper, not inline Zod)
- [ ] `src/schema/validate-spec-against-patterns.ts` exports a function
      that takes an EngagementSpec + Pattern[] and validates:
  - Every patternId in the spec has a matching loaded pattern
  - Every `required: true` vocabulary token in each referenced pattern
    is overridden in the spec's vocabulary for that pattern
  - Every `requires_parent: true` pattern has a compatible parent
    (a pattern in the same spec that has `provides.parent_span`)

### Tests
- [ ] All three committed pattern YAMLs parse cleanly (read from
      `patterns/` as fixtures — use a YAML parser in the test)
- [ ] A valid EngagementSpec with all three patterns parses cleanly
- [ ] A spec missing a required vocabulary override is rejected with
      a message naming the missing token
- [ ] A spec with a requires_parent pattern but no parent is rejected
- [ ] A pattern with source: manual + op: db.query is rejected
- [ ] A pattern with an undeclared {token} in a span id is rejected
- [ ] An unknown op value is rejected
- [ ] `make verify` passes

## Files allowed
- src/schema/pattern.ts
- src/schema/engagement-spec.ts
- src/schema/validate-spec-against-patterns.ts
- src/schema/pattern.test.ts
- src/schema/engagement-spec.test.ts
- src/schema/validate-spec-against-patterns.test.ts
- src/schema/index.ts
- src/schema/types.ts (if needed for shared enums/types)
- package.json (only to add zod + a yaml parser; pin exact versions)
- pnpm-lock.yaml

## Files forbidden
- MISSION.md, CLAUDE.md, PROJECT_CONTEXT.md
- .github/workflows/
- patterns/ (read-only as test fixtures, do not modify)
- templates/
- plans/
- Anything else not listed above

## Definition of done
- All acceptance criteria checked
- `make verify` green
- Diff only touches allowed files
- Diff reviewed by a human