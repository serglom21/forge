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
      padding: '2px 10px',
      borderRadius: '9999px',
      ...colors,
    }}>
      {status}
    </span>
  );
}

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

  if (loading) return <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading...</p>;
  if (notFound) return <p style={{ color: '#dc2626', fontSize: '14px' }}>Item not found.</p>;
  if (!item) return <p style={{ color: '#dc2626', fontSize: '14px' }}>Failed to load item.</p>;

  return (
    <div style={{ maxWidth: '640px' }}>
      <a href="/items" style={{
        display: 'inline-block',
        fontSize: '14px',
        color: '#4b5563',
        textDecoration: 'none',
        marginBottom: '16px',
      }}>
        ← Back to Items
      </a>

      <div style={{
        padding: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: '#111827' }}>
            {item.name}
          </h1>
          <StatusBadge status={item.status} />
        </div>

        <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
          {item.description}
        </p>

        <div style={{
          display: 'flex',
          gap: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb',
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '2px' }}>Item ID</div>
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '13px', color: '#9ca3af' }}>
              {item.id}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '2px' }}>Created</div>
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '13px', color: '#9ca3af' }}>
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
