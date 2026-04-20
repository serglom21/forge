import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sentry Reference App',
  description: 'A reference application demonstrating Sentry instrumentation patterns',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#fafafa', color: '#1a1a1a' }}>
        <nav style={{ padding: '12px 24px', borderBottom: '1px solid #e5e5e5', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="/" style={{ fontWeight: 700, fontSize: '16px', textDecoration: 'none', color: '#1a1a1a' }}>
            Sentry Reference App
          </a>
          <a href="/items" style={{ fontSize: '14px', textDecoration: 'none', color: '#666' }}>Items</a>
          <a href="/items/new" style={{ fontSize: '14px', textDecoration: 'none', color: '#666' }}>New Item</a>
        </nav>
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
