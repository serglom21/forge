'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

// SENTRY: This global error boundary captures React rendering errors
// in the App Router. When a component throws during render, this page
// shows instead and reports the error to Sentry.
//
// In your codebase: create this file at app/global-error.tsx. It's
// the App Router equivalent of the old _error.tsx page.

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: 'system-ui', padding: '40px', textAlign: 'center' }}>
        <h1>Something went wrong</h1>
        <p style={{ color: '#666' }}>This error has been reported to Sentry.</p>
      </body>
    </html>
  );
}
