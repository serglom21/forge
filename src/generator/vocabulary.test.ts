import { describe, expect, it } from "vitest"
import { PatternSchema } from "../schema/index"
import { resolveVocabulary, resolveString } from "./vocabulary"

const patternAllRequired = PatternSchema.parse({
  id: "test_parent",
  title: "Test Parent",
  verticals: ["fintech"],
  stacks: ["nextjs-express"],
  vocabulary: {
    entity:        { required: true, description: "Business noun" },
    entity_plural: { required: true, description: "Plural form" },
    action:        { required: true, description: "Verb" },
  },
  spans: [],
  sdk_requirements: [],
  sdk_min_version: {},
})

const patternWithDefaults = PatternSchema.parse({
  id: "test_defaults",
  title: "Test Defaults",
  verticals: ["fintech"],
  stacks: ["nextjs-express"],
  vocabulary: {
    step_name: { default: "process", description: "Step name" },
    step_verb: { default: "executing" },
  },
  spans: [],
  sdk_requirements: [],
  sdk_min_version: {},
})

const patternMixed = PatternSchema.parse({
  id: "test_mixed",
  title: "Test Mixed",
  verticals: ["fintech"],
  stacks: ["nextjs-express"],
  vocabulary: {
    entity:    { required: true, description: "Business noun" },
    step_name: { default: "process", description: "Step name" },
  },
  spans: [],
  sdk_requirements: [],
  sdk_min_version: {},
})

describe("resolveVocabulary", () => {
  it("resolves all required tokens from spec overrides", () => {
    const result = resolveVocabulary(patternAllRequired, {
      entity: "recipe",
      entity_plural: "recipes",
      action: "submit",
    })
    expect(result).toEqual({ entity: "recipe", entity_plural: "recipes", action: "submit" })
  })

  it("uses pattern defaults when spec provides no overrides", () => {
    const result = resolveVocabulary(patternWithDefaults, {})
    expect(result).toEqual({ step_name: "process", step_verb: "executing" })
  })

  it("spec override wins over default", () => {
    const result = resolveVocabulary(patternWithDefaults, { step_name: "validate" })
    expect(result.step_name).toBe("validate")
    expect(result.step_verb).toBe("executing")
  })

  it("mixed: resolves required from spec and defaults from pattern", () => {
    const result = resolveVocabulary(patternMixed, { entity: "order" })
    expect(result).toEqual({ entity: "order", step_name: "process" })
  })

  it("throws when a required token has no override", () => {
    expect(() =>
      resolveVocabulary(patternAllRequired, { entity: "recipe" })
    ).toThrow(/entity_plural/)
  })

  it("resolves {parent.X} references in token values using parent vocab", () => {
    const childPattern = PatternSchema.parse({
      id: "child_pattern",
      title: "Child",
      verticals: ["any"],
      stacks: ["nextjs-express"],
      vocabulary: {
        label: { default: "{parent.entity}_context", description: "Uses parent token" },
      },
      spans: [],
      sdk_requirements: [],
      sdk_min_version: {},
    })
    const parentVocab = { entity: "transfer", action: "execute" }
    const result = resolveVocabulary(childPattern, {}, parentVocab)
    expect(result.label).toBe("transfer_context")
  })
})

describe("resolveString", () => {
  it("substitutes simple {token} references", () => {
    expect(resolveString("{entity}.{action}", { entity: "recipe", action: "submit" }))
      .toBe("recipe.submit")
  })

  it("substitutes multiple tokens in a complex string", () => {
    expect(resolveString("/api/{entity_plural}", { entity_plural: "recipes" }))
      .toBe("/api/recipes")
  })

  it("substitutes {parent.X} references from parentVocab", () => {
    expect(resolveString("for {parent.entity}", { key: "x" }, { entity: "transfer" }))
      .toBe("for transfer")
  })

  it("leaves unresolved {token} references intact", () => {
    expect(resolveString("{entity}.{missing}", { entity: "recipe" }))
      .toBe("recipe.{missing}")
  })

  it("resolves {parent.X} before {X} so they don't interfere", () => {
    const vocab = { entity: "local" }
    const parentVocab = { entity: "parent" }
    // {parent.entity} should resolve to "parent", not to the local vocab's entity
    expect(resolveString("{parent.entity} vs {entity}", vocab, parentVocab))
      .toBe("parent vs local")
  })
})
