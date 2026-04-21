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
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f8f9fa',
        color: '#111827',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{ textAlign: 'center', padding: '32px 24px', maxWidth: '480px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6, margin: '0 0 24px' }}>
            An unexpected error occurred. This error has been reported to Sentry.
          </p>
          {error.digest && (
            <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '13px', color: '#9ca3af', margin: 0 }}>
              {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
