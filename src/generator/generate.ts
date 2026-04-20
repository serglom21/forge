import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs"
import { join } from "node:path"
import type { EngagementSpec, Pattern } from "../schema/index"
import { buildCompositionTree, type CompositionNode } from "./composition"
import { emitParentSpan, emitSdkEnhancedAttrs, emitSdkAutoIntegrations, type AttrEntry } from "./emit"
import { generateDashboardJson, generateImplementationGuide, generateReadme, generateSentryMd } from "./files"
import { resolveString, resolveVocabulary, type ResolvedVocab } from "./vocabulary"

const COPY_EXCLUDE = new Set(["node_modules", "dist", ".next"])

function copyDir(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (COPY_EXCLUDE.has(entry.name)) continue
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

/**
 * Resolves an attribute source expression.
 * "vocabulary.X" → the quoted string value from vocab (e.g. "'stripe'").
 * Any other string → resolve {token} refs and use as a code expression (unquoted).
 */
function resolveAttrSource(
  rawSource: string,
  vocab: ResolvedVocab,
  parentVocab?: ResolvedVocab,
): string {
  const vocabRef = rawSource.match(/^vocabulary\.([a-zA-Z_][a-zA-Z0-9_]*)$/)
  if (vocabRef) {
    const key = vocabRef[1]
    const val = vocab[key] ?? parentVocab?.[key]
    return val !== undefined ? `'${val}'` : rawSource
  }
  return resolveString(rawSource, vocab, parentVocab)
}

/**
 * Replaces SDK_ENHANCED_ATTRS markers in handler body lines with setAttributes calls.
 * Markers with no matching child pattern are removed (line dropped).
 */
function processBodyLines(
  lines: string[],
  parentNode: CompositionNode,
  vocabMap: Record<string, ResolvedVocab>,
  parentVocab: ResolvedVocab,
): string[] {
  return lines.flatMap((line) => {
    const m = line.match(/^(\s*)\/\/ FORGE:SDK_ENHANCED_ATTRS:(\w+)\s*$/)
    if (!m) return [line]

    const indent = m[1]
    const injectionPoint = m[2]

    const attrs: AttrEntry[] = []
    for (const child of parentNode.children) {
      const childVocab = vocabMap[child.pattern.id] ?? {}
      for (const span of child.pattern.spans) {
        if (span.source !== "sdk_enhanced") continue
        for (const attr of span.attributes_to_inject) {
          if (attr.injection_point !== injectionPoint) continue
          const key = resolveString(attr.key, childVocab, parentVocab)
          const valueExpr = resolveAttrSource(attr.source, childVocab, parentVocab)
          attrs.push({ key, valueExpr })
        }
      }
    }

    if (attrs.length === 0) return []
    return emitSdkEnhancedAttrs(attrs, indent).split("\n")
  })
}

/**
 * Replaces FORGE markers in the route file content.
 * FORGE:PARENT_SPAN → wraps try-block body in Sentry.startSpan().
 * FORGE:SDK_ENHANCED_ATTRS:X → Sentry.getActiveSpan()?.setAttributes() inline.
 */
function processRouteFile(
  content: string,
  parentNode: CompositionNode,
  parentVocab: ResolvedVocab,
  vocabMap: Record<string, ResolvedVocab>,
): string {
  const lines = content.split("\n")

  const parentSpanIdx = lines.findIndex((l) => /\/\/ FORGE:PARENT_SPAN\s*$/.test(l))
  if (parentSpanIdx === -1) return content

  const catchIdx = lines.findIndex((l, i) => i > parentSpanIdx && l.includes("} catch ("))
  if (catchIdx === -1) return content

  // Extract body between marker and catch, process SDK_ENHANCED markers
  const rawBody = lines.slice(parentSpanIdx + 1, catchIdx)
  const processedBody = processBodyLines(rawBody, parentNode, vocabMap, parentVocab)

  // Add two extra spaces per line (body is inside the startSpan async callback)
  const indentedBody = processedBody.map((l) => (l.trim() === "" ? "" : "    " + l))

  // Resolve span details from the manual span
  const manualSpan = parentNode.pattern.spans.find((s) => s.source === "manual")
  const spanName = manualSpan
    ? resolveString(manualSpan.id, parentVocab)
    : `${parentVocab.entity ?? "item"}.${parentVocab.action ?? "process"}`
  const spanOp = manualSpan?.op ?? "function"

  const attributes: Record<string, string> = {}
  if (manualSpan?.source === "manual") {
    for (const attr of manualSpan.attributes) {
      attributes[resolveString(attr.key, parentVocab)] = attr.source
    }
  }

  // Determine indent from the FORGE marker line
  const markerIndent = lines[parentSpanIdx].match(/^(\s*)/)?.[1] ?? "    "
  const emitted = emitParentSpan(spanName, spanOp, attributes, indentedBody, markerIndent)

  return [...lines.slice(0, parentSpanIdx), emitted, ...lines.slice(catchIdx)].join("\n")
}

/**
 * Replaces FORGE:SENTRY_INIT_INTEGRATIONS in instrument.ts.
 */
function processInstrumentFile(content: string, parentNode: CompositionNode): string {
  // Collect sdk_auto requirements from all patterns in the tree
  const allPatterns = [
    parentNode.pattern,
    ...parentNode.children.map((c) => c.pattern),
  ]

  const requirements = allPatterns.flatMap((p) =>
    p.sdk_requirements.map((r) => ({
      integration: r.integration,
      package: r.package,
    })),
  )

  const emitted = emitSdkAutoIntegrations(requirements)
  return content.replace(/^\s*\/\/ FORGE:SENTRY_INIT_INTEGRATIONS\s*$/m, emitted)
}

/**
 * Walks all .ts/.tsx files in dir and applies replacer to each.
 */
function walkAndReplace(
  dir: string,
  replacer: (content: string, filePath: string) => string,
): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkAndReplace(fullPath, replacer)
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      const original = readFileSync(fullPath, "utf8")
      const updated = replacer(original, fullPath)
      if (updated !== original) writeFileSync(fullPath, updated)
    }
  }
}

