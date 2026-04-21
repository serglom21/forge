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

const statusColors: Record<string, { bg: string; color: string }> = {
  completed: { bg: '#ecfdf5', color: '#059669' },
  processing: { bg: '#fffbeb', color: '#d97706' },
  pending: { bg: '#f1f3f5', color: '#4b5563' },
  failed: { bg: '#fef2f2', color: '#dc2626' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
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

  if (loading) {
    return (
      <div>
        <a href="/items" style={{ fontSize: '13px', color: '#4b5563', textDecoration: 'none' }}>← Items</a>
        <div style={{
          marginTop: '16px', height: '200px', backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb', borderRadius: '8px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        <a href="/items" style={{ fontSize: '13px', color: '#4b5563', textDecoration: 'none' }}>← Items</a>
        <div style={{ textAlign: 'center', padding: '48px', color: '#4b5563', fontSize: '14px' }}>
          Item not found.
        </div>
      </div>
    );
  }

  if (!item) return null;

  const sc = statusColors[item.status] || statusColors.pending;

  return (
    <div>
      <a href="/items" style={{ fontSize: '13px', color: '#4b5563', textDecoration: 'none' }}>← Items</a>

      <div style={{
        marginTop: '16px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb',
        borderRadius: '8px', overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{item.name}</h1>
                <span style={{
                  fontSize: '11px', padding: '1px 8px', borderRadius: '9999px',
                  backgroundColor: sc.bg, color: sc.color, fontWeight: 500,
                }}>
                  {item.status}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #e5e7eb' }} />

        {/* Metadata grid */}
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px' }}>
          <div>
            <div style={{
              fontSize: '11px', color: '#9ca3af', marginBottom: '2px',
              textTransform: 'uppercase' as const, letterSpacing: '0.5px',
            }}>
              Item ID
            </div>
            <div style={{ fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, monospace', color: '#4b5563' }}>
              {item.id}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '11px', color: '#9ca3af', marginBottom: '2px',
              textTransform: 'uppercase' as const, letterSpacing: '0.5px',
            }}>
              Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc.color,
              }} />
              {item.status}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '11px', color: '#9ca3af', marginBottom: '2px',
              textTransform: 'uppercase' as const, letterSpacing: '0.5px',
            }}>
              Created
            </div>
            <div style={{ fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, monospace', color: '#4b5563' }}>
              {formatDate(item.createdAt)}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '11px', color: '#9ca3af', marginBottom: '2px',
              textTransform: 'uppercase' as const, letterSpacing: '0.5px',
            }}>
              Last updated
            </div>
            <div style={{ fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, monospace', color: '#4b5563' }}>
              {formatDate(item.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
