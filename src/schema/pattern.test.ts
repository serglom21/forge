import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import { PatternSchema } from "./pattern"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PATTERNS_DIR = join(__dirname, "..", "..", "patterns")

function loadPattern(filename: string): unknown {
  return parse(readFileSync(join(PATTERNS_DIR, filename), "utf8"))
}

describe("PatternSchema — committed MVP patterns", () => {
  it("parses custom_business_span.yaml", () => {
    expect(() => PatternSchema.parse(loadPattern("custom_business_span.yaml"))).not.toThrow()
  })

  it("parses db_query_business_context.yaml", () => {
    expect(() => PatternSchema.parse(loadPattern("db_query_business_context.yaml"))).not.toThrow()
  })

  it("parses http_client_business_context.yaml", () => {
    expect(() => PatternSchema.parse(loadPattern("http_client_business_context.yaml"))).not.toThrow()
  })
})

describe("PatternSchema — no-double-instrumentation rule", () => {
  it("rejects source: manual with op: db.query", () => {
    const bad = {
      id: "bad_pattern",
      title: "Bad",
      verticals: ["fintech"],
      stacks: ["nextjs-express"],
      spans: [{ id: "bad.span", source: "manual", op: "db.query", attributes: [] }],
      sdk_requirements: [],
      sdk_min_version: {},
    }
    expect(() => PatternSchema.parse(bad)).toThrow(/double-instrumentation|sdk-owned|db\.query/i)
  })

  it("rejects source: manual with op: http.client", () => {
    const bad = {
      id: "bad_pattern",
      title: "Bad",
      verticals: ["fintech"],
      stacks: ["nextjs-express"],
      spans: [{ id: "bad", source: "manual", op: "http.client", attributes: [] }],
      sdk_requirements: [],
      sdk_min_version: {},
    }
    expect(() => PatternSchema.parse(bad)).toThrow()
  })

  it("rejects source: manual with op: http.server", () => {
    const bad = {
      id: "bad_pattern",
      title: "Bad",
      verticals: ["fintech"],
      stacks: ["nextjs-express"],
      spans: [{ id: "bad", source: "manual", op: "http.server", attributes: [] }],
      sdk_requirements: [],
      sdk_min_version: {},
    }
    expect(() => PatternSchema.parse(bad)).toThrow()
  })

  it("accepts source: manual with op: function", () => {
    const good = {
      id: "good_pattern",
      title: "Good",
      verticals: ["fintech"],
      stacks: ["nextjs-express"],
      spans: [{ id: "good.span", source: "manual", op: "function", attributes: [] }],
      sdk_requirements: [],
      sdk_min_version: {},
    }
    expect(() => PatternSchema.parse(good)).not.toThrow()
  })
})

describe("PatternSchema — SentryOpEnum", () => {
  it("rejects an unknown op value", () => {
    const bad = {
      id: "bad_op",
      title: "Bad op",
      verticals: ["fintech"],
      stacks: ["nextjs-express"],
      spans: [{ id: "bad", source: "manual", op: "not_a_real_op", attributes: [] }],
      sdk_requirements: [],
      sdk_min_version: {},
    }
    expect(() => PatternSchema.parse(bad)).toThrow()
  })

  it.each(["function", "cache.get", "cache.set", "ui.render", "task", "ui.webvital", "pageload", "navigation"])(
    "accepts source:manual with op: %s",
    (op) => {
      const good = {
        id: "test_op",
        title: "Test",
        verticals: ["fintech"],
        stacks: ["nextjs-express"],
        spans: [{ id: "test.span", source: "manual", op, attributes: [] }],
        sdk_requirements: [],
        sdk_min_version: {},
      }
      expect(() => PatternSchema.parse(good)).not.toThrow()
    },
  )

  it.each(["db.query", "http.client", "http.server"])(
    "accepts SDK-owned op: %s with source: sdk_enhanced",
    (op) => {
      const good = {
        id: "test_op",
        title: "Test",
        verticals: ["fintech"],
        stacks: ["nextjs-express"],
        spans: [{ id: "test.span", source: "sdk_enhanced", op, attributes_to_inject: [] }],
        sdk_requirements: [],
        sdk_min_version: {},
      }
      expect(() => PatternSchema.parse(good)).not.toThrow()
    },
  )
})

describe("PatternSchema — token reference validation", () => {
  it("rejects a pattern with an undeclared {token} in span id", () => {
    const bad = {
      id: "bad_token",
      title: "Bad token",
      verticals: ["fintech"],
      stacks: ["nextjs-express"],
      vocabulary: {},
      spans: [{ id: "{undeclared}.span", source: "manual", op: "function", attributes: [] }],
      sdk_requirements: [],
      sdk_min_version: {},
    }
    expect(() => PatternSchema.parse(bad)).toThrow(/undeclared|not declared/i)
  })

  it("accepts a pattern where all {tokens} are declared in vocabulary", () => {
    const good = {
      id: "good_token",
      title: "Good token",
      verticals: ["fintech"],
      stacks: ["nextjs-express"],
      vocabulary: {
        entity: { required: true, description: "A thing" },
      },
      spans: [{ id: "{entity}.span", source: "manual", op: "function", attributes: [] }],
      sdk_requirements: [],
      sdk_min_version: {},
    }
    expect(() => PatternSchema.parse(good)).not.toThrow()
  })
})

describe("PatternSchema — vocabulary token union", () => {
  it("accepts required: true tokens", () => {
    const good = {
      id: "vocab_test",
      title: "Vocab test",
      verticals: ["fintech"],
      stacks: ["nextjs-express"],
      vocabulary: { entity: { required: true, description: "A thing" } },
      spans: [],
      sdk_requirements: [],
      sdk_min_version: {},
    }
    expect(() => PatternSchema.parse(good)).not.toThrow()
  })

  it("accepts default: string tokens", () => {
    const good = {
      id: "vocab_test",
      title: "Vocab test",
      verticals: ["fintech"],
      stacks: ["nextjs-express"],
      vocabulary: { entity: { default: "widget", description: "A thing" } },
      spans: [],
      sdk_requirements: [],
      sdk_min_version: {},
    }
    expect(() => PatternSchema.parse(good)).not.toThrow()
  })
})
