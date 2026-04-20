import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import type { EngagementSpec } from "./engagement-spec"
import { PatternSchema } from "./pattern"
import type { Pattern } from "./pattern"
import { SpecValidationError, validateSpecAgainstPatterns } from "./validate-spec-against-patterns"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PATTERNS_DIR = join(__dirname, "..", "..", "patterns")

function loadAllPatterns(): Pattern[] {
  return [
    "custom_business_span.yaml",
    "db_query_business_context.yaml",
    "http_client_business_context.yaml",
  ].map((f) => PatternSchema.parse(parse(readFileSync(join(PATTERNS_DIR, f), "utf8"))))
}

const BASE_SPEC: EngagementSpec = {
  id: "acme-001",
  customer: "Acme",
  vertical: "fintech",
  stack: "nextjs-express",
  patternIds: [
    "custom_business_span",
    "db_query_business_context",
    "http_client_business_context",
  ],
  sentry: { dsn: "https://public@sentry.example.com/1" },
  vocabulary: {
    custom_business_span: {
      entity: "transfer",
      entity_plural: "transfers",
      action: "execute",
    },
    db_query_business_context: {
      attribute_key: "transfer.amount",
      attribute_source: "req.body.amount",
    },
    http_client_business_context: {
      vendor_name: "stripe",
      call_purpose: "authorize",
    },
  },
}

describe("validateSpecAgainstPatterns", () => {
  it("passes for a valid spec with all three MVP patterns", () => {
    const patterns = loadAllPatterns()
    expect(() => validateSpecAgainstPatterns(BASE_SPEC, patterns)).not.toThrow()
  })

  it("throws SpecValidationError when a patternId is not found in loaded patterns", () => {
    const patterns = loadAllPatterns()
    const bad: EngagementSpec = {
      ...BASE_SPEC,
      patternIds: [...BASE_SPEC.patternIds, "nonexistent_pattern"],
      vocabulary: { ...BASE_SPEC.vocabulary, nonexistent_pattern: {} },
    }
    expect(() => validateSpecAgainstPatterns(bad, patterns)).toThrow(SpecValidationError)
    expect(() => validateSpecAgainstPatterns(bad, patterns)).toThrow(/nonexistent_pattern/)
  })

  it("throws naming the missing token when a required vocabulary override is absent", () => {
    const patterns = loadAllPatterns()
    const bad: EngagementSpec = {
      ...BASE_SPEC,
      vocabulary: {
        ...BASE_SPEC.vocabulary,
        custom_business_span: { entity: "transfer" }, // missing entity_plural and action
      },
    }
    expect(() => validateSpecAgainstPatterns(bad, patterns)).toThrow(SpecValidationError)
    expect(() => validateSpecAgainstPatterns(bad, patterns)).toThrow(/entity_plural|action/)
  })

  it("throws when a requires_parent pattern has no parent provider in the spec", () => {
    const patterns = loadAllPatterns()
    // Only db_query_business_context (requires_parent: true) — no custom_business_span
    const bad: EngagementSpec = {
      ...BASE_SPEC,
      patternIds: ["db_query_business_context"],
      vocabulary: {
        db_query_business_context: {
          attribute_key: "transfer.amount",
          attribute_source: "req.body.amount",
        },
      },
    }
    expect(() => validateSpecAgainstPatterns(bad, patterns)).toThrow(SpecValidationError)
    expect(() => validateSpecAgainstPatterns(bad, patterns)).toThrow(/requires_parent|parent/i)
  })
})
