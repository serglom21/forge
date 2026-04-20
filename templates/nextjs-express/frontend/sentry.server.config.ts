// SENTRY: Server-side SDK initialization.
// This file runs in Node.js when the Next.js server handles a request.

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
