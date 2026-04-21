'use client';

import { useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  boxSizing: 'border-box' as const,
  outline: 'none',
  color: '#111827',
  backgroundColor: '#ffffff',
};

export default function NewItemPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        const item = await res.json();
        setResult({ success: true, message: `Created "${item.name}"` });
        setName('');
        setDescription('');
      } else {
        const err = await res.json();
        setResult({ success: false, message: err.error || 'Failed to create item' });
      }
    } catch {
      setResult({ success: false, message: 'Network error — is the backend running?' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '6px' }}>Create new item</h1>
      <p style={{ color: '#4b5563', fontSize: '13px', marginBottom: '24px', maxWidth: '520px', lineHeight: 1.5 }}>
        Submitting this form triggers the backend pipeline — validation, external
        service call, database write. Check Sentry for the resulting trace.
      </p>

      {/* Form card */}
      <div style={{
        backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
        padding: '24px', maxWidth: '520px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px', color: '#111827' }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Wire to Globex Corp"
              required
              style={inputStyle}
            />
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
              A short identifier for this item
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px', color: '#111827' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this item for?"
              required
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
              A longer description of the item's purpose
            </p>
          </div>

          <div style={{ paddingTop: '4px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 18px',
                backgroundColor: submitting ? '#e5e7eb' : '#6366f1',
                color: submitting ? '#9ca3af' : '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {submitting ? 'Creating...' : 'Create item'}
            </button>
          </div>
        </form>

        {result && (
          <div style={{
            marginTop: '16px', padding: '10px 14px', borderRadius: '6px',
            backgroundColor: result.success ? '#ecfdf5' : '#fef2f2',
            color: result.success ? '#059669' : '#dc2626',
            fontSize: '13px', lineHeight: 1.5,
          }}>
            {result.message}
            {result.success && (
              <span> — <a href="/items" style={{ color: 'inherit', textDecoration: 'underline' }}>view all items</a></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
