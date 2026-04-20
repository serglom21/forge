// SENTRY: Next.js instrumentation file. This registers the server-side
// and edge Sentry configs before the server handles any requests.
// Required by @sentry/nextjs v10 for proper server-side tracing.

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime — using the same config for simplicity in the demo.
    // In production you'd have a separate sentry.edge.config.ts.
    await import('./sentry.server.config');
  }
}

// SENTRY: Captures errors from Server Components, middleware, and proxies.
// This hook requires @sentry/nextjs >= 8.28.0 and Next.js 15+.
// For Next.js 14, this export is silently ignored (no harm).
export const onRequestError = Sentry.captureRequestError;
