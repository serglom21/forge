import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"
import { PatternSchema } from "../schema/index"
import type { EngagementSpec } from "../schema/index"
import {
  generateReadme,
  generateImplementationGuide,
  generateSentryMd,
  generateDashboardJson,
} from "./files"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PATTERNS_DIR = join(__dirname, "..", "..", "patterns")

function loadPattern(filename: string) {
  return PatternSchema.parse(parse(readFileSync(join(PATTERNS_DIR, filename), "utf8")))
}

const customBusinessSpan = loadPattern("custom_business_span.yaml")
const dbQuery = loadPattern("db_query_business_context.yaml")
const httpClient = loadPattern("http_client_business_context.yaml")

const spec: EngagementSpec = {
  id: "acme-001",
  customer: "Acme Corp",
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

const vocabMap = {
  custom_business_span: { entity: "transfer", entity_plural: "transfers", action: "execute" },
  db_query_business_context: { attribute_key: "transfer.amount", attribute_source: "req.body.amount" },
  http_client_business_context: { vendor_name: "stripe", call_purpose: "authorize" },
}

describe("generateReadme", () => {
  it("mentions the customer name", () => {
    const md = generateReadme(spec, "transfers")
    expect(md).toContain("Acme Corp")
  })

  it("mentions the entity plural", () => {
    const md = generateReadme(spec, "transfers")
    expect(md).toContain("transfers")
  })

  it("includes run instructions", () => {
    const md = generateReadme(spec, "transfers")
    expect(md).toMatch(/pnpm|npm|install|dev/i)
  })

  it("is non-empty markdown with a heading", () => {
    const md = generateReadme(spec, "transfers")
    expect(md.startsWith("#")).toBe(true)
  })
})

describe("generateImplementationGuide", () => {
  it("includes pattern reference_guidance content", () => {
    const md = generateImplementationGuide(
      spec,
      [customBusinessSpan, dbQuery, httpClient],
      vocabMap,
    )
    // custom_business_span has reference_guidance
    expect(md).toContain("Sentry.startSpan")
  })

  it("includes each pattern title", () => {
    const md = generateImplementationGuide(spec, [customBusinessSpan], vocabMap)
    expect(md).toContain("Custom business span")
  })

  it("is non-empty markdown with a heading", () => {
    const md = generateImplementationGuide(spec, [customBusinessSpan], vocabMap)
    expect(md.startsWith("#")).toBe(true)
  })
})

describe("generateSentryMd", () => {
  it("mentions the parent pattern and spans", () => {
    const md = generateSentryMd(
      customBusinessSpan,
      [dbQuery, httpClient],
      vocabMap.custom_business_span,
    )
    expect(md).toContain("Custom business span")
  })

  it("includes the resolved span name", () => {
    const md = generateSentryMd(
      customBusinessSpan,
      [],
      { entity: "transfer", entity_plural: "transfers", action: "execute" },
    )
    expect(md).toContain("transfer.execute")
  })

  it("is non-empty markdown", () => {
    const md = generateSentryMd(customBusinessSpan, [], vocabMap.custom_business_span)
    expect(md.trim().length).toBeGreaterThan(0)
  })
})

describe("generateDashboardJson", () => {
  it("returns valid JSON", () => {
    expect(() => JSON.parse(generateDashboardJson(spec))).not.toThrow()
  })

  it("has an empty widgets array (MVP placeholder)", () => {
    const parsed = JSON.parse(generateDashboardJson(spec))
    expect(parsed.widgets).toEqual([])
  })

  it("includes the spec id", () => {
    const parsed = JSON.parse(generateDashboardJson(spec))
    expect(parsed.specId ?? parsed.spec_id ?? parsed.id).toBe("acme-001")
  })
})
