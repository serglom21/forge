import { z } from "zod"
import { SDK_OWNED_OPS, SENTRY_OP_VALUES, STACK_VALUES, VERTICAL_VALUES } from "./types"

export const SentryOpEnum = z.enum(SENTRY_OP_VALUES)

// Vocabulary tokens: either required:true OR a default value, never both.
// .strict() enforces mutual exclusivity by rejecting unknown keys on each branch.
const RequiredVocabToken = z
  .object({ required: z.literal(true), description: z.string() })
  .strict()
const DefaultVocabToken = z
  .object({ default: z.string(), description: z.string().optional() })
  .strict()
export const VocabTokenSchema = z.union([RequiredVocabToken, DefaultVocabToken])

// Span-level schemas, discriminated by source
const SpanAttribute = z.object({
  key: z.string(),
  type: z.string(),
  source: z.string(),
})

const AttributeToInject = z.object({
  key: z.string(),
  source: z.string(),
  injection_point: z.string(),
})

const ManualSpan = z.object({
  id: z.string(),
  source: z.literal("manual"),
  op: SentryOpEnum,
  role: z.string().optional(),
  description: z.string().optional(),
  attributes: z.array(SpanAttribute),
})

const SdkEnhancedSpan = z.object({
  id: z.string(),
  source: z.literal("sdk_enhanced"),
  op: SentryOpEnum,
  expected_attributes: z.array(z.string()).optional(),
  attributes_to_inject: z.array(AttributeToInject),
})

const SdkAutoSpan = z.object({
  id: z.string(),
  source: z.literal("sdk_auto"),
  op: SentryOpEnum,
  expected_attributes: z.array(z.string()),
})

const DerivedSpan = z.object({
  id: z.string(),
  source: z.literal("derived"),
  op: SentryOpEnum,
})

export const SpanSchema = z.discriminatedUnion("source", [
  ManualSpan,
  SdkEnhancedSpan,
  SdkAutoSpan,
  DerivedSpan,
])

const SurfaceSchema = z.object({
  pages: z
    .array(z.object({ id: z.string(), route: z.string(), kind: z.string() }))
    .optional()
    .default([]),
  routes: z
    .array(
      z.object({ method: z.string(), path: z.string(), handler: z.string() }),
    )
    .optional()
    .default([]),
})

const SdkRequirement = z.object({
  integration: z.string(),
  package: z.string(),
  reason: z.string().optional(),
  config: z.record(z.unknown()).optional(),
})

const ReferenceGuidance = z.object({
  in_your_codebase: z.string(),
  what_to_keep: z.string().optional(),
  what_to_adapt: z.string().optional(),
})

// Extract simple {token} references (excludes {parent.foo} cross-pattern refs)
function extractTokenRefs(str: string): string[] {
  return [...str.matchAll(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g)].map((m) => m[1])
}

function spanTokenRefs(span: z.infer<typeof SpanSchema>): string[] {
  const tokens: string[] = []
  tokens.push(...extractTokenRefs(span.id))
  if (span.source === "manual") {
    if (span.description) {
      tokens.push(...extractTokenRefs(span.description))
    }
    for (const attr of span.attributes) {
      tokens.push(...extractTokenRefs(attr.key))
      tokens.push(...extractTokenRefs(attr.source))
    }
  }
  if (span.source === "sdk_enhanced") {
    for (const attr of span.attributes_to_inject) {
      tokens.push(...extractTokenRefs(attr.key))
      tokens.push(...extractTokenRefs(attr.source))
    }
  }
  return tokens
}

export const PatternSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9_]*$/, "Pattern id must be lowercase, underscore-separated"),
    title: z.string(),
    maturity: z.string().optional(),
    verticals: z.array(z.union([z.enum(VERTICAL_VALUES), z.literal("any")])),
    stacks: z.array(z.enum(STACK_VALUES)),
    layer: z.string().optional(),
    vocabulary: z.record(VocabTokenSchema).optional().default({}),
    surface: SurfaceSchema.optional(),
    provides: z.object({ parent_span: z.string().optional() }).optional(),
    composes_with: z.array(z.string()).optional(),
    requires_parent: z.boolean().optional().default(false),
    spans: z.array(SpanSchema),
    sdk_requirements: z.array(SdkRequirement).default([]),
    sdk_min_version: z.record(z.string()).default({}),
    reference_guidance: ReferenceGuidance.optional(),
  })
  .superRefine((pattern, ctx) => {
    // No-double-instrumentation: source:manual must not use SDK-owned ops
    for (const span of pattern.spans) {
      if (
        span.source === "manual" &&
        (SDK_OWNED_OPS as readonly string[]).includes(span.op)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["spans"],
          message: `source: manual cannot be used with SDK-owned op "${span.op}" (no-double-instrumentation rule)`,
        })
      }
    }

    // Token reference check: every {token} must be declared in vocabulary
    const declared = new Set(Object.keys(pattern.vocabulary ?? {}))
    const refs: string[] = []

    for (const span of pattern.spans) {
      refs.push(...spanTokenRefs(span))
    }
    for (const page of pattern.surface?.pages ?? []) {
      refs.push(...extractTokenRefs(page.route))
    }
    for (const route of pattern.surface?.routes ?? []) {
      refs.push(...extractTokenRefs(route.path))
      refs.push(...extractTokenRefs(route.handler))
    }
    if (pattern.provides?.parent_span) {
      refs.push(...extractTokenRefs(pattern.provides.parent_span))
    }

    for (const token of refs) {
      if (!declared.has(token)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["vocabulary"],
          message: `Token "{${token}}" is referenced but not declared in vocabulary`,
        })
      }
    }
  })

export type Pattern = z.infer<typeof PatternSchema>
