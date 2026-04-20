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
    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' as const,
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Create New Item</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
        Submitting this form triggers the backend pipeline: validation → external
        service call → database write. Check Sentry for the resulting trace.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', maxWidth: '480px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
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
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter item description"
            required
            rows={3}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px 20px', backgroundColor: submitting ? '#9ca3af' : '#362d59',
            color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px',
            fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Creating...' : 'Create Item'}
        </button>
      </form>

      {result && (
        <div style={{
          marginTop: '16px', padding: '12px 16px', borderRadius: '6px',
          backgroundColor: result.success ? '#e6f4ea' : '#fce8e6',
          color: result.success ? '#137333' : '#c5221f',
          fontSize: '14px',
        }}>
          {result.message}
          {result.success && (
            <span> — <a href="/items" style={{ color: 'inherit' }}>view all items</a></span>
          )}
        </div>
      )}
    </div>
  );
}
