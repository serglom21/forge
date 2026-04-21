import { readFileSync, readdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { EngagementSpecSchema, validateSpecAgainstPatterns } from "../src/schema/index.js"
import { loadPatterns } from "../src/patterns/loader.js"
import { generate } from "../src/generator/generate.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")

function parseArgs(): { specPath: string; outDir: string } {
  const args = process.argv.slice(2)
  const specIdx = args.indexOf("--spec")
  const outIdx = args.indexOf("--out")

  if (specIdx === -1 || !args[specIdx + 1]) {
    console.error("Error: --spec <path> is required")
    process.exit(1)
  }
  if (outIdx === -1 || !args[outIdx + 1]) {
    console.error("Error: --out <path> is required")
    process.exit(1)
  }

  return {
    specPath: resolve(args[specIdx + 1]),
    outDir: resolve(args[outIdx + 1]),
  }
}

function countFiles(dir: string): number {
  let count = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(join(dir, entry.name))
    } else {
      count++
    }
  }
  return count
}

const { specPath, outDir } = parseArgs()

// 1. Read and parse spec
let specRaw: unknown
try {
  specRaw = JSON.parse(readFileSync(specPath, "utf8"))
} catch (err) {
  console.error(`Error reading spec: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}

const specResult = EngagementSpecSchema.safeParse(specRaw)
if (!specResult.success) {
  console.error("Error: spec failed schema validation")
  console.error(specResult.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n"))
  process.exit(1)
}
const spec = specResult.data

// 2. Load patterns
let patterns
try {
  patterns = loadPatterns(join(ROOT, "patterns"))
} catch (err) {
  console.error(`Error loading patterns: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}

// 3. Cross-validate spec against patterns
try {
  validateSpecAgainstPatterns(spec, patterns)
} catch (err) {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}

// 4. Generate
const templateDir = join(ROOT, "templates", spec.stack)
try {
  generate(spec, patterns, templateDir, outDir)
} catch (err) {
  console.error(`Error during generation: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}

// 5. Summary
const fileCount = countFiles(outDir)
console.log(`✓ Generated for ${spec.customer}`)
console.log(`  Patterns : ${spec.patternIds.join(", ")}`)
console.log(`  Output   : ${outDir}`)
console.log(`  Files    : ${fileCount}`)
