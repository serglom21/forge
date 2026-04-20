import { z } from "zod"
import { STACK_VALUES, VERTICAL_VALUES } from "./types"

export const EngagementSpecSchema = z
  .object({
    id: z.string(),
    customer: z.string().min(1, "customer must be non-empty"),
    vertical: z.enum(VERTICAL_VALUES),
    stack: z.enum(STACK_VALUES),
    patternIds: z.array(z.string()).min(1, "patternIds must be non-empty"),
    sentry: z.object({
      dsn: z.string(),
      projectSlug: z.string().optional(),
      org: z.string().optional(),
      dashboardId: z.string().optional(),
    }),
    vocabulary: z.record(z.record(z.string())).optional().default({}),
  })
  .superRefine((spec, ctx) => {
    const patternIdSet = new Set(spec.patternIds)
    for (const vocabPatternId of Object.keys(spec.vocabulary)) {
      if (!patternIdSet.has(vocabPatternId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["vocabulary", vocabPatternId],
          message: `Vocabulary references pattern "${vocabPatternId}" which is not in patternIds`,
        })
      }
    }
  })

export type EngagementSpec = z.infer<typeof EngagementSpecSchema>
