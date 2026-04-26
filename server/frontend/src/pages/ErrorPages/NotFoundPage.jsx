import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import '../../design-system/tokens.css';

const NotFoundPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          {/* Animated SVG Illustration */}
          <div style={{ marginBottom: 'var(--space-8)', position: 'relative' }}>
            <svg width="240" height="120" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto' }}>
              <path d="M20 100 H220" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" />
              <rect x="60" y="60" width="80" height="40" rx="8" fill="var(--color-bg-elevated)" stroke="var(--color-primary)" strokeWidth="2" className="car-body">
                <animateTransform attributeName="transform" type="translate" from="-200 0" to="300 0" dur="3s" repeatCount="indefinite" />
              </rect>
              <circle cx="80" cy="100" r="8" fill="var(--color-text)" className="wheel">
                <animateTransform attributeName="transform" type="translate" from="-200 0" to="300 0" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="120" cy="100" r="8" fill="var(--color-text)" className="wheel">
                <animateTransform attributeName="transform" type="translate" from="-200 0" to="300 0" dur="3s" repeatCount="indefinite" />
              </circle>
              <path d="M180 100 L210 70" stroke="var(--color-negative)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <h1 style={{ fontSize: 'var(--font-size-5xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-4)', color: 'var(--color-text)' }}>
            404
          </h1>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)' }}>
            Road End. Page Not Found.
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)', lineHeight: '1.6' }}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">Go to Home</Link>
            <Link to="/dealers" className="btn btn-ghost">Browse Dealers</Link>
          </div>

          <div style={{ marginTop: 'var(--space-12)', padding: 'var(--space-6)', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>
              Quick Search
            </p>
            <input
              type="text"
              placeholder="Search for a dealer..."
              className="input"
              style={{ width: '100%' }}
              onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = `/dealers?q=${e.target.value}`; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
