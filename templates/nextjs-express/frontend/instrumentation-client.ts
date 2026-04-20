// SENTRY: Client-side SDK initialization.
// This file runs in the browser when a user loads a page.
// @sentry/nextjs v10 expects this file at the project root.

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // SENTRY: Sample 100% of traces for demo visibility.
  tracesSampleRate: 1.0,

  // SENTRY: tracePropagationTargets ensures the browser sends the
  // sentry-trace header to the backend, creating a single distributed
  // trace from frontend click → backend handler → DB/HTTP.
  tracePropagationTargets: ['localhost', /^\//],
});
