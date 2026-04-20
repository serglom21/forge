export default function Home() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
        Sentry Instrumentation Reference
      </h1>
      <p style={{ color: '#666', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>
        This application demonstrates how to instrument a Next.js + Express stack
        with Sentry. Browse the code to see the patterns, then map them to your
        own codebase.
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        <a
          href="/items"
          style={{
            display: 'block', padding: '20px', backgroundColor: '#fff',
            border: '1px solid #e5e5e5', borderRadius: '8px',
            textDecoration: 'none', color: '#1a1a1a',
          }}
        >
          <strong>Browse Items</strong>
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
            View the list of items. Demonstrates SDK auto-instrumented HTTP spans
            on the frontend fetch and backend route handler.
          </p>
        </a>

        <a
          href="/items/new"
          style={{
            display: 'block', padding: '20px', backgroundColor: '#fff',
            border: '1px solid #e5e5e5', borderRadius: '8px',
            textDecoration: 'none', color: '#1a1a1a',
          }}
        >
          <strong>Create an Item</strong>
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
            Submit a form that triggers the full backend pipeline: validation,
            external service call, and database write — all instrumented with Sentry.
          </p>
        </a>
      </div>
    </div>
  );
}
