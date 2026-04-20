import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { loadPatterns, loadPatternsFromDirs } from "./loader"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PATTERNS_DIR = join(__dirname, "..", "..", "patterns")

describe("loadPatterns", () => {
  it("returns exactly three patterns from patterns/ with the correct ids", () => {
    const patterns = loadPatterns(PATTERNS_DIR)
    expect(patterns).toHaveLength(3)
    expect(patterns.map((p) => p.id).sort()).toEqual([
      "custom_business_span",
      "db_query_business_context",
      "http_client_business_context",
    ])
  })

  it("throws with the filename when a YAML file fails schema validation", () => {
    const fixtureDir = join(__dirname, "__fixtures__/malformed")
    expect(() => loadPatterns(fixtureDir)).toThrow(/malformed_pattern\.yaml/)
  })
})

describe("loadPatternsFromDirs", () => {
  it("merges patterns from multiple directories and returns all", () => {
    const patterns = loadPatternsFromDirs([PATTERNS_DIR])
    expect(patterns).toHaveLength(3)
    expect(patterns.map((p) => p.id).sort()).toEqual([
      "custom_business_span",
      "db_query_business_context",
      "http_client_business_context",
    ])
  })

  it("throws with both filenames when a duplicate pattern ID is found across dirs", () => {
    const dupDir = join(__dirname, "__fixtures__/duplicate")
    let caught: Error | null = null
    try {
      loadPatternsFromDirs([PATTERNS_DIR, dupDir])
    } catch (err) {
      caught = err as Error
    }
    expect(caught).not.toBeNull()
    expect(caught!.message).toMatch(/custom_business_span\.yaml/)
    expect(caught!.message).toMatch(/custom_business_span_copy\.yaml/)
  })
})
