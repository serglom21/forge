import { readdirSync, readFileSync } from "node:fs"
import { basename, join } from "node:path"
import { parse as parseYaml } from "yaml"
import { PatternSchema } from "../schema/index"
import type { Pattern } from "../schema/index"

interface LoadedEntry {
  pattern: Pattern
  filepath: string
}

function loadFromDir(dir: string): LoadedEntry[] {
  const filenames = readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .sort()

  const result: LoadedEntry[] = []

  for (const filename of filenames) {
    const filepath = join(dir, filename)

    let raw: unknown
    try {
      raw = parseYaml(readFileSync(filepath, "utf8"))
    } catch (err) {
      throw new Error(
        `Failed to parse YAML in "${filename}": ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    try {
      const pattern = PatternSchema.parse(raw)
      result.push({ pattern, filepath })
    } catch (err) {
      throw new Error(
        `Pattern in "${filename}" failed schema validation: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  return result
}

export function loadPatterns(dir: string): Pattern[] {
  return loadFromDir(dir).map(({ pattern }) => pattern)
}

export function loadPatternsFromDirs(dirs: string[]): Pattern[] {
  const all: LoadedEntry[] = []
  for (const dir of dirs) {
    all.push(...loadFromDir(dir))
  }

  const seen = new Map<string, string>() // pattern id → filepath
  for (const { pattern, filepath } of all) {
    if (seen.has(pattern.id)) {
      const first = seen.get(pattern.id)!
      throw new Error(
        `Duplicate pattern id "${pattern.id}" found in "${basename(first)}" and "${basename(filepath)}"`,
      )
    }
    seen.set(pattern.id, filepath)
  }

  return all.map(({ pattern }) => pattern)
}
