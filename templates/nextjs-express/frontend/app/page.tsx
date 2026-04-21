'use client';

import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface Stats {
  total: number;
  completed: number;
  processing: number;
  pending: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/items`)
      .then(res => res.json())
      .then((items: Array<{ status: string }>) => {
        setStats({
          total: items.length,
          completed: items.filter(i => i.status === 'completed').length,
          processing: items.filter(i => i.status === 'processing').length,
          pending: items.filter(i => i.status === 'pending').length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '6px' }}>
        Sentry instrumentation reference
      </h1>
      <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px', maxWidth: '640px' }}>
        This application demonstrates how to instrument a Next.js + Express stack with
        Sentry. Browse the code to see the patterns, then map them to your own codebase.
      </p>

      {stats && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{stats.total} items</span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>·</span>
          <span style={{ fontSize: '12px', color: '#059669' }}>{stats.completed} completed</span>
          {stats.processing > 0 && <>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>·</span>
            <span style={{ fontSize: '12px', color: '#d97706' }}>{stats.processing} processing</span>
          </>}
          {stats.pending > 0 && <>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>·</span>
            <span style={{ fontSize: '12px', color: '#4b5563' }}>{stats.pending} pending</span>
          </>}
        </div>
      )}

      <div style={{ display: 'grid', gap: '10px' }}>
        <a
          href="/items"
          style={{
            display: 'block', padding: '18px 20px', backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb', borderRadius: '8px',
            textDecoration: 'none', color: '#111827',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>Browse items</div>
              <div style={{ color: '#4b5563', fontSize: '13px', lineHeight: 1.5 }}>
                View the list with status, metadata, and timestamps. Demonstrates SDK
                auto-instrumented HTTP spans on frontend fetch and backend route handler.
              </div>
            </div>
            <span style={{ color: '#9ca3af', fontSize: '14px', marginLeft: '16px' }}>→</span>
          </div>
        </a>

        <a
          href="/items/new"
          style={{
            display: 'block', padding: '18px 20px', backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb', borderRadius: '8px',
            textDecoration: 'none', color: '#111827',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>Create an item</div>
              <div style={{ color: '#4b5563', fontSize: '13px', lineHeight: 1.5 }}>
                Submit a form that triggers the backend pipeline — validation, external
                service call, database write. Each step is a Sentry span with business attributes.
              </div>
            </div>
            <span style={{ color: '#9ca3af', fontSize: '14px', marginLeft: '16px' }}>→</span>
          </div>
        </a>
      </div>
    </div>
  );
}
