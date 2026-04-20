# Dobby Forge — Project Context

> **Purpose of this file.** This is the anchor document for every Claude
> Code session. Before touching any code, read this file and `MISSION.md`.
> Together they represent the design decisions made before code exists.
> Neither may be edited without explicit human review.

**Status:** Pre-implementation. Step 1 (repo scaffold + CI cage) complete.
Step 2 (hand-built template + curated patterns) in progress. No Claude Code
sessions have run yet.

---

## Part 1 — What this tool is

### The tool in one sentence

A desktop tool that generates runnable, Sentry-instrumented reference
applications for Sales Engineers to demo live and share with customers via
GitHub.

### What the generated apps are

**Pedagogical, not production.** They exist to teach a customer's
developer where in their own code they should apply specific Sentry
instrumentation patterns. Verbose, heavily commented, deliberately
structured to mirror typical customer architectures. Mocked behavior and
hardcoded data are correct — not problems to fix.

### What the tool is *not*

- Not a talk-track generator. SEs own the call.
- Not a customer-pain-discovery engine. SEs identify the patterns.
- Not a production-code generator. Generated apps are demos.
- Not a business-logic writer. Demos show instrumentation, not logic.
- Not an AI code refactoring tool. Regeneration replaces in-place edits.

### The core loop

```
SE creates project → picks patterns → generator composes → validation gate
runs → if green, SE gets runnable app + dashboard JSON + GitHub push
```

---

## Part 2 — Architecture

### The layer model

```
PATTERN YAMLs           TEMPLATES              GENERATOR              OUTPUT
(curated data,          (committed code,        (pure, deterministic)  (runnable
 human-authored)         hand-built, one                                app + docs +
                         per stack)                                     dashboard)
    ↓                        ↓                      ↓                       ↓
 "what spans,          "what the code          "fill markers           "what the SE
 attributes,           skeleton looks          with pattern            hands the
 vocabulary            like before             data"                   customer"
 a pattern needs"      patterns slot in"
```

### What each piece owns

| Component | Role | Edited by |
|---|---|---|
| `MISSION.md` | Fixed contract of non-negotiables | Humans only |
| `patterns/*.yaml` | Curated Sentry instrumentation recipes | Humans only |
| `templates/<stack>/` | Hand-built skeleton apps with insertion markers | Humans only |
| `src/schema/` | Zod schemas for Pattern, EngagementSpec | Claude Code (once, then locked) |
| `src/generator/` | Pure function `(spec, patterns, template) → app` | Claude Code |
| `src/patterns/loader.ts` | Loads and validates all patterns | Claude Code |
| `scripts/generate.ts` | CLI entry point | Claude Code |
| `.github/workflows/` | Validation gate | Humans only (label-gated) |
| `<project>/custom-patterns/` | Per-project customizations | SEs (via UI, later) |

### The LLM's role (tiny)

The LLM does **three narrow jobs**, all interpretive, all schema-validated:

1. **Pattern-fill JSON** — produces EngagementSpec JSON from user input, constrained by Zod
2. **Terminology mapping** — swaps vocabulary for customer's domain language
3. **Markdown prose** — implementation guide text, sidecar SENTRY.md content

The LLM **never**: writes source code, picks file paths, chooses `op`
values, modifies patterns, or touches templates.

---

## Part 3 — The pattern model (revised with all decisions folded in)

### The right granularity

Patterns are **small, composable building blocks**, not monolithic recipes.
Each pattern owns one instrumentation idea. The SE composes patterns in
the EngagementSpec to build up the instrumentation story for a given
customer.

Rule of thumb: **one pattern per "canonical Sentry technique,"** flexible
enough to flex across business domains via vocabulary. Expected library
size at maturity: ~15-30 patterns total, not 3 and not 200.

### Every pattern has four required fields

1. **Vocabulary** — labeled blanks with either `required: true` or
   `default: <value>`. Required tokens force the SE to supply
   domain-specific values (no accidental "fraud_check" in a recipes app).
