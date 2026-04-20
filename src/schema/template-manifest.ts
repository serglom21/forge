import { z } from "zod"
import { STACK_VALUES } from "./types"

export const ServiceDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_-]*$/, "Service id must be lowercase"),
  kind: z.enum(["frontend", "backend", "worker"]),
  port: z.number().int().positive().nullable(),
  health: z.string().nullable(),
})

export type ServiceDefinition = z.infer<typeof ServiceDefinitionSchema>

export const TemplateManifestSchema = z.object({
  stack: z.enum(STACK_VALUES),
  version: z.string(),
  services: z.array(ServiceDefinitionSchema).min(1, "At least one service is required"),
})

export type TemplateManifest = z.infer<typeof TemplateManifestSchema>
