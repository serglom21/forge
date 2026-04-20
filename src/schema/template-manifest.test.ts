import { describe, expect, it } from "vitest"
import { TemplateManifestSchema } from "./template-manifest"

describe("TemplateManifestSchema", () => {
  it("parses a manifest with frontend + backend services", () => {
    const input = {
      stack: "nextjs-express",
      version: "1.0.0",
      services: [
        { id: "frontend", kind: "frontend", port: 3000, health: "/health" },
        { id: "backend", kind: "backend", port: 3001, health: "/health" },
      ],
    }
    expect(() => TemplateManifestSchema.parse(input)).not.toThrow()
  })

  it("parses a manifest with a frontend-only service", () => {
    const input = {
      stack: "nextjs-express",
      version: "1.0.0",
      services: [
        { id: "frontend", kind: "frontend", port: 3000, health: "/health" },
      ],
    }
    expect(() => TemplateManifestSchema.parse(input)).not.toThrow()
  })

  it("parses a manifest with frontend + api (backend kind) + worker services", () => {
    const input = {
      stack: "nextjs-express",
      version: "1.0.0",
      services: [
        { id: "frontend", kind: "frontend", port: 3000, health: "/health" },
        { id: "api", kind: "backend", port: 4000, health: "/api/health" },
        { id: "worker", kind: "worker", port: null, health: null },
      ],
    }
    expect(() => TemplateManifestSchema.parse(input)).not.toThrow()
  })

  it("rejects a manifest with zero services", () => {
    const input = {
      stack: "nextjs-express",
      version: "1.0.0",
      services: [],
    }
    expect(() => TemplateManifestSchema.parse(input)).toThrow()
  })

  it("parses a worker service with port: null and health: null", () => {
    const input = {
      stack: "nextjs-express",
      version: "1.0.0",
      services: [
        { id: "worker", kind: "worker", port: null, health: null },
      ],
    }
    const result = TemplateManifestSchema.parse(input)
    expect(result.services[0].port).toBeNull()
    expect(result.services[0].health).toBeNull()
  })
})
