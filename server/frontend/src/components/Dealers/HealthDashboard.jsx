import React, { useState, useEffect, useCallback } from 'react';
import Header from '../Header/Header';
import '../../design-system/tokens.css';

const SERVICES = [
  { name: 'Django Hub',         key: 'django',    url: '/api/health/',        icon: '🐍' },
  { name: 'Dealer API',         key: 'dealer',    url: '/dealers-api/health', icon: '🏪' },
  { name: 'Inventory API',      key: 'inventory', url: '/cars-api/health',    icon: '🚗' },
  { name: 'Sentiment Analyzer', key: 'sentiment', url: '/sentiment-api/health', icon: '🤖' },
];

function StatusCard({ service, data, loading }) {
  const status = data?.status || (loading ? 'loading' : 'down');
  const statusColor = {
    healthy:  'var(--color-positive)',
    degraded: 'var(--color-neutral)',
    down:     'var(--color-negative)',
    loading:  'var(--color-text-subtle)',
  }[status] || 'var(--color-text-subtle)';

  return (
    <div className="glass-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '1.8rem' }}>{service.icon}</span>
          <div>
            <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>{service.name}</p>
            <p style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-xs)' }}>{service.url}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div className={`status-dot ${status === 'loading' ? '' : status}`}
            style={status === 'loading' ? { background: 'var(--color-text-subtle)' } : {}} />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: statusColor, textTransform: 'capitalize' }}>
            {loading ? 'Checking...' : status}
          </span>
        </div>
      </div>

      {/* Metrics */}
      {data && !loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          {data.uptime_seconds !== undefined && (
            <Metric label="Uptime" value={formatUptime(data.uptime_seconds)} />
          )}
          {data.version && (
            <Metric label="Version" value={`v${data.version}`} />
          )}
          {data.database?.connected !== undefined && (
            <Metric label="Database" value={data.database.connected ? '✓ Connected' : '✗ Down'} color={data.database.connected ? 'var(--color-positive)' : 'var(--color-negative)'} />
          )}
          {data.checks?.redis && (
            <Metric label="Redis" value={data.checks.redis.connected ? '✓ Connected' : '✗ Down'} color={data.checks.redis.connected ? 'var(--color-positive)' : 'var(--color-neutral)'} />
          )}
          {data.memory?.rss_mb && (
            <Metric label="Memory" value={`${data.memory.rss_mb} MB`} />
          )}
          {data.active_model && (
            <Metric label="Model" value={data.active_model} />
          )}
        </div>
      ) : loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : (
        <div style={{ padding: 'var(--space-4)', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p style={{ color: 'var(--color-negative)', fontSize: 'var(--font-size-sm)' }}>⚠ Service unreachable. Check that it is running.</p>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
      <p style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-1)' }}>{label}</p>
      <p style={{ color: color || 'var(--color-text)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>{value}</p>
    </div>
  );
}

function formatUptime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

const HealthDashboard = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const checkAll = useCallback(async () => {
    setLoading(true);
    const checks = await Promise.allSettled(
      SERVICES.map(async (svc) => {
        try {
          const res = await fetch(svc.url, { signal: AbortSignal.timeout(5000) });
          const data = await res.json();
          return { key: svc.key, data };
        } catch {
          return { key: svc.key, data: null };
        }
      })
    );
    const newResults = {};
    checks.forEach(c => {
      if (c.status === 'fulfilled') {
        newResults[c.value.key] = c.value.data;
      }
    });
    setResults(newResults);
    setLoading(false);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    checkAll();
    const interval = setInterval(checkAll, 10000);  // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [checkAll]);

  const healthyCount = Object.values(results).filter(d => d?.status === 'healthy').length;
  const totalCount = SERVICES.length;
  const allHealthy = healthyCount === totalCount && !loading;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />

      {/* Hero */}
      <div style={{ padding: 'var(--space-12) var(--space-6) var(--space-8)', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', background: allHealthy ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)', border: `1px solid ${allHealthy ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`, marginBottom: 'var(--space-4)' }}>
          <div className={`status-dot ${allHealthy ? 'healthy' : 'degraded'}`} />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: allHealthy ? 'var(--color-positive)' : 'var(--color-neutral)' }}>
            {loading ? 'Checking systems...' : allHealthy ? 'All systems operational' : `${healthyCount}/${totalCount} services healthy`}
          </span>
        </div>
        <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
          System Health Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Real-time status of all microservices · Auto-refreshes every 10s
          {lastRefresh && ` · Last checked ${lastRefresh.toLocaleTimeString()}`}
        </p>
        <button className="btn btn-ghost" onClick={checkAll} style={{ marginTop: 'var(--space-4)' }} aria-label="Refresh health checks">
          🔄 Refresh Now
        </button>
      </div>

      {/* Service cards grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 'var(--space-6)' }}>
        {SERVICES.map(svc => (
          <StatusCard
            key={svc.key}
            service={svc}
            data={results[svc.key]}
            loading={loading && !(svc.key in results)}
          />
        ))}
      </div>

      {/* Architecture note */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'var(--space-4) var(--space-6) var(--space-12)' }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', background: 'rgba(0,250,154,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,250,154,0.15)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            All traffic routes through the <strong style={{ color: 'var(--color-primary)' }}>Nginx API Gateway</strong> on port 80.
            Services on <strong style={{ color: 'var(--color-primary)' }}>3030</strong> (Dealers), <strong style={{ color: 'var(--color-primary)' }}>3050</strong> (Inventory), <strong style={{ color: 'var(--color-primary)' }}>5050</strong> (Sentiment), <strong style={{ color: 'var(--color-primary)' }}>8000</strong> (Django).
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
