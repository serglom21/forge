// Utility functions to simulate real-world behavior in the demo.
// These make the traces interesting in Sentry — variable latency,
// occasional failures, simulated external calls.

/**
 * Simulate variable latency (e.g. a slow external service).
 */
export function simulateLatency(minMs: number, maxMs: number): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulate an external HTTP call. Uses fetch against a public
 * echo endpoint or falls back to a local delay. The SDK's
 * httpIntegration will auto-capture this as an http.client span.
 */
export async function simulateExternalCall(purpose: string): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();

  // Simulate by fetching our own health endpoint — the SDK will
  // auto-capture this as an outbound HTTP span. In the generated
  // app, the generator may replace this with a more realistic
  // external URL.
  try {
    await fetch('http://localhost:3001/api/health');
  } catch {
    // Ignore fetch failures in demo — we just want the span
  }

  // Add additional simulated latency to make the span visible
  await simulateLatency(50, 300);

  return { ok: true, latencyMs: Date.now() - start };
}

/**
 * Simulate a database write. Just a delay, but the comment markers
 * around it tell the generator where to inject SDK-enhanced
 * attribute calls.
 */
export async function simulateDbWrite(data: Record<string, unknown>): Promise<string> {
  await simulateLatency(10, 80);
  return `row_${Date.now()}`;
}
