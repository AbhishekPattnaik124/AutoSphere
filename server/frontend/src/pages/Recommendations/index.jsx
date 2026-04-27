import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, DollarSign, Zap, Fuel, Activity, ChevronRight, ChevronLeft, Search, Loader2 } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import '../../design-system/tokens.css';
import './Recommendations.css';

// ── Constants ─────────────────────────────────────────────
const USAGE_TYPES = [
  { id: 'city', label: 'City Commuter', icon: '🏙️', desc: 'Urban driving, fuel-efficient, easy parking' },
  { id: 'highway', label: 'Highway Cruiser', icon: '🛣️', desc: 'Long-distance, comfortable, powerful' },
  { id: 'family', label: 'Family Hauler', icon: '👨‍👩‍👧‍👦', desc: 'Spacious, safe, SUV or minivan' },
];

const FUEL_TYPES = [
  { id: 'gas', label: 'Gasoline', icon: <Fuel size={18} /> },
  { id: 'electric', label: 'Electric', icon: <Zap size={18} /> },
  { id: 'hybrid', label: 'Hybrid', icon: <Activity size={18} /> },
];

const MAKES = ['Any', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Tesla', 'Hyundai', 'Kia', 'Nissan', 'Jeep'];

const RECOMMEND_URL = process.env.REACT_APP_RECOMMEND_URL || 'http://localhost:3070';

// ── Match Score Badge ──────────────────────────────────────
function MatchBadge({ score }) {
  const color = score >= 70 ? 'var(--color-primary)' : score >= 40 ? 'var(--color-neutral)' : 'var(--color-text-muted)';
  return (
    <div className="match-score-radial" style={{
      background: `conic-gradient(${color} ${score}%, rgba(255,255,255,0.05) 0%)`,
    }}>
      <div className="radial-inner">
        <span style={{ color }}>{Math.round(score)}%</span>
      </div>
    </div>
  );
}

// ── Result Car Card ────────────────────────────────────────
function CarCard({ car, onPriceCheck }) {
  return (
    <motion.div 
      className="car-recommend-card glass-card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -5, background: 'rgba(255,255,255,0.03)' }}
    >
      <div className="card-left">
        <MatchBadge score={car.match_score || 0} />
      </div>
      <div className="card-right">
        <div className="car-main-info">
          <div className="title-section">
            <h3>{car.year} {car.make} {car.model}</h3>
            <span className="mileage">{car.mileage?.toLocaleString()} miles · Network Verified</span>
          </div>
          <div className="price-section">
            <span className="price">${car.price?.toLocaleString()}</span>
            <button className="btn-luxury btn-outline btn-small" onClick={() => onPriceCheck(car)}>
              <DollarSign size={14} /> Intelligence Check
            </button>
          </div>
        </div>
        
        {car.match_reason?.length > 0 && (
          <div className="match-reasons">
            {car.match_reason.map((r, i) => (
              <span key={i} className="reason-pill">{r}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Price Check Modal ───────────────────────────────
function PriceCheckResult({ data, onClose }) {
  if (!data) return null;
  const ratingColor = { 
    'Great Deal': 'var(--color-positive)', 
    'Fair Price': 'var(--color-primary)', 
    'Overpriced': 'var(--color-negative)' 
  }[data.price_rating] || 'var(--color-text-muted)';

  return (
    <motion.div 
      className="modal-overlay" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal-content-luxury glass-card" 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <Sparkles className="gold-text" />
          <h3>Price Intelligence</h3>
        </div>
        <p className="modal-sub">{data.model}</p>
        
        <div className="rating-hero" style={{ color: ratingColor }}>
          {data.price_rating}
        </div>
        
        <div className="market-stat-card">
          <div className="stat-row">
            <span>Fair Market Value</span>
            <span className="stat-val">${data.predicted_fair_price?.toLocaleString()}</span>
          </div>
          <div className="stat-row">
            <span>Confidence Index</span>
            <span className="stat-val">{Math.round((data.confidence_score || 0) * 100)}%</span>
          </div>
          {data.price_difference !== undefined && (
            <div className="stat-row highlight">
              <span>Vs. Listing</span>
              <span style={{ color: ratingColor }}>
                {data.price_difference > 0 ? '+' : ''}{data.price_difference?.toLocaleString()} ({data.price_difference_pct}%)
              </span>
            </div>
          )}
        </div>
        
        <button className="btn-luxury btn-gold full-width" onClick={onClose}>Close Intelligence Report</button>
      </motion.div>
    </motion.div>
  );
}

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
      setError('Recommendation engine (Port 3070) is offline. Displaying network error telemetry.');
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
      alert('Price prediction engine (Port 3070) unavailable.');
    }
  };

  return (
    <PageTransition>
      <div className="recommend-page">
        <header className="recommend-hero">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="section-label">AI Integration</span>
              <h1 className="gold-text">Predictive Search.</h1>
              <p className="hero-desc">Our neural engine analyzes your behavioral profile to identify the perfect automotive match.</p>
            </motion.div>
          </div>
        </header>

        <div className="recommend-content container">
          {!submitted && (
            <div className="step-tracker">
              {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                  <div className={`step-dot ${step >= s ? 'active' : ''}`}>{s}</div>
                  {s < 3 && <div className={`step-line ${step > s ? 'active' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div 
                key={step}
                className="step-card glass-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {step === 1 && (
                  <div className="step-inner">
                    <h2>Capital Allocation</h2>
                    <p className="step-sub">Define your maximum network budget.</p>
                    <div className="budget-slider-wrap">
                      <div className="budget-display">
                        <span className="limit-low">$5K</span>
                        <span className="current-val gold-text">${budget.toLocaleString()}</span>
                        <span className="limit-high">$100K</span>
                      </div>
                      <input 
                        type="range" min={5000} max={100000} step={1000} value={budget}
                        onChange={e => setBudget(parseInt(e.target.value))}
                        className="luxury-range"
                      />
                    </div>
                    <button className="btn-luxury btn-gold full-width" onClick={() => setStep(2)}>
                      Continue Profile Setup <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="step-inner">
                    <h2>Operational Usage</h2>
                    <p className="step-sub">Select the primary utility profile for your vehicle.</p>
                    <div className="usage-grid">
                      {USAGE_TYPES.map(u => (
                        <button 
                          key={u.id} 
                          className={`usage-card glass-card ${usageType === u.id ? 'active' : ''}`}
                          onClick={() => setUsageType(u.id)}
                        >
                          <span className="usage-icon">{u.icon}</span>
                          <span className="usage-label">{u.label}</span>
                          <span className="usage-desc">{u.desc}</span>
                        </button>
                      ))}
                    </div>
                    <div className="btn-group">
                      <button className="btn-luxury btn-outline" onClick={() => setStep(1)}>
                        <ChevronLeft size={18} /> Back
                      </button>
                      <button className="btn-luxury btn-gold" onClick={() => setStep(3)}>
                        Preferences <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="step-inner">
                    <h2>Refining Parameters</h2>
                    <p className="step-sub">Specify engineering and brand preferences.</p>
                    
                    <div className="pref-section">
                      <label>Energy Source</label>
                      <div className="fuel-group">
                        {FUEL_TYPES.map(f => (
                          <button 
                            key={f.id} 
                            className={`fuel-pill ${fuelPref === f.id ? 'active' : ''}`}
                            onClick={() => setFuelPref(f.id)}
                          >
                            {f.icon} {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pref-section">
                      <label>Preferred Manufacturer</label>
                      <select value={preferredMake} onChange={e => setPreferredMake(e.target.value)} className="luxury-select">
                        {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    <div className="btn-group">
                      <button className="btn-luxury btn-outline" onClick={() => setStep(2)}>
                        <ChevronLeft size={18} /> Back
                      </button>
                      <button className="btn-luxury btn-gold" onClick={fetchRecommendations} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {loading ? 'Synthesizing...' : 'Initialize Matching'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                className="results-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="results-header">
                  <div className="query-summary">
                    <h2>{results.length} Potential Matches</h2>
                    <p>Optimized for ${budget.toLocaleString()} · {usageType} · {fuelPref}</p>
                  </div>
                  <button className="btn-luxury btn-outline btn-small" onClick={() => { setSubmitted(false); setStep(1); setResults([]); }}>
                    <Search size={14} /> New Parameter Set
                  </button>
                </div>

                {error && (
                  <div className="error-telemetry glass-card">
                    <Zap size={18} className="gold-text" />
                    <span>{error}</span>
                  </div>
                )}

                {loading ? (
                  <div className="skeleton-list">
                    {[1,2,3].map(i => <div key={i} className="skeleton-card glass-card" />)}
                  </div>
                ) : results.length > 0 ? (
                  <div className="recommendations-list">
                    {results.map((car, i) => (
                      <CarCard key={i} car={car} onPriceCheck={handlePriceCheck} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-results glass-card">
                    <Search size={48} className="gold-text" />
                    <h3>No Direct Matches Found</h3>
                    <p>Try recalibrating your budget or usage parameters.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {priceCheckData && <PriceCheckResult data={priceCheckData} onClose={() => setPriceCheckData(null)} />}
      </div>
    </PageTransition>
  );
};

export default Recommendations;
