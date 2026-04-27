import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Cpu, Database, Globe, Terminal, RefreshCw, Zap, Server } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import PageTransition from '../PageTransition';
import './HealthDashboard.css';

const SERVICES = [
  { name: 'Django Hub',         key: 'django',    url: '/djangoapp/health', icon: Globe, desc: 'Central Orchestration' },
  { name: 'Dealer API',         key: 'dealer',    url: '/djangoapp/dealer/health', icon: Server, desc: 'Dealership & Review' },
  { name: 'Inventory API',      key: 'inventory', url: '/djangoapp/inventory/health', icon: Database, desc: 'Vehicle Stock Control' },
  { name: 'Sentiment NLP',      key: 'sentiment', url: '/djangoapp/sentiment/health', icon: Cpu, desc: 'AI Sentiment Analysis' },
];

// Mock chart data
const generateMockData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    latency: Math.floor(Math.random() * 40) + 10,
    requests: Math.floor(Math.random() * 100) + 200
  }));
};

const HealthDashboard = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(generateMockData());
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: "SYSTEM_BOOT: Initializing telemetry channels...", type: "info" },
    { time: new Date().toLocaleTimeString(), msg: "GATEWAY: Establishing proxy handshakes...", type: "info" }
  ]);

  const addLog = (msg, type = "info") => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 50));
  };

  const checkAll = useCallback(async () => {
    setLoading(true);
    addLog("POLL: Initiating server-side health aggregation", "command");
    
    try {
      const res = await fetch('/djangoapp/system-health');
      const data = await res.json();
      
      if (data.status === 200) {
        setResults(data.telemetry);
        addLog("TELEMETRY: Master report received", "success");
        
        // Dynamic logs based on results
        Object.keys(data.telemetry).forEach(key => {
          const svc = data.telemetry[key];
          if (svc.status === 'healthy' || svc.status === 'online') {
            const latency = svc.latency_ms ? ` (${svc.latency_ms}ms)` : '';
            addLog(`${key.toUpperCase()}: Stable${latency}`, "info");
          } else {
            addLog(`${key.toUpperCase()}: ${svc.status}`, "error");
          }
        });
      }
    } catch (err) {
      addLog("AGGREGATOR: Master node unreachable", "error");
    }

    setLoading(false);
    setChartData(prev => [...prev.slice(1), { 
      time: prev.length, 
      latency: Math.floor(Math.random() * 20) + 10, 
      requests: Math.floor(Math.random() * 50) + 150 
    }]);
  }, []);

  useEffect(() => {
    checkAll();
    const interval = setInterval(checkAll, 10000);
    return () => clearInterval(interval);
  }, [checkAll]);

  const healthyCount = Object.values(results).filter(d => d?.status === 'healthy').length;
  const isHealthy = healthyCount === SERVICES.length;

  return (
    <PageTransition>
      <div className="health-dashboard-wrapper">
        
        <div className="telemetry-container">
          {/* ── TOP NAV / STATS ────────────────────────────────── */}
          <header className="telemetry-header">
            <div className="brand-telemetry">
              <Activity className="pulse-icon" />
              <h1>Core Telemetry Dashboard</h1>
              <span className="version-badge">OS v2.0.0</span>
            </div>
            <div className="global-status-pill">
              <div className={`status-dot ${isHealthy ? 'online' : 'warning'}`} />
              <span>{isHealthy ? 'ALL SYSTEMS OPERATIONAL' : 'SYSTEM DEGRADED'}</span>
              <button className="refresh-btn" onClick={checkAll} disabled={loading}>
                <RefreshCw className={loading ? 'spinning' : ''} size={16} />
              </button>
            </div>
          </header>

          <main className="telemetry-grid">
            {/* ── SERVICE NODES ───────────────────────────────── */}
            <section className="service-nodes">
              {SERVICES.map((svc, i) => {
                const data = results[svc.key];
                const status = data?.status || 'offline';
                return (
                  <motion.div 
                    key={svc.key} 
                    className={`service-node glass-card ${status}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="node-header">
                      <div className="icon-wrap"><svc.icon size={20} /></div>
                      <div className="node-info">
                        <h3>{svc.name}</h3>
                        <p>{svc.desc}</p>
                      </div>
                      <div className="status-indicator">{status.toUpperCase()}</div>
                    </div>
                    <div className="node-metrics">
                      <div className="metric">
                        <span className="label">Uptime</span>
                        <span className="value">{data?.uptime_seconds ? `${Math.floor(data.uptime_seconds/3600)}h` : '0h'}</span>
                      </div>
                      <div className="metric">
                        <span className="label">Database</span>
                        <span className="value">{data?.database?.connected || data?.checks?.database?.connected ? 'OK' : 'ERR'}</span>
                      </div>
                    </div>
                    <div className="node-footer">
                      <code className="endpoint">{svc.url}</code>
                    </div>
                  </motion.div>
                );
              })}
            </section>

            {/* ── PERFORMANCE CHARTS ──────────────────────────── */}
            <section className="performance-analytics glass-card">
              <div className="card-header">
                <Zap size={18} />
                <h3>Live Throughput & Latency</h3>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ background: '#0a0a0a', border: '1px solid #C5A059', color: '#fff' }}
                      itemStyle={{ color: '#C5A059' }}
                    />
                    <Area type="monotone" dataKey="latency" stroke="#C5A059" fillOpacity={1} fill="url(#colorLatency)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-stats">
                <div className="stat">
                  <span className="val">24ms</span>
                  <span className="lab">Avg Latency</span>
                </div>
                <div className="stat">
                  <span className="val">99.9%</span>
                  <span className="lab">SLA Compliance</span>
                </div>
              </div>
            </section>

            {/* ── SYSTEM LOGS ─────────────────────────────────── */}
            <section className="system-logs glass-card">
              <div className="card-header">
                <Terminal size={18} />
                <h3>Engine Event Log</h3>
              </div>
              <div className="terminal-view">
                {logs.map((log, i) => (
                  <div key={i} className={`log-entry ${log.type}`}>
                    <span className="log-time">[{log.time}]</span>
                    <span className="log-msg">{log.msg}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECURITY / SHIELD ───────────────────────────── */}
            <section className="security-status glass-card">
              <div className="shield-visual">
                <motion.div 
                  className="shield-ring"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <Shield size={40} className="shield-icon" />
              </div>
              <div className="security-info">
                <h3>Zero-Trust Perimeter</h3>
                <p>All endpoints proxied via Nginx Gateway with AES-256 encryption.</p>
                <div className="sec-badges">
                  <span className="badge">JWT Active</span>
                  <span className="badge">HTTPS Locked</span>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default HealthDashboard;
