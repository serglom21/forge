export const VERTICAL_VALUES = [
  "ecommerce",
  "fintech",
  "healthcare",
  "saas",
  "media",
  "manufacturing",
  "logistics",
] as const

export const STACK_VALUES = [
  "nextjs-express",
  "fastapi",
  "flask",
  "react-native-express",
] as const

export const SENTRY_OP_VALUES = [
  "function",
  "http.client",
  "http.server",
  "db.query",
  "cache.get",
  "cache.set",
  "ui.render",
  "task",
  "ui.webvital",
  "pageload",
  "navigation",
] as const

// Ops that the SDK auto-captures — source: manual is forbidden for these
export const SDK_OWNED_OPS = ["db.query", "http.client", "http.server"] as const
