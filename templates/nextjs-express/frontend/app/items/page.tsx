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
    return <p style={{ color: '#666' }}>Loading items...</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Items</h1>
        <a
          href="/items/new"
          style={{
            padding: '8px 16px', backgroundColor: '#362d59', color: '#fff',
            borderRadius: '6px', textDecoration: 'none', fontSize: '14px',
          }}
        >
          + New Item
        </a>
      </div>

      {items.length === 0 ? (
        <p style={{ color: '#666' }}>No items yet. Create one to see traces in Sentry.</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {items.map(item => (
            <a
              key={item.id}
              href={`/items/${item.id}`}
              style={{
                display: 'block', padding: '16px', backgroundColor: '#fff',
                border: '1px solid #e5e5e5', borderRadius: '8px',
                textDecoration: 'none', color: '#1a1a1a',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{item.name}</strong>
                <span style={{
                  fontSize: '12px', padding: '2px 8px', borderRadius: '4px',
                  backgroundColor: item.status === 'completed' ? '#e6f4ea' : '#fef7e0',
                  color: item.status === 'completed' ? '#137333' : '#b05a00',
                }}>
                  {item.status}
                </span>
              </div>
              <p style={{ margin: '6px 0 0', color: '#666', fontSize: '14px' }}>{item.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
