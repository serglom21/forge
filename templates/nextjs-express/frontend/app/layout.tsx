import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sentry Reference App',
  description: 'A reference application demonstrating Sentry instrumentation patterns',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f8f9fa',
        color: '#111827',
        fontSize: '14px',
        lineHeight: '1.6',
      }}>
        <nav style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          height: '56px',
          gap: '32px',
        }}>
          <a href="/" style={{
            fontWeight: 600,
            fontSize: '15px',
            textDecoration: 'none',
            color: '#111827',
            letterSpacing: '-0.01em',
            flexShrink: 0,
          }}>
            Sentry Ref App
          </a>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <a href="/items" style={{
              fontSize: '14px',
              textDecoration: 'none',
              color: '#4b5563',
              padding: '6px 10px',
              borderRadius: '6px',
            }}>
              Items
            </a>
            <a href="/items/new" style={{
              fontSize: '14px',
              textDecoration: 'none',
              color: '#4b5563',
              padding: '6px 10px',
              borderRadius: '6px',
            }}>
              New Item
            </a>
          </div>
        </nav>
        <main style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '32px 24px',
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
