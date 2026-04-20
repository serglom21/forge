import type { EngagementSpec } from "./engagement-spec"
import type { Pattern } from "./pattern"

export class SpecValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SpecValidationError"
  }
}

export function validateSpecAgainstPatterns(
  spec: EngagementSpec,
  patterns: Pattern[],
): void {
  const patternMap = new Map(patterns.map((p) => [p.id, p]))

  // Every patternId in the spec must have a matching loaded pattern
  for (const pid of spec.patternIds) {
    if (!patternMap.has(pid)) {
      throw new SpecValidationError(
        `Pattern "${pid}" is listed in spec.patternIds but was not found in loaded patterns`,
      )
    }
  }

  const patternsInSpec = spec.patternIds.map((pid) => patternMap.get(pid)!)

  // Every required vocabulary token in each pattern must be overridden in the spec
  for (const pattern of patternsInSpec) {
    const overrides = spec.vocabulary[pattern.id] ?? {}
    for (const [token, def] of Object.entries(pattern.vocabulary)) {
      if ("required" in def && def.required === true && !(token in overrides)) {
        throw new SpecValidationError(
          `Pattern "${pattern.id}" requires vocabulary token "${token}" but it is not overridden in the spec`,
        )
      }
    }
  }

  // Every override key must be a declared token in the pattern's vocabulary (typo detection)
  for (const pattern of patternsInSpec) {
    const overrides = spec.vocabulary[pattern.id] ?? {}
    const declaredTokens = new Set(Object.keys(pattern.vocabulary))
    for (const key of Object.keys(overrides)) {
      if (!declaredTokens.has(key)) {
        throw new SpecValidationError(
          `Pattern "${pattern.id}" vocabulary override contains unknown token "${key}" — check for typos`,
        )
      }
    }
  }

  // Every requires_parent pattern must have a composes_with partner in the spec that provides parent_span
  const specPatternIds = new Set(spec.patternIds)
  for (const pattern of patternsInSpec) {
    if (pattern.requires_parent) {
      const hasCompatibleParent = (pattern.composes_with ?? []).some((id) => {
        if (!specPatternIds.has(id)) return false
        return patternMap.get(id)?.provides?.parent_span !== undefined
      })
      if (!hasCompatibleParent) {
        throw new SpecValidationError(
          `Pattern "${pattern.id}" has requires_parent: true but none of its composes_with patterns providing a parent_span are present in the spec`,
        )
      }
    }
  }
}
