import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sentry Reference App',
  description: 'A reference application demonstrating Sentry instrumentation patterns',
};

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  height: '48px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
} as const;

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
} as const;

const dotStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#6366f1',
} as const;

const linkStyle = {
  fontSize: '13px',
  color: '#4b5563',
  textDecoration: 'none',
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f8f9fa',
        color: '#111827',
      }}>
        <nav style={navStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={logoStyle}>
              <div style={dotStyle} />
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                Sentry Reference App
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="/items" style={linkStyle}>Items</a>
              <a href="/items/new" style={linkStyle}>New item</a>
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            color: '#9ca3af',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          }}>
            sentry instrumented
          </span>
        </nav>
        <main style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