2. **Composition declarations** — `composes_with`, `requires_parent`,
   `provides`.
3. **Spans with explicit `source`** — `manual | sdk_auto | sdk_enhanced |
   derived`. This prevents double-instrumentation.
4. **SDK constraints** — `sdk_requirements` (which integrations this
   needs) and `sdk_min_version` (which SDK versions it supports).

### The four span sources (critical)

| Source | SDK captures it? | Pattern's job | Generator emits |
|---|---|---|---|
| `manual` | No — genuinely custom | Emit the span wrapper | `Sentry.startSpan({...}, async () => {...})` |
| `sdk_enhanced` | Yes, but needs business context | Inject attributes on active span | `Sentry.getActiveSpan()?.setAttributes({...})` |
| `sdk_auto` | Yes, fully | Ensure integration is enabled | Just SDK config in instrument.ts |
| `derived` | Produced from other spans by a downstream integration | Declare expectation for dashboard/validation | Nothing |

**Enforcement rule:** The schema refuses `source: manual` when `op`
matches the SDK-owned list (`db.query`, `http.client`, `http.server`).
This makes double-instrumentation structurally impossible.

### Vocabulary rules

- Tokens are either `required: true` (must be overridden in spec) OR have
  a `default:` value. Never both.
- Required tokens apply to domain-specific concepts (`entity`, `action`).
- Defaults apply to structural concepts (`validate_step`, `persist_step`).
- Parent-scoped references: child patterns can read `{parent.entity}`,
  `{parent.provides.parent_span}`, etc.
- Every `{token}` referenced in a pattern must be declared in vocabulary.
  Schema validator enforces this.
- Spec overrides can only reference declared tokens. Silent typos are
  impossible.

### Composition rules

- A pattern declares `composes_with: [parent_pattern_ids]` and
  `requires_parent: true/false`.
- At spec-load time: every `requires_parent: true` pattern must have a
  compatible parent listed in the same spec.
- The same pattern can appear multiple times in a spec with different
  vocabulary (e.g. two HTTP client calls, one for fraud check, one for
  notification).

---

## Part 4 — The three MVP patterns

These are the only patterns that exist in the MVP. Later patterns follow
the same schema.

### `patterns/custom_business_span.yaml`

The parent pattern. Wraps a business operation in a manual span with
business attributes.

- `source: manual` — SDK cannot produce this
- Vocabulary: `entity`, `entity_plural`, `action` all **required**
- Provides: `parent_span: "{entity}.{action}"` for children to reference

Used for: any "simple form" demo, any "multi-step operation" demo, any
custom business flow. The backbone of almost every generated app.

### `patterns/db_query_business_context.yaml`

A composable child. Attaches business attributes to SDK-auto-captured
`db.query` spans.

- `source: sdk_enhanced` — SDK captures the span, pattern enriches it
- `composes_with: [custom_business_span]`, `requires_parent: true`
- Vocabulary: `attribute_key`, `attribute_source` both required
- Emits: `Sentry.getActiveSpan()?.setAttribute(...)` near the DB call

### `patterns/http_client_business_context.yaml`

A composable child. Attaches business attributes to SDK-auto-captured
`http.client` spans.

- `source: sdk_enhanced` — SDK captures via `httpIntegration`
- `composes_with: [custom_business_span]`, `requires_parent: true`
- Vocabulary: `vendor_name`, `call_purpose` both required
- Emits: `Sentry.getActiveSpan()?.setAttributes({vendor, purpose})` before
  the fetch call

### Composition examples

**Recipes app, simple form.** Spec picks only `custom_business_span`.
Result: one manual `recipe.submit` span. No DB, no HTTP, no opinionated
steps. Clean.

**Fintech transfer flow.** Spec picks `custom_business_span` +
`db_query_business_context` + `http_client_business_context` (twice for
fraud check and notify). Result: one manual parent `transfer.execute`
with business attributes, SDK-auto DB span enriched with `transfer.amount`,
two SDK-auto HTTP spans enriched with vendor + purpose. Single span per
operation. No doubling.

