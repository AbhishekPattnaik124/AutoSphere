import React, { useState, useCallback } from 'react';
import Header from '../../components/Header/Header';
import '../../design-system/tokens.css';
import './Recommendations.css';

// ── Constants ─────────────────────────────────────────────
const USAGE_TYPES = [
  { id: 'city', label: 'City Commuter', icon: '🏙️', desc: 'Urban driving, fuel-efficient, easy parking' },
  { id: 'highway', label: 'Highway Cruiser', icon: '🛣️', desc: 'Long-distance, comfortable, powerful' },
  { id: 'family', label: 'Family Hauler', icon: '👨‍👩‍👧‍👦', desc: 'Spacious, safe, SUV or minivan' },
];

const FUEL_TYPES = [
  { id: 'gas', label: 'Gasoline', icon: '⛽' },
  { id: 'electric', label: 'Electric', icon: '⚡' },
  { id: 'hybrid', label: 'Hybrid', icon: '🌿' },
];

const MAKES = ['Any', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Tesla', 'Hyundai', 'Kia', 'Nissan', 'Jeep'];

const RECOMMEND_URL = process.env.REACT_APP_RECOMMEND_URL || 'http://localhost:3070';

// ── Match Score Badge ──────────────────────────────────────
function MatchBadge({ score }) {
  const color = score >= 70 ? 'var(--color-positive)' : score >= 40 ? 'var(--color-neutral)' : 'var(--color-text-muted)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 56, height: 56, borderRadius: '50%',
      background: `conic-gradient(${color} ${score}%, var(--color-bg-elevated) 0%)`,
      flexShrink: 0,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', color }}>{Math.round(score)}%</span>
      </div>
    </div>
  );
}

