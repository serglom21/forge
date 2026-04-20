import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"
import { PatternSchema } from "../schema/index"
import type { EngagementSpec } from "../schema/index"
import { generate } from "./generate"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PATTERNS_DIR = join(__dirname, "..", "..", "patterns")
const TEMPLATE_DIR = join(__dirname, "..", "..", "templates", "nextjs-express")

function loadPattern(filename: string) {
  return PatternSchema.parse(parse(readFileSync(join(PATTERNS_DIR, filename), "utf8")))
}

const customBusinessSpan = loadPattern("custom_business_span.yaml")
const dbQuery = loadPattern("db_query_business_context.yaml")
const httpClient = loadPattern("http_client_business_context.yaml")

const RECIPES_SPEC: EngagementSpec = {
  id: "acme-recipes",
  customer: "Acme Recipes",
  vertical: "saas",
  stack: "nextjs-express",
  patternIds: ["custom_business_span"],
  sentry: { dsn: "https://public@sentry.example.com/1" },
  vocabulary: {
    custom_business_span: { entity: "recipe", entity_plural: "recipes", action: "submit" },
  },
}

const TRANSFERS_SPEC: EngagementSpec = {
  id: "acme-transfers",
  customer: "Acme Bank",
  vertical: "fintech",
  stack: "nextjs-express",
  patternIds: ["custom_business_span", "db_query_business_context", "http_client_business_context"],
  sentry: { dsn: "https://public@sentry.example.com/1" },
  vocabulary: {
    custom_business_span: { entity: "transfer", entity_plural: "transfers", action: "execute" },
    db_query_business_context: { attribute_key: "transfer.amount", attribute_source: "req.body.amount" },
    http_client_business_context: { vendor_name: "stripe", call_purpose: "authorize" },
  },
}

let tmpDir: string

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "forge-test-"))
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

// ─── Simple recipes (parent-only) ───────────────────────────────────────────

describe("generate — simple recipes spec", () => {
  it("creates routes/recipes.ts in the output", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    expect(existsSync(join(tmpDir, "reference-app/backend/src/routes/recipes.ts"))).toBe(true)
  })

  it("does NOT leave routes/items.ts behind", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    expect(existsSync(join(tmpDir, "reference-app/backend/src/routes/items.ts"))).toBe(false)
  })

  it("routes/recipes.ts contains Sentry.startSpan wrapper", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    const content = readFileSync(
      join(tmpDir, "reference-app/backend/src/routes/recipes.ts"),
      "utf8",
    )
    expect(content).toContain("Sentry.startSpan(")
    expect(content).toContain("recipe.submit")
  })

  it("routes/recipes.ts does NOT contain setAttributes (no child patterns)", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    const content = readFileSync(
      join(tmpDir, "reference-app/backend/src/routes/recipes.ts"),
      "utf8",
    )
    expect(content).not.toContain("setAttributes(")
  })

  it("generates README.md mentioning the customer name", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    const readme = readFileSync(join(tmpDir, "README.md"), "utf8")
    expect(readme).toContain("Acme Recipes")
  })

  it("generates engagement-spec.json matching the input spec", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    const written = JSON.parse(readFileSync(join(tmpDir, "engagement-spec.json"), "utf8"))
    expect(written.id).toBe("acme-recipes")
    expect(written.customer).toBe("Acme Recipes")
    expect(written.patternIds).toEqual(["custom_business_span"])
  })

  it("generates sentry-dashboard.json with empty widgets array", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    const dash = JSON.parse(readFileSync(join(tmpDir, "sentry-dashboard.json"), "utf8"))
    expect(dash.widgets).toEqual([])
  })

  it("generates IMPLEMENTATION_GUIDE.md", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    expect(existsSync(join(tmpDir, "IMPLEMENTATION_GUIDE.md"))).toBe(true)
  })

  it("generated files contain no unresolved {token} references", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    const routeContent = readFileSync(
      join(tmpDir, "reference-app/backend/src/routes/recipes.ts"),
      "utf8",
    )
    // Should not contain {word} pattern (vocabulary tokens should all be resolved)
    expect(routeContent).not.toMatch(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/)
  })

  it("renames frontend app/items/ to app/recipes/", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    expect(existsSync(join(tmpDir, "reference-app/frontend/app/recipes"))).toBe(true)
    expect(existsSync(join(tmpDir, "reference-app/frontend/app/items"))).toBe(false)
  })

  it("generates SENTRY.md sidecar for the route file", () => {
    generate(RECIPES_SPEC, [customBusinessSpan], TEMPLATE_DIR, tmpDir)
    expect(existsSync(join(tmpDir, "reference-app/backend/src/routes/recipes.SENTRY.md"))).toBe(true)
  })
})

