# Plan 03 — Deterministic generator

## Goal
A pure function `generate(spec, patterns, templateDir, outDir)` that:
1. Resolves vocabulary (pattern defaults + spec overrides + parent refs)
2. Builds a composition tree (parents → children)
3. Copies the template to outDir
4. Replaces FORGE marker comments with instrumentation code, branching
   on span source (manual / sdk_enhanced / sdk_auto)
5. Generates the top-level project files (README, engagement-spec.json, etc.)

**Reference:** PROJECT_CONTEXT.md Parts 3-7 define the pattern model,
vocabulary rules, span sources, composition, and artifact contract.
Read the three pattern YAMLs in `patterns/` and the template in
`templates/nextjs-express/` to understand the inputs.

## Acceptance criteria

### Core generator
- [ ] `src/generator/generate.ts` exports
      `generate(spec, patterns, templateDir, outDir): void`
- [ ] Generator copies `templates/nextjs-express/` to
      `<outDir>/reference-app/` (excluding node_modules, dist, .next)
- [ ] Generator reads `manifest.json` from the template to discover
      marker names (does not hardcode them)

### Vocabulary resolution
- [ ] `src/generator/vocabulary.ts` exports a `resolveVocabulary`
      function
- [ ] Resolves pattern defaults → spec overrides (spec wins)
- [ ] Resolves `{parent.entity}` style cross-pattern references
      for child patterns that compose with a parent
- [ ] After resolution, no `{...}` tokens remain in any string
- [ ] Test: spec with vocabulary overrides produces resolved strings
- [ ] Test: spec with no overrides uses pattern defaults
- [ ] Test: child pattern resolves `{parent.entity}` from parent

### Composition
- [ ] `src/generator/composition.ts` exports a `buildCompositionTree`
      function
- [ ] Groups patterns into: standalone parents, children under parents
- [ ] Children are ordered by their position in `spec.patternIds`

### Code emission (source-based branching)
- [ ] `src/generator/emit.ts` exports emission functions
- [ ] `source: manual` → emits a `Sentry.startSpan({name, op, attributes},
      async (span) => { ... })` wrapper at the `FORGE:PARENT_SPAN` marker.
      Children (sdk_enhanced calls) are emitted inside the callback.
- [ ] `source: sdk_enhanced` → emits
      `Sentry.getActiveSpan()?.setAttributes({...})` at the matching
      `FORGE:SDK_ENHANCED_ATTRS:<injection_point>` marker
- [ ] `source: sdk_auto` → emits no span code, but ensures the
      required integration is present in the Sentry.init() integrations
      array (via the `FORGE:SENTRY_INIT_INTEGRATIONS` marker)
- [ ] All emitted code includes `// SENTRY:` comments explaining
      what each call does and why

### Route/file name substitution
- [ ] The template uses generic names (`items`, `/api/items`). The
      generator replaces these with resolved vocabulary:
      `items` → `{entity_plural}`, `/api/items` → `/api/{entity_plural}`
- [ ] File `routes/items.ts` is renamed to `routes/{entity_plural}.ts`
- [ ] Frontend pages under `app/items/` are renamed to
      `app/{entity_plural}/`
- [ ] The import in `index.ts` is updated to match the renamed file

### Top-level project files
- [ ] Generates `<outDir>/README.md` — how to run the demo
- [ ] Generates `<outDir>/IMPLEMENTATION_GUIDE.md` — pattern walkthrough
      for the customer (uses `reference_guidance` from patterns)
- [ ] Generates `<outDir>/engagement-spec.json` — copy of the input spec
- [ ] Generates `<outDir>/sentry-dashboard.json` — placeholder (empty
      widgets array for MVP; dashboard generation is a fast-follow)
- [ ] Generates `<outDir>/reference-app/backend/src/routes/{entity_plural}.SENTRY.md`
      — sidecar explaining the instrumentation in that file

### Test specs
- [ ] `test-specs/simple-recipes.json` — uses only `custom_business_span`
      with vocabulary: entity=recipe, entity_plural=recipes, action=submit.
      Tests the minimal case (one parent, no children).
- [ ] `test-specs/fintech-transfers.json` — uses all three patterns
      with vocabulary overrides. Tests composition + vocabulary +
      all three source types.

### Integration tests
- [ ] Test: simple-recipes spec → generated app has `routes/recipes.ts`
      with one `Sentry.startSpan` wrapper and NO `setAttributes` calls
- [ ] Test: fintech-transfers spec → generated app has
      `routes/transfers.ts` with one `Sentry.startSpan` wrapper AND
      `setAttributes` calls at both `before_fetch` and `before_query`
      injection points
- [ ] Test: generated files contain no unresolved `{...}` tokens
- [ ] Test: generated `README.md` exists and mentions the customer name
- [ ] Test: generated `engagement-spec.json` matches the input spec
- [ ] Tests use tmp dirs, clean up after
- [ ] `make verify` passes

## Implementation constraints
- Use literal string `.replace()` on FORGE markers. NO ts-morph,
  NO AST manipulation. Keep it simple.
- Markers look like: `// FORGE:PARENT_SPAN`,
  `// FORGE:SDK_ENHANCED_ATTRS:before_fetch`, etc.
- The generator finds markers and replaces the line (or inserts after
  it) with the appropriate instrumentation code.
- All emitted code is built from string templates in the emit module,
  not from reading/parsing the existing template code.

## Files allowed
- src/generator/generate.ts
- src/generator/generate.test.ts
- src/generator/vocabulary.ts
- src/generator/vocabulary.test.ts
- src/generator/composition.ts
- src/generator/composition.test.ts
- src/generator/emit.ts
- src/generator/emit.test.ts
- src/generator/files.ts (top-level file generation: README, guide, etc.)
- src/generator/files.test.ts
- src/generator/index.ts
- test-specs/simple-recipes.json
- test-specs/fintech-transfers.json
- package.json (if new deps needed; pin exact versions)
- pnpm-lock.yaml

## Files forbidden
- MISSION.md, CLAUDE.md, PROJECT_CONTEXT.md
- .github/workflows/
- patterns/ (read-only input)
- templates/ (read-only input — generator copies, never modifies)
- plans/
- src/schema/* (locked)
- src/patterns/* (locked)

## Definition of done
- All acceptance criteria met
- `make verify` green
- Diff only touches allowed files
- Both test specs produce output with no unresolved tokens
- Diff reviewed by a human