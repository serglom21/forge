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

  // Every requires_parent pattern must have a compatible parent in the same spec
  const hasParentProvider = patternsInSpec.some(
    (p) => p.provides?.parent_span !== undefined,
  )
  for (const pattern of patternsInSpec) {
    if (pattern.requires_parent && !hasParentProvider) {
      throw new SpecValidationError(
        `Pattern "${pattern.id}" has requires_parent: true but no pattern in the spec provides a parent_span`,
      )
    }
  }
}
