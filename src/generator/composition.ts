import type { Pattern, EngagementSpec } from "../schema/index"

export interface CompositionNode {
  pattern: Pattern
  children: CompositionNode[]
}

/**
 * Groups patterns from the spec into a parent→children tree.
 * Roots are patterns with requires_parent: false (standalone parents).
 * Children are patterns with requires_parent: true, attached under the
 * first parent in their composes_with list that is present in the spec.
 * Children are ordered by their position in spec.patternIds.
 */
export function buildCompositionTree(
  patterns: Pattern[],
  spec: EngagementSpec,
): CompositionNode[] {
  const patternMap = new Map(patterns.map((p) => [p.id, p]))

  // Preserve spec ordering throughout
  const patternsInSpec = spec.patternIds
    .map((id) => patternMap.get(id))
    .filter((p): p is Pattern => p !== undefined)

  function buildNode(pattern: Pattern): CompositionNode {
    const children = patternsInSpec
      .filter(
        (p) =>
          p.requires_parent &&
          (p.composes_with ?? []).includes(pattern.id),
      )
      .map(buildNode)
    return { pattern, children }
  }

  return patternsInSpec.filter((p) => !p.requires_parent).map(buildNode)
}
