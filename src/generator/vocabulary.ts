import type { Pattern } from "../schema/index"

export type ResolvedVocab = Record<string, string>

/**
 * Resolves vocabulary tokens for a pattern.
 * Priority: spec overrides > pattern defaults. Required tokens without an override throw.
 * After building the map, any {parent.X} refs in values are resolved from parentVocab.
 */
export function resolveVocabulary(
  pattern: Pattern,
  specOverrides: Record<string, string>,
  parentVocab?: ResolvedVocab,
): ResolvedVocab {
  const resolved: ResolvedVocab = {}

  for (const [token, def] of Object.entries(pattern.vocabulary)) {
    if (token in specOverrides) {
      resolved[token] = specOverrides[token]
    } else if ("default" in def) {
      resolved[token] = def.default
    } else {
      throw new Error(
        `Required vocabulary token "${token}" in pattern "${pattern.id}" has no override in spec`,
      )
    }
  }

  if (parentVocab) {
    for (const [token, value] of Object.entries(resolved)) {
      resolved[token] = value.replace(
        /\{parent\.([a-zA-Z_][a-zA-Z0-9_]*)\}/g,
        (_, key) => parentVocab[key] ?? `{parent.${key}}`,
      )
    }
  }

  return resolved
}

/**
 * Substitutes {token} and {parent.token} references in any string.
 * Parent refs are resolved first so they don't conflict with local vocab.
 */
export function resolveString(
  str: string,
  vocab: ResolvedVocab,
  parentVocab?: ResolvedVocab,
): string {
  let result = str

  if (parentVocab) {
    result = result.replace(
      /\{parent\.([a-zA-Z_][a-zA-Z0-9_]*)\}/g,
      (_, key) => parentVocab[key] ?? `{parent.${key}}`,
    )
  }

  result = result.replace(
    /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g,
    (_, token) => vocab[token] ?? `{${token}}`,
  )

  return result
}
