// SENTRY: This file MUST be imported before any other module.
// @sentry/node v10 uses OpenTelemetry under the hood and needs to
// patch modules (http, express, pg, etc.) before they're loaded.
// If you import express before this file, auto-instrumentation won't work.

import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // SENTRY: Sample 100% of traces for demo visibility.
  // In production, lower this based on your traffic volume.
  tracesSampleRate: 1.0,

  environment: process.env.NODE_ENV || 'development',

  // FORGE:SENTRY_INIT_INTEGRATIONS
});
