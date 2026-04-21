export default function Home() {
  return (
    <div style={{ maxWidth: '640px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
        Sentry Instrumentation Reference
      </h1>
      <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.6, margin: '0 0 32px' }}>
        This application demonstrates how to instrument a Next.js + Express stack
        with Sentry. Browse the code to see the patterns, then map them to your
        own codebase.
      </p>

      <div style={{ display: 'grid', gap: '12px' }}>
        <a
          href="/items"
          style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#111827',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>
            Browse Items
          </div>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', lineHeight: 1.6 }}>
            View the list of items. Demonstrates SDK auto-instrumented HTTP spans
            on the frontend fetch and backend route handler.
          </p>
        </a>

        <a
          href="/items/new"
          style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#111827',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>
            Create an Item
          </div>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', lineHeight: 1.6 }}>
            Submit a form that triggers the full backend pipeline: validation,
            external service call, and database write — all instrumented with Sentry.
          </p>
        </a>
      </div>
    </div>
  );
}
