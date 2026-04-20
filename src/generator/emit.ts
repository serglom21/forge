export interface AttrEntry {
  key: string
  valueExpr: string  // JS expression: quoted string like "'stripe'" or code like "req.body.amount"
}

export interface SdkAutoRequirement {
  integration: string
  package: string
}

/**
 * Emits a Sentry.startSpan() wrapper that replaces the FORGE:PARENT_SPAN marker.
 * The bodyLines go inside the async callback, already containing resolved SDK_ENHANCED lines.
 */
export function emitParentSpan(
  spanName: string,
  spanOp: string,
  attributes: Record<string, string>,
  bodyLines: string[],
  indent = "    ",
): string {
  const i = indent         // e.g. "    " — level of return statement
  const ii = `${i}  `     // "      " — level of { }, async (span) => {
  const iii = `${ii}  `   // "        " — level of config keys and callback body

  const attrEntries = Object.entries(attributes)
  let attrsStr: string
  if (attrEntries.length === 0) {
    attrsStr = "{}"
  } else {
    const pairs = attrEntries.map(([k, v]) => `${iii}  '${k}': ${v}`).join(",\n")
    attrsStr = `{\n${pairs},\n${iii}}`
  }

  const bodyStr = bodyLines.length > 0 ? "\n" + bodyLines.join("\n") + "\n" + ii : ""

  return [
    `${i}// SENTRY: Start a custom span for the ${spanName} business operation.`,
    `${i}// This span wraps the full pipeline and provides parent context for`,
    `${i}// all SDK-auto-captured child spans (DB queries, HTTP calls).`,
    `${i}return await Sentry.startSpan(`,
    `${ii}{`,
    `${iii}name: '${spanName}',`,
    `${iii}op: '${spanOp}',`,
    `${iii}attributes: ${attrsStr},`,
    `${ii}},`,
    `${ii}async (span) => {${bodyStr}}`,
    `${i});`,
  ].join("\n")
}

/**
 * Emits Sentry.getActiveSpan()?.setAttributes({...}) for sdk_enhanced spans.
 * Returns empty string when attrs is empty (no child pattern for this injection point).
 */
export function emitSdkEnhancedAttrs(
  attrs: AttrEntry[],
  indent = "      ",
): string {
  if (attrs.length === 0) return ""

  const i = indent
  const pairs = attrs.map((a) => `${i}  '${a.key}': ${a.valueExpr}`).join(",\n")

  return [
    `${i}// SENTRY: Inject business attributes on the active SDK-auto span.`,
    `${i}// The SDK captures this span automatically; we enrich it with domain context.`,
    `${i}Sentry.getActiveSpan()?.setAttributes({`,
    pairs + ",",
    `${i}});`,
  ].join("\n")
}

/**
 * Emits integration entries for FORGE:SENTRY_INIT_INTEGRATIONS.
 * Returns empty string when no sdk_auto integrations are needed.
 */
export function emitSdkAutoIntegrations(
  requirements: SdkAutoRequirement[],
  indent = "  ",
): string {
  if (requirements.length === 0) return ""

  const i = indent
  const entries = requirements.map((r) => `${i}  ${r.integration}(),`).join("\n")

  return [
    `${i}// SENTRY: Integrations required by selected patterns.`,
    `${i}integrations: [`,
    entries,
    `${i}],`,
  ].join("\n")
}