// ── Result Car Card ────────────────────────────────────────
function CarCard({ car, onPriceCheck }) {
  return (
    <div className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
      <MatchBadge score={car.match_score || 0} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
              {car.year} {car.make} {car.model}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              {car.mileage?.toLocaleString()} miles
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
              ${car.price?.toLocaleString()}
            </p>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-3)', marginTop: 'var(--space-1)' }}
              onClick={() => onPriceCheck(car)}
            >
              💰 Price Check
            </button>
          </div>
        </div>
        {/* Match reasons */}
        {car.match_reason?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            {car.match_reason.map((r, i) => (
              <span key={i} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', background: 'var(--color-primary-glow)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)' }}>
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Price Check Inline Badge ───────────────────────────────
function PriceCheckResult({ data, onClose }) {
  if (!data) return null;
  const ratingColor = { 'Great Deal': 'var(--color-positive)', 'Fair Price': 'var(--color-neutral)', 'Overpriced': 'var(--color-negative)' }[data.price_rating] || 'var(--color-text-muted)';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center' }}>
        <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>Price Analysis</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>{data.model}</p>
        <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-black)', color: ratingColor, marginBottom: 'var(--space-2)' }}>
          {data.price_rating}
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
          Fair market estimate: <strong style={{ color: 'var(--color-text)' }}>${data.predicted_fair_price?.toLocaleString()}</strong>
        </p>
        <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Confidence</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-semibold)' }}>{Math.round((data.confidence_score || 0) * 100)}%</span>
          </div>
          {data.price_difference !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>vs. Listed Price</span>
              <span style={{ color: ratingColor, fontWeight: 'var(--font-weight-semibold)' }}>
                {data.price_difference > 0 ? '+' : ''}{data.price_difference?.toLocaleString()} ({data.price_difference_pct}%)
              </span>
            </div>
          )}
        </div>
        <button className="btn btn-ghost" onClick={onClose} style={{ width: '100%' }}>Close</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════
const Recommendations = () => {
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(30000);
  const [usageType, setUsageType] = useState('city');
  const [fuelPref, setFuelPref] = useState('gas');
  const [preferredMake, setPreferredMake] = useState('Any');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [priceCheckData, setPriceCheckData] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${RECOMMEND_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          preferred_make: preferredMake === 'Any' ? '' : preferredMake,
          usage_type: usageType,
          fuel_preference: fuelPref,
          limit: 12,
        }),
      });
      const data = await res.json();
      if (data.warning) setError(data.warning);
      setResults(data.results || []);
      setSubmitted(true);
    } catch (e) {
      setError('Could not connect to the AI recommendation engine. Make sure it is running on port 3070.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [budget, preferredMake, usageType, fuelPref]);

  const handlePriceCheck = async (car) => {
    try {
      const res = await fetch(`${RECOMMEND_URL}/price/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: car.make, model: car.model,
          year: car.year, mileage: car.mileage,
          actual_price: car.price,
        }),
      });
      const data = await res.json();
      setPriceCheckData(data);
    } catch (e) {
      alert('Price prediction service unavailable. Start recommend-service on port 3070.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />

      {/* Hero */}
      <div className="gradient-hero" style={{ padding: 'var(--space-16) var(--space-6) var(--space-12)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 'var(--space-4)' }}>
          AI-Powered
        </p>
        <h1 style={{ fontSize: 'var(--font-size-5xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-4)', background: 'linear-gradient(135deg, #fff, var(--color-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Find Your Perfect Car
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)', maxWidth: '500px', margin: '0 auto' }}>
          Our recommendation engine analyzes your preferences against our entire inventory using machine learning.
        </p>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>

        {/* Step progress indicator */}
        {!submitted && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)',
                  background: step >= s ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                  color: step >= s ? '#0d0f14' : 'var(--color-text-subtle)',
                  transition: 'all var(--transition-base)',
                }}>{s}</div>
                {s < 3 && <div style={{ width: 40, height: 2, background: step > s ? 'var(--color-primary)' : 'var(--color-border)', transition: 'all var(--transition-base)' }} />}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1: Budget ─────────────────────────────── */}
        {!submitted && step === 1 && (
          <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>What's your budget?</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>Set your maximum spending limit.</p>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>$5,000</span>
                <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>${budget.toLocaleString()}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>$100,000</span>
              </div>
              <input type="range" min={5000} max={100000} step={1000} value={budget}
                onChange={e => setBudget(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep(2)}>
              Next: Usage Type →
            </button>
          </div>
        )}

        {/* ── Step 2: Usage Type ─────────────────────────── */}
        {!submitted && step === 2 && (
          <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>How will you use it?</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>This helps us find the perfect fit for your lifestyle.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              {USAGE_TYPES.map(u => (
                <button key={u.id} onClick={() => setUsageType(u.id)} style={{
                  background: usageType === u.id ? 'var(--color-primary-glow)' : 'var(--color-bg-elevated)',
                  border: `2px solid ${usageType === u.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', cursor: 'pointer',
                  textAlign: 'left', transition: 'all var(--transition-base)',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{u.icon}</div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>{u.label}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{u.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>Next: Fuel Preference →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preferences ────────────────────────── */}
        {!submitted && step === 3 && (
          <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>Final preferences</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Narrow down by fuel type and preferred brand.</p>

            <p style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>Fuel Type</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
              {FUEL_TYPES.map(f => (
                <button key={f.id} onClick={() => setFuelPref(f.id)} style={{
                  background: fuelPref === f.id ? 'var(--color-primary-glow)' : 'var(--color-bg-elevated)',
                  border: `2px solid ${fuelPref === f.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-5)',
                  cursor: 'pointer', color: 'var(--color-text)', fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-semibold)', transition: 'all var(--transition-fast)',
                }}>
                  {f.icon} {f.label}
                </button>
              ))}
            </div>

            <p style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>Preferred Brand</p>
            <select value={preferredMake} onChange={e => setPreferredMake(e.target.value)} className="input" style={{ marginBottom: 'var(--space-8)' }}>
              {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={fetchRecommendations} disabled={loading}>
                {loading ? '🔍 Analyzing...' : '✨ Get Recommendations'}
              </button>
            </div>
          </div>
        )}

        {/* ── Results ─────────────────────────────────────── */}
        {submitted && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                  {loading ? 'Finding matches...' : `${results.length} recommendations found`}
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  Budget: ${budget.toLocaleString()} · {USAGE_TYPES.find(u => u.id === usageType)?.label} · {FUEL_TYPES.find(f => f.id === fuelPref)?.label}
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setStep(1); setResults([]); }}>
                ← New Search
              </button>
            </div>

            {error && (
              <div style={{ padding: 'var(--space-4)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', color: 'var(--color-negative)' }}>
                ⚠ {error}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-xl)' }} />)}
              </div>
            ) : results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {results.map((car, i) => (
                  <CarCard key={i} car={car} onPriceCheck={handlePriceCheck} />
                ))}
              </div>
            ) : (
              <div className="glass-card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🤖</p>
                <p style={{ color: 'var(--color-text-muted)' }}>No matches found. Try increasing your budget or changing preferences.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {priceCheckData && <PriceCheckResult data={priceCheckData} onClose={() => setPriceCheckData(null)} />}
    </div>
  );
};

export default Recommendations;