---

## Part 5 — The validation gate

### What it enforces

Three non-negotiables, turned into CI checks that block merge to `main`:

1. **Generated apps build.** `pnpm install --frozen-lockfile`, `tsc
   --noEmit`, `next build` all pass on generator output.
2. **Generated apps boot.** Both frontend and backend respond 200 to
   `/health` within 30 seconds of `pnpm dev`.
3. **Protected files stay protected.** Changes to `patterns/`,
   `MISSION.md`, `CLAUDE.md`, `.github/workflows/` require the
   `human-reviewed` PR label.

### What's deferred to post-MVP

- Trace check (Playwright against a Sentry mock transport, asserts
  spans emit with expected attributes)
- Dashboard query validation (Sentry's events-stats dry-run per widget)
- Seed-script check (realistic data generation validation)
- Nightly CI against latest SDK (Layer 2 — deferred, we agreed)

### What's kept in mind as fast-follow

- SDK probe suite (Layer 3) — one probe per SDK major, asserts what's
  auto-instrumented, catches SDK changes before they break patterns

### The discipline rule

**CI gate never ends a session red.** If a change breaks the gate and
can't be fixed in the same session, revert. Don't merge with a workaround.
Don't promise to come back.

---

## Part 6 — SDK drift strategy

SDK behavior changes over time (new integrations, renamed ops, moved
auto-captured spans). Three layers of defense:

**Layer 1 (MVP): Pin and declare.**
- Every template pins exact SDK versions in `package.json` + lockfile
- Every pattern declares `sdk_min_version` per package
- Schema refuses incompatible combinations at spec-load time

**Layer 2 (deferred, not building):** Nightly CI against latest SDK.

**Layer 3 (fast-follow):** Per-SDK-major probe suite that asserts what's
auto-instrumented. Fails first, before patterns do, when Sentry changes
behavior.

---

## Part 7 — Custom patterns (per-project)

If a customer has a business flow that doesn't map to existing patterns,
the SE can author a **custom pattern scoped to one project**.

- Stored at `<project>/custom-patterns/*.yaml`
- Same schema as shared patterns
- Loaded alongside shared patterns at generation time
- SE authors via form UI (fast-follow) or YAML directly (MVP)
- Custom patterns that prove reusable can be promoted to `patterns/` via PR

Boundary: custom patterns can add spans, attributes, composition. They
**cannot** add arbitrary custom code (e.g. complex validation functions).
That's the sandboxed-extension system, deferred indefinitely unless
demand emerges.

---

## Part 8 — The MVP artifact contract

Every generated project produces exactly this structure:

```
<project-slug>/
├── README.md                      Run instructions
├── IMPLEMENTATION_GUIDE.md        Customer-facing pattern walkthrough
├── engagement-spec.json           Source of truth for the generation
├── sentry-dashboard.json          Importable dashboard JSON
└── reference-app/
    ├── frontend/                  Next.js app
    ├── backend/                   Express app
    ├── docker-compose.yml
    ├── .env.example               Includes SENTRY_DSN slot
    └── README.md
```

Every instrumented file has a sibling `<filename>.SENTRY.md` explaining
the patterns shown.

Deferred: Sentry dashboard push via API, seed-sentry script, trace check,
OAuth.

---

## Part 9 — Scope boundaries for MVP (2-day build)

### In scope

- One stack: Next.js + Express
- Three patterns (listed above)
- CI gate: `builds` + `boots` only
- CLI-driven generation (`pnpm generate --spec ...`)
- UI shell wired to generator
- Settings with pasted Sentry PAT (not OAuth)
- Dashboard output as JSON file (not pushed)
- Manual dashboard import by SE
- Project storage as JSON on disk

### Out of scope (fast-follow)

- Additional stacks (FastAPI, Flask, React Native)
- Additional patterns (frontend pageload, error obs, etc.)
- Trace check in CI
- Dashboard push to Sentry API
- Dashboard query dry-run validation
- Seed-sentry script
- OAuth
- Project auto-suggest from Sentry projects API
- Stale/failed state detection in project list
- Keyboard shortcuts
- Custom pattern authoring UI (SEs can write YAML manually)

---

## Part 10 — The working discipline

### Build order

1. **Step 1 (done):** Repo scaffold, CI cage, branch protection, `MISSION.md`, `CLAUDE.md`
2. **Step 2 (current):** Three MVP pattern YAMLs hand-authored, Next.js+Express template hand-built with insertion markers
3. **Step 3:** Plan 01 — Zod schema for Pattern and EngagementSpec (first Claude Code session)
4. **Step 4:** Plan 02 — Pattern loader
5. **Step 5:** Plan 03 — Generator
6. **Step 6:** Plan 04 — CLI wrapper
7. **Step 7:** Plan 05 — Build + boot CI checks
8. **Step 8:** UI shell wired to generator (possibly multiple plans)

### Per-session rules

- Each Claude Code session runs against ONE plan file in `plans/`
- Plan names its `files_allowed` and `files_forbidden` lists
- Session opens by reading `MISSION.md`, this file, and the plan
- Tests written first, shown to fail, then implemented
- Commits every 15-30 min with descriptive messages
- `make verify` passes before "done" is claimed
- End-of-session self-review for drift indicators

### Drift indicators to watch for

- `.skip(`, `xit(`, `xdescribe(` in test files (without justifying comment)
- New `try/catch` blocks that silently swallow errors
- `.optional()` added to schema fields that shouldn't be optional
- `TODO`/`FIXME` comments on critical paths
- New dependencies not listed in the plan
- Files modified outside the plan's allowed list
- Tests weakened (assertion removed, tolerance widened, mock replaces real)
- "Quick refactor while I'm here" scope creep

### When stuck

Claude Code does **not** refactor broadly. It states the exact error and
the smallest change to fix it. It waits for human direction before
proceeding.

### Revert, don't patch

If CI goes red and can't be fixed in the same session, revert the branch.
Do not end a session with a red CI. Do not merge with a workaround.

---

## Part 11 — Plan file template

Every plan in `plans/` follows this shape:

```markdown
# Plan NN — <short name>

## Goal
One paragraph: what observable behavior is added by this plan.

## Acceptance criteria
- [ ] Specific, verifiable checkboxes
- [ ] Each one testable by running a command or reading a diff
- [ ] `make verify` passes

## Files allowed
- Explicit list. Claude Code may only modify these.

## Files forbidden
- Explicit list. Claude Code may not modify these.
- Always includes: MISSION.md, CLAUDE.md, PROJECT_CONTEXT.md,
  patterns/, templates/, .github/workflows/

## Definition of done
- All acceptance criteria met
- No files outside "allowed" were touched
- `make verify` green
- CI green on PR
- Diff reviewed by human
```

---

## Part 12 — Open design questions (not decided yet)

These are intentionally deferred; decide when you encounter them:

- How the UI form for authoring custom patterns works (data model is
  settled; UI affordance is not)
- Whether presets (named bundles of patterns, like
  `fintech_money_movement = [custom_business_span, db_query_business_context, http_client_business_context × 2]`)
  get a first-class schema or just live as documentation
- How regeneration handles existing customizations (overwrite? merge?
  diff-and-prompt?)
- Exact format of the dashboard JSON widgets (Sentry's API is well-
  documented but widget query validation is nontrivial)
- How stacks get added after Next.js+Express — expected to follow the
  same template+pattern pattern, but first second-stack will reveal
  what needs generalizing

Don't let Claude Code decide any of these unilaterally. Raise them, pause,
decide with human input.

---

## Part 13 — Changelog

| Date | Change | Decided by |
|---|---|---|
| 2026-04-19 | File created; consolidates all design decisions up to this point | Sergio + Claude |
| | | |

Any subsequent change to this file requires a PR with `human-reviewed`
label. The purpose of this file is to *not drift*.