/**
 * Pure function: generates the full reference app from spec + patterns + template.
 */
export function generate(
  spec: EngagementSpec,
  patterns: Pattern[],
  templateDir: string,
  outDir: string,
): void {
  // 1. Build composition tree
  const tree = buildCompositionTree(patterns, spec)
  if (tree.length === 0) throw new Error("No root patterns found in spec")
  const parentNode = tree[0]

  // 2. Resolve vocabularies
  const parentVocab = resolveVocabulary(
    parentNode.pattern,
    spec.vocabulary[parentNode.pattern.id] ?? {},
  )
  const vocabMap: Record<string, ResolvedVocab> = {
    [parentNode.pattern.id]: parentVocab,
  }
  for (const child of parentNode.children) {
    vocabMap[child.pattern.id] = resolveVocabulary(
      child.pattern,
      spec.vocabulary[child.pattern.id] ?? {},
      parentVocab,
    )
  }

  const entityPlural = parentVocab.entity_plural ?? "items"

  // 3. Copy template (excluding node_modules, dist, .next)
  const refAppDir = join(outDir, "reference-app")
  copyDir(join(templateDir, "backend"), join(refAppDir, "backend"))
  copyDir(join(templateDir, "frontend"), join(refAppDir, "frontend"))

  // 4. Process route file: replace FORGE markers + route path strings
  const backendSrcDir = join(refAppDir, "backend", "src")
  const itemsRoutePath = join(backendSrcDir, "routes", "items.ts")
  const newRoutePath = join(backendSrcDir, "routes", `${entityPlural}.ts`)

  let routeContent = readFileSync(itemsRoutePath, "utf8")
  routeContent = processRouteFile(routeContent, parentNode, parentVocab, vocabMap)
  routeContent = routeContent
    .replaceAll(`'/items/:id'`, `'/${entityPlural}/:id'`)
    .replaceAll(`'/items'`, `'/${entityPlural}'`)
  writeFileSync(newRoutePath, routeContent)
  unlinkSync(itemsRoutePath)

  // 5. Update backend index.ts: import name + route registration
  const indexPath = join(backendSrcDir, "index.ts")
  let indexContent = readFileSync(indexPath, "utf8")
  indexContent = indexContent
    .replace("'./routes/items.js'", `'./routes/${entityPlural}.js'`)
    .replace(`"./routes/items.js"`, `"./routes/${entityPlural}.js"`)
    .replaceAll("itemsRouter", `${entityPlural}Router`)
  writeFileSync(indexPath, indexContent)

  // 6. Process instrument.ts: replace FORGE:SENTRY_INIT_INTEGRATIONS
  const instrumentPath = join(backendSrcDir, "instrument.ts")
  if (existsSync(instrumentPath)) {
    const instrumentContent = readFileSync(instrumentPath, "utf8")
    writeFileSync(instrumentPath, processInstrumentFile(instrumentContent, parentNode))
  }

  // 7. Rename frontend app/items/ → app/{entityPlural}/
  const itemsFrontendDir = join(refAppDir, "frontend", "app", "items")
  const newFrontendDir = join(refAppDir, "frontend", "app", entityPlural)
  if (existsSync(itemsFrontendDir)) {
    renameSync(itemsFrontendDir, newFrontendDir)
  }

  // 8. Replace /items URL references in all frontend .ts/.tsx files
  walkAndReplace(join(refAppDir, "frontend"), (content) =>
    content.replace(/\/items(\/|['"`])/g, `/${entityPlural}$1`),
  )
  // Also replace /api/items API endpoint references
  walkAndReplace(join(refAppDir, "frontend"), (content) =>
    content.replace(/\/api\/items\b/g, `/api/${entityPlural}`),
  )

  // 9. Generate top-level files
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, "README.md"), generateReadme(spec, entityPlural))
  writeFileSync(
    join(outDir, "IMPLEMENTATION_GUIDE.md"),
    generateImplementationGuide(spec, patterns, vocabMap),
  )
  writeFileSync(join(outDir, "engagement-spec.json"), JSON.stringify(spec, null, 2))
  writeFileSync(join(outDir, "sentry-dashboard.json"), generateDashboardJson(spec))

  // 10. Generate SENTRY.md sidecar for the route file
  const sentryMdPath = join(
    refAppDir,
    "backend",
    "src",
    "routes",
    `${entityPlural}.SENTRY.md`,
  )
  writeFileSync(
    sentryMdPath,
    generateSentryMd(
      parentNode.pattern,
      parentNode.children.map((c) => c.pattern),
      parentVocab,
    ),
  )
}
