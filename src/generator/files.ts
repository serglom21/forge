import type { Pattern, EngagementSpec } from "../schema/index"
import type { ResolvedVocab } from "./vocabulary"
import { resolveString } from "./vocabulary"

export function generateReadme(spec: EngagementSpec, entityPlural: string): string {
  return `# ${spec.customer} — Sentry Reference App

Generated from engagement spec \`${spec.id}\`.

## What this app demonstrates

A Next.js + Express reference application instrumented with Sentry,
showing how to capture \`${entityPlural}\` flows with custom business spans,
enriched DB queries, and enriched outbound HTTP spans.

## Running the app

\`\`\`bash
# 1. Install dependencies
cd reference-app
pnpm install

# 2. Configure Sentry
cp .env.example .env
# Edit .env and set SENTRY_DSN to your project DSN

# 3. Start frontend + backend
pnpm dev
\`\`\`

Frontend: http://localhost:3000
Backend:  http://localhost:3001

## What to look for in Sentry

After submitting a \`${entityPlural}\` item in the UI, open Sentry Performance
and find the \`${entityPlural}\` trace. You should see:
- A custom parent span for the business operation
- SDK-auto-captured DB and HTTP child spans enriched with business attributes

## Files with Sentry instrumentation

Every instrumented file has a sibling \`.SENTRY.md\` explaining the patterns applied.
`
}

export function generateImplementationGuide(
  spec: EngagementSpec,
  patterns: Pattern[],
  vocabMap: Record<string, ResolvedVocab>,
): string {
  const patternSections = patterns
    .map((p) => {
      const vocab = vocabMap[p.id] ?? {}
      const guidance = p.reference_guidance
        ? `\n${p.reference_guidance.in_your_codebase.trimEnd()}\n`
        : ""
      return `## ${p.title}\n\n**Pattern id:** \`${p.id}\`\n${guidance}`
    })
    .join("\n---\n\n")

  return `# Implementation Guide — ${spec.customer}

This guide explains how each Sentry instrumentation pattern is applied
in this reference app and how to map it to your own codebase.

**Stack:** ${spec.stack}
**Patterns applied:** ${patterns.map((p) => p.id).join(", ")}

---

${patternSections}
`
}

export function generateSentryMd(
  parentPattern: Pattern,
  childPatterns: Pattern[],
  parentVocab: ResolvedVocab,
): string {
  const spanName = resolveString(
    parentPattern.provides?.parent_span ?? parentPattern.spans[0]?.id ?? parentPattern.id,
    parentVocab,
  )

  const childSection =
    childPatterns.length > 0
      ? `\n## Child patterns applied\n\n${childPatterns.map((c) => `- **${c.title}** (\`${c.id}\`)`).join("\n")}\n`
      : ""

  return `# Sentry Instrumentation — ${parentPattern.title}

**Pattern:** \`${parentPattern.id}\`
**Span name:** \`${spanName}\`

## What this file does

${parentPattern.reference_guidance?.in_your_codebase.trimEnd() ?? "See pattern documentation."}
${childSection}
## How to read the traces

Open Sentry Performance and search for span name \`${spanName}\`.
Each request through this handler produces one parent span with any
SDK-auto-captured child spans nested underneath.
`
}

export function generateDashboardJson(spec: EngagementSpec): string {
  return JSON.stringify(
    {
      specId: spec.id,
      customer: spec.customer,
      generatedAt: new Date().toISOString(),
      widgets: [],
    },
    null,
    2,
  )
}
