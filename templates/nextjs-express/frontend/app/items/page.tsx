'use client';

import { useEffect, useState } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const STATUS_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  completed: { backgroundColor: '#ecfdf5', color: '#059669' },
  active:    { backgroundColor: '#fffbeb', color: '#d97706' },
  pending:   { backgroundColor: '#fffbeb', color: '#d97706' },
  error:     { backgroundColor: '#fef2f2', color: '#dc2626' },
};

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_STYLES[status] ?? { backgroundColor: '#f1f3f5', color: '#4b5563' };
  return (
    <span style={{
      fontSize: '12px',
      fontWeight: 500,
      padding: '2px 8px',
      borderRadius: '9999px',
      ...colors,
    }}>
      {status}
    </span>
  );
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/items`)
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading items...</p>;
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: '#111827' }}>Items</h1>
        <a
          href="/items/new"
          style={{
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          New Item
        </a>
      </div>

      {items.length === 0 ? (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          color: '#9ca3af',
          fontSize: '14px',
        }}>
          No items yet. Create one to see traces in Sentry.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {items.map(item => (
            <a
              key={item.id}
              href={`/items/${item.id}`}
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#111827',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</span>
                <StatusBadge status={item.status} />
              </div>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', lineHeight: 1.6 }}>
                {item.description}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
