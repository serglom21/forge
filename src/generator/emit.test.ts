import { describe, expect, it } from "vitest"
import { emitParentSpan, emitSdkEnhancedAttrs, emitSdkAutoIntegrations } from "./emit"

describe("emitParentSpan", () => {
  it("wraps body lines in Sentry.startSpan callback", () => {
    const code = emitParentSpan(
      "recipe.submit",
      "function",
      { "recipe.id": "req.body.id" },
      ["        const x = 1;", "        return x;"],
    )
    expect(code).toContain("Sentry.startSpan(")
    expect(code).toContain("name: 'recipe.submit'")
    expect(code).toContain("op: 'function'")
    expect(code).toContain("'recipe.id': req.body.id")
    expect(code).toContain("async (span) => {")
    expect(code).toContain("const x = 1;")
    expect(code).toContain("return x;")
  })

  it("includes a // SENTRY: comment explaining the span", () => {
    const code = emitParentSpan("transfer.execute", "function", {}, [])
    expect(code).toMatch(/\/\/ SENTRY:/i)
  })

  it("emits no attributes block when attributes is empty", () => {
    const code = emitParentSpan("recipe.submit", "function", {}, ["        return 1;"])
    // attributes key should be omitted or empty
    expect(code).not.toMatch(/'[^']+': req\./)
  })

  it("quotes attribute values that are string literals (not code expressions)", () => {
    const code = emitParentSpan(
      "transfer.execute",
      "function",
      { "transfer.id": "'ABC123'" },
      [],
    )
    expect(code).toContain("'transfer.id': 'ABC123'")
  })
})

describe("emitSdkEnhancedAttrs", () => {
  it("emits getActiveSpan setAttributes call", () => {
    const code = emitSdkEnhancedAttrs([
      { key: "transfer.amount", valueExpr: "req.body.amount" },
    ])
    expect(code).toContain("Sentry.getActiveSpan()?.setAttributes(")
    expect(code).toContain("'transfer.amount': req.body.amount")
  })

  it("includes a // SENTRY: comment", () => {
    const code = emitSdkEnhancedAttrs([{ key: "vendor", valueExpr: "'stripe'" }])
    expect(code).toMatch(/\/\/ SENTRY:/i)
  })

  it("emits multiple attributes in one call", () => {
    const code = emitSdkEnhancedAttrs([
      { key: "vendor", valueExpr: "'stripe'" },
      { key: "call.purpose", valueExpr: "'authorize'" },
    ])
    expect(code).toContain("'vendor': 'stripe'")
    expect(code).toContain("'call.purpose': 'authorize'")
  })

  it("returns empty string when given no attributes", () => {
    expect(emitSdkEnhancedAttrs([])).toBe("")
  })
})

describe("emitSdkAutoIntegrations", () => {
  it("returns empty string when no sdk_auto integrations are needed", () => {
    expect(emitSdkAutoIntegrations([])).toBe("")
  })

  it("emits integration entries for sdk_auto requirements", () => {
    const code = emitSdkAutoIntegrations([
      { integration: "postgresIntegration", package: "@sentry/node" },
    ])
    expect(code).toContain("postgresIntegration()")
  })
})