// ─── Fintech transfers (parent + two children) ──────────────────────────────

describe("generate — fintech transfers spec", () => {
  it("creates routes/transfers.ts", () => {
    generate(TRANSFERS_SPEC, [customBusinessSpan, dbQuery, httpClient], TEMPLATE_DIR, tmpDir)
    expect(existsSync(join(tmpDir, "reference-app/backend/src/routes/transfers.ts"))).toBe(true)
  })

  it("routes/transfers.ts contains Sentry.startSpan with transfer.execute", () => {
    generate(TRANSFERS_SPEC, [customBusinessSpan, dbQuery, httpClient], TEMPLATE_DIR, tmpDir)
    const content = readFileSync(
      join(tmpDir, "reference-app/backend/src/routes/transfers.ts"),
      "utf8",
    )
    expect(content).toContain("Sentry.startSpan(")
    expect(content).toContain("transfer.execute")
  })

  it("routes/transfers.ts contains setAttributes at before_fetch injection point", () => {
    generate(TRANSFERS_SPEC, [customBusinessSpan, dbQuery, httpClient], TEMPLATE_DIR, tmpDir)
    const content = readFileSync(
      join(tmpDir, "reference-app/backend/src/routes/transfers.ts"),
      "utf8",
    )
    expect(content).toContain("setAttributes(")
    expect(content).toContain("stripe")
  })

  it("routes/transfers.ts contains setAttributes at before_query injection point", () => {
    generate(TRANSFERS_SPEC, [customBusinessSpan, dbQuery, httpClient], TEMPLATE_DIR, tmpDir)
    const content = readFileSync(
      join(tmpDir, "reference-app/backend/src/routes/transfers.ts"),
      "utf8",
    )
    expect(content).toContain("transfer.amount")
    expect(content).toContain("req.body.amount")
  })

  it("generated route file contains no unresolved {token} references", () => {
    generate(TRANSFERS_SPEC, [customBusinessSpan, dbQuery, httpClient], TEMPLATE_DIR, tmpDir)
    const content = readFileSync(
      join(tmpDir, "reference-app/backend/src/routes/transfers.ts"),
      "utf8",
    )
    expect(content).not.toMatch(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/)
  })

  it("README.md mentions the customer name", () => {
    generate(TRANSFERS_SPEC, [customBusinessSpan, dbQuery, httpClient], TEMPLATE_DIR, tmpDir)
    const readme = readFileSync(join(tmpDir, "README.md"), "utf8")
    expect(readme).toContain("Acme Bank")
  })

  it("engagement-spec.json matches the input spec", () => {
    generate(TRANSFERS_SPEC, [customBusinessSpan, dbQuery, httpClient], TEMPLATE_DIR, tmpDir)
    const written = JSON.parse(readFileSync(join(tmpDir, "engagement-spec.json"), "utf8"))
    expect(written.id).toBe("acme-transfers")
    expect(written.patternIds).toEqual([
      "custom_business_span",
      "db_query_business_context",
      "http_client_business_context",
    ])
  })
})
