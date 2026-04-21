'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

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
      <body style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', margin: 0, backgroundColor: '#f8f9fa',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', fontSize: '20px',
            color: '#dc2626',
          }}>
            !
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5, marginBottom: '20px' }}>
            This error has been reported to Sentry automatically.
          </p>
          <a
            href="/"
            style={{
              padding: '8px 16px', backgroundColor: '#6366f1', color: '#ffffff',
              borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 500,
            }}
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
