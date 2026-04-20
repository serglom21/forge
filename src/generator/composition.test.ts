import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"
import { PatternSchema } from "../schema/index"
import type { EngagementSpec } from "../schema/index"
import { buildCompositionTree } from "./composition"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PATTERNS_DIR = join(__dirname, "..", "..", "patterns")

function loadPattern(filename: string) {
  return PatternSchema.parse(parse(readFileSync(join(PATTERNS_DIR, filename), "utf8")))
}

const customBusinessSpan = loadPattern("custom_business_span.yaml")
const dbQuery = loadPattern("db_query_business_context.yaml")
const httpClient = loadPattern("http_client_business_context.yaml")

const BASE_SPEC: EngagementSpec = {
  id: "test-001",
  customer: "Acme",
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

describe("buildCompositionTree", () => {
  it("returns one root node when spec has only the parent pattern", () => {
    const spec: EngagementSpec = {
      ...BASE_SPEC,
      patternIds: ["custom_business_span"],
      vocabulary: { custom_business_span: { entity: "recipe", entity_plural: "recipes", action: "submit" } },
    }
    const tree = buildCompositionTree([customBusinessSpan], spec)
    expect(tree).toHaveLength(1)
    expect(tree[0].pattern.id).toBe("custom_business_span")
    expect(tree[0].children).toHaveLength(0)
  })

  it("attaches child patterns under their parent", () => {
    const tree = buildCompositionTree(
      [customBusinessSpan, dbQuery, httpClient],
      BASE_SPEC,
    )
    expect(tree).toHaveLength(1)
    const root = tree[0]
    expect(root.pattern.id).toBe("custom_business_span")
    expect(root.children).toHaveLength(2)
    const childIds = root.children.map((c) => c.pattern.id).sort()
    expect(childIds).toEqual(["db_query_business_context", "http_client_business_context"])
  })

  it("children are ordered by their position in spec.patternIds", () => {
    // spec.patternIds order: custom_business_span, db_query, http_client
    const tree = buildCompositionTree(
      [customBusinessSpan, dbQuery, httpClient],
      BASE_SPEC,
    )
    const childIds = tree[0].children.map((c) => c.pattern.id)
    expect(childIds).toEqual(["db_query_business_context", "http_client_business_context"])
  })

  it("returns empty array when spec has no patterns", () => {
    const spec: EngagementSpec = {
      ...BASE_SPEC,
      patternIds: ["custom_business_span"],
      vocabulary: { custom_business_span: { entity: "x", entity_plural: "xs", action: "do" } },
    }
    const tree = buildCompositionTree([], spec)
    expect(tree).toHaveLength(0)
  })

  it("child node carries the correct pattern", () => {
    const tree = buildCompositionTree(
      [customBusinessSpan, dbQuery],
      {
        ...BASE_SPEC,
        patternIds: ["custom_business_span", "db_query_business_context"],
        vocabulary: {
          custom_business_span: { entity: "transfer", entity_plural: "transfers", action: "execute" },
          db_query_business_context: { attribute_key: "transfer.amount", attribute_source: "req.body.amount" },
        },
      },
    )
    expect(tree[0].children[0].pattern.id).toBe("db_query_business_context")
    expect(tree[0].children[0].children).toHaveLength(0)
  })
})
