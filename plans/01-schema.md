# Plan 01 — EngagementSpec + Pattern Zod schemas

## Goal
Two typed schemas that are the source of truth for all generator input:
`EngagementSpec` (a project) and `Pattern` (a reusable building block).

**Reference:** PROJECT_CONTEXT.md Parts 3-4 define the pattern model,
vocabulary rules, span sources, and composition. The schema and
generator must match those decisions exactly.

## Acceptance criteria
- [ ] `src/schema/engagement-spec.ts` exports `EngagementSpecSchema` (Zod)
- [ ] `src/schema/pattern.ts` exports `PatternSchema` (Zod)
- [ ] Tests in `src/schema/*.test.ts`:
  - parse a valid known-good object → passes
  - reject a known-bad object → throws with a useful message
  - reject unknown `op` values → throws (enum is closed)
- [ ] `make verify` passes

## Files allowed
- src/schema/engagement-spec.ts
- src/schema/pattern.ts
- src/schema/engagement-spec.test.ts
- src/schema/pattern.test.ts
- src/schema/index.ts
- package.json  (only to add `zod` as a dep; pin exact version)
- pnpm-lock.yaml

## Files forbidden
- MISSION.md, CLAUDE.md
- .github/workflows/
- patterns/
- templates/
- Anything else not listed above

## Schema requirements (must be enforced)
EngagementSpec:
- id: string
- customer: string (non-empty)
- vertical: enum ["ecommerce","fintech","healthcare","saas","media","manufacturing","logistics"]
- stack: enum ["nextjs-express","fastapi","flask","react-native-express"]
- patternIds: array of string (non-empty)
- sentry: { dsn: string, projectSlug?: string, org?: string }

Pattern:
- id: string (lowercase, underscore-separated)
- title: string
- verticals: array of vertical enum
- stacks: array of stack enum
- spans: array of { id: string, op: SentryOpEnum, parent?: string, attributes?: array }
- SentryOpEnum = ["function","http.client","http.server","db.query","cache.get","cache.set","ui.render","task","rpc","graphql"]

## Definition of done
- Acceptance criteria met
- `make verify` green
- Diff only touches allowed files
