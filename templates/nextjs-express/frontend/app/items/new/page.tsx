'use client';

import { useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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
        setResult({ success: true, message: `Created "${item.name}" (${item.id})` });
        setName('');
        setDescription('');
      } else {
        const err = await res.json();
        setResult({ success: false, message: err.error || 'Failed to create item' });
      }
    } catch (err) {
      setResult({ success: false, message: 'Network error — is the backend running?' });
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const,
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ maxWidth: '520px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
          Create New Item
        </h1>
        <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
          Submitting this form triggers the backend pipeline: validation → external
          service call → database write. Check Sentry for the resulting trace.
        </p>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#111827',
              marginBottom: '6px',
            }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter item name"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#111827',
              marginBottom: '6px',
            }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter item description"
              required
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 20px',
              backgroundColor: submitting ? '#e5e7eb' : '#6366f1',
              color: submitting ? '#9ca3af' : '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: submitting ? 'not-allowed' : 'pointer',
              width: 'fit-content',
              fontFamily: 'inherit',
            }}
          >
            {submitting ? 'Creating...' : 'Create Item'}
          </button>
        </form>
      </div>

      {result && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: result.success ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${result.success ? '#d1fae5' : '#fee2e2'}`,
          color: result.success ? '#059669' : '#dc2626',
          fontSize: '14px',
        }}>
          {result.message}
          {result.success && (
            <span> — <a href="/items" style={{ color: 'inherit', textDecoration: 'underline' }}>view all items</a></span>
          )}
        </div>
      )}
    </div>
  );
}
