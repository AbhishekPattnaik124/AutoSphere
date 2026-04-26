import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import '../../design-system/tokens.css';

const SharePage = () => {
  const { type, id } = useParams();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />
      <div style={{ padding: 'var(--space-16) var(--space-6)', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: 'var(--font-size-5xl)', marginBottom: 'var(--space-6)' }}>🔗</div>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-4)' }}>
          Share this {type}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
          Copy the link below to share this {type} with your friends or colleagues.
        </p>

        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-12)' }}>
          <input
            type="text"
            readOnly
            value={`${window.location.origin}/${type}/${id}`}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--color-text)', outline: 'none', fontSize: 'var(--font-size-sm)' }}
          />
          <button
            className="btn btn-primary"
            style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-xs)' }}
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/${type}/${id}`);
              alert('Link copied to clipboard!');
            }}
          >
            Copy Link
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <button className="btn btn-ghost" style={{ width: '100%' }}>Email Link</button>
          <button className="btn btn-ghost" style={{ width: '100%' }}>WhatsApp</button>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
