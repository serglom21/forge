import { describe, expect, it } from "vitest"
import { EngagementSpecSchema } from "./engagement-spec"

const VALID_SPEC = {
  id: "acme-fintech-001",
  customer: "Acme Corp",
  vertical: "fintech",
  stack: "nextjs-express",
  patternIds: [
    "custom_business_span",
    "db_query_business_context",
    "http_client_business_context",
  ],
  sentry: {
    dsn: "https://public@sentry.example.com/1",
  },
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

describe("EngagementSpecSchema", () => {
  it("parses a valid spec with all three MVP patterns", () => {
    expect(() => EngagementSpecSchema.parse(VALID_SPEC)).not.toThrow()
  })

  it("rejects an empty customer", () => {
    const bad = { ...VALID_SPEC, customer: "" }
    expect(() => EngagementSpecSchema.parse(bad)).toThrow(/customer/i)
  })

  it("rejects an empty patternIds array", () => {
    const bad = { ...VALID_SPEC, patternIds: [] }
    expect(() => EngagementSpecSchema.parse(bad)).toThrow()
  })

  it("rejects an unknown vertical", () => {
    const bad = { ...VALID_SPEC, vertical: "biotech" }
    expect(() => EngagementSpecSchema.parse(bad)).toThrow()
  })

  it("rejects an unknown stack", () => {
    const bad = { ...VALID_SPEC, stack: "rails" }
    expect(() => EngagementSpecSchema.parse(bad)).toThrow()
  })

  it("rejects vocabulary that references a pattern not in patternIds", () => {
    const bad = {
      ...VALID_SPEC,
      vocabulary: {
        ...VALID_SPEC.vocabulary,
        nonexistent_pattern: { some_token: "value" },
      },
    }
    expect(() => EngagementSpecSchema.parse(bad)).toThrow(/nonexistent_pattern/)
  })

  it("accepts sentry with all optional fields", () => {
    const withOptional = {
      ...VALID_SPEC,
      sentry: {
        dsn: "https://public@sentry.example.com/1",
        projectSlug: "my-project",
        org: "acme",
        dashboardId: "d-123",
      },
    }
    expect(() => EngagementSpecSchema.parse(withOptional)).not.toThrow()
  })

  it("accepts a spec without vocabulary (defaults to empty)", () => {
    const { vocabulary: _v, ...withoutVocab } = VALID_SPEC
    expect(() => EngagementSpecSchema.parse(withoutVocab)).not.toThrow()
  })
})
