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

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  completed: { bg: '#ecfdf5', color: '#059669' },
  processing: { bg: '#fffbeb', color: '#d97706' },
  pending: { bg: '#f1f3f5', color: '#4b5563' },
  failed: { bg: '#fef2f2', color: '#dc2626' },
};

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
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Items</h1>
        </div>
        <div style={{ display: 'grid', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '80px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb',
              borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  const counts = {
    total: items.length,
    completed: items.filter(i => i.status === 'completed').length,
    processing: items.filter(i => i.status === 'processing').length,
    pending: items.filter(i => i.status === 'pending').length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Items</h1>
        <a
          href="/items/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '7px 14px', backgroundColor: '#6366f1', color: '#ffffff',
            borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 500,
          }}
        >
          + New item
        </a>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{counts.total} total</span>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>·</span>
        <span style={{ fontSize: '12px', color: '#059669' }}>{counts.completed} completed</span>
        {counts.processing > 0 && <>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>·</span>
          <span style={{ fontSize: '12px', color: '#d97706' }}>{counts.processing} processing</span>
        </>}
        {counts.pending > 0 && <>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>·</span>
          <span style={{ fontSize: '12px', color: '#4b5563' }}>{counts.pending} pending</span>
        </>}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 20px', color: '#4b5563', fontSize: '14px',
        }}>
          <p style={{ marginBottom: '16px' }}>No items yet.</p>
          <a
            href="/items/new"
            style={{
              padding: '8px 16px', backgroundColor: '#6366f1', color: '#ffffff',
              borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 500,
            }}
          >
            Create your first item
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '6px' }}>
          {items.map(item => {
            const sc = statusColors[item.status] || statusColors.pending;
            return (
              <a
                key={item.id}
                href={`/items/${item.id}`}
                style={{
                  display: 'block', padding: '14px 18px', backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb', borderRadius: '8px',
                  textDecoration: 'none', color: '#111827',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title + badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>{item.name}</span>
                      <span style={{
                        fontSize: '11px', padding: '1px 8px', borderRadius: '9999px',
                        backgroundColor: sc.bg, color: sc.color, fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}>
                        {item.status}
                      </span>
                    </div>
                    {/* Description */}
                    <p style={{
                      margin: '0 0 8px', fontSize: '13px', color: '#4b5563',
                      lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.description}
                    </p>
                    {/* Meta row */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '11px', fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        color: '#9ca3af',
                      }}>
                        {item.id}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: '13px', marginLeft: '12px', marginTop: '2px' }}>→</span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
