'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Item {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function ItemDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/items/${params.id}`)
      .then(res => {
        if (res.status === 404) { setNotFound(true); setLoading(false); return null; }
        return res.json();
      })
      .then(data => { if (data) { setItem(data); } setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p style={{ color: '#666' }}>Loading...</p>;
  if (notFound) return <p style={{ color: '#c5221f' }}>Item not found.</p>;
  if (!item) return <p style={{ color: '#c5221f' }}>Failed to load item.</p>;

  return (
    <div>
      <a href="/items" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>← Back to items</a>

      <div style={{ marginTop: '16px', padding: '24px', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{item.name}</h1>
          <span style={{
            fontSize: '12px', padding: '2px 8px', borderRadius: '4px',
            backgroundColor: item.status === 'completed' ? '#e6f4ea' : '#fef7e0',
            color: item.status === 'completed' ? '#137333' : '#b05a00',
          }}>
            {item.status}
          </span>
        </div>

        <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6 }}>{item.description}</p>

        <div style={{ marginTop: '16px', fontSize: '13px', color: '#999' }}>
          <span>ID: {item.id}</span>
          <span style={{ marginLeft: '16px' }}>Created: {new Date(item.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
