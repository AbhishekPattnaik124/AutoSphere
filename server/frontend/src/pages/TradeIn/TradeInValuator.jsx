import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/PageTransition';
import SEO from '../../components/SEO';
import { Car, DollarSign, Phone, Activity } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import './TradeIn.css';

const TradeInValuator = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ year: '2022', make: '', model: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState(null);
  const { formatPrice } = useCurrency();

  const handleNext = () => setStep(step + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/djangoapp/leads/trade-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setValuation(data.valuation);
        setStep(3);
      } else {
        alert('Failed to generate valuation');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const POPULAR_MAKES = ['Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Lexus', 'Mercedes-Benz', 'Nissan', 'Porsche', 'Toyota', 'Volkswagen'];
  const [availableModels, setAvailableModels] = useState([]);
  const [fetchingModels, setFetchingModels] = useState(false);

  // Fetch models from NHTSA API when Make or Year changes
  React.useEffect(() => {
    if (formData.make && formData.year && formData.year.length === 4) {
      setFetchingModels(true);
      fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${formData.make}/modelyear/${formData.year}?format=json`)
        .then(res => res.json())
        .then(data => {
          if (data && data.Results) {
            // Deduplicate models
            const uniqueModels = Array.from(new Set(data.Results.map(r => r.Model_Name))).sort();
            setAvailableModels(uniqueModels);
          } else {
            setAvailableModels([]);
          }
          setFetchingModels(false);
        })
        .catch(() => {
          setAvailableModels([]);
          setFetchingModels(false);
        });
    }
  }, [formData.make, formData.year]);

  return (
    <PageTransition>
      <SEO title="Instant AI Trade-In Valuation" description="Find out how much your car is worth instantly using our AI valuator." />
      <div className="trade-in-page">
        <div className="trade-in-container glass-card">
          <div className="trade-in-header">
            <Activity size={32} style={{ color: 'var(--color-gold)', marginBottom: '1rem' }} />
            <h1>AI Trade-In Valuator</h1>
            <p>Get a real-time market estimation for your vehicle in seconds.</p>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="hidden" animate="visible" exit="exit" className="step-content">
                <h3>Vehicle Information</h3>
                <div className="form-group">
                  <label>Year</label>
                  <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} placeholder="e.g. 2022" />
                </div>
                <div className="form-group">
                  <label>Make</label>
                  <select value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value, model: ''})}>
                    <option value="">-- Select Make --</option>
                    {POPULAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Model</label>
                  {fetchingModels ? (
                    <div style={{ color: '#C5A059', fontSize: '0.8rem', padding: '10px 0' }}>Fetching real models from NHTSA database...</div>
                  ) : (
                    <select value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} disabled={!formData.make || availableModels.length === 0}>
                      <option value="">-- Select Model --</option>
                      {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  )}
                </div>
                <button className="btn-luxury btn-gold" onClick={handleNext} disabled={!formData.make || !formData.model}>
                  Continue
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="hidden" animate="visible" exit="exit" className="step-content">
                <h3>Contact Details</h3>
                <p>We'll send your instant valuation report directly to your phone.</p>
                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-icon">
                    <Phone size={18} />
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="(555) 000-0000" />
                  </div>
                </div>
                <div className="button-group">
                  <button className="btn-luxury btn-outline-gold" onClick={() => setStep(1)}>Back</button>
                  <button className="btn-luxury btn-gold" onClick={handleSubmit} disabled={!formData.phone || loading}>
                    {loading ? 'Analyzing Market Data...' : 'Get Valuation'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && valuation && (
              <motion.div key="step3" variants={variants} initial="hidden" animate="visible" exit="exit" className="step-content success-step">
                <div className="valuation-card">
                  <DollarSign size={48} style={{ color: 'var(--color-gold)' }} />
                  <h3>Estimated Trade-In Value</h3>
                  <div className="valuation-price">
                    {formatPrice(valuation.estimated_value)}
                  </div>
                  <p className="valuation-range">
                    Range: {formatPrice(valuation.range_low)} - {formatPrice(valuation.range_high)}
                  </p>
                </div>
                <p className="next-steps">A local verified dealer will contact you shortly with a firm cash offer.</p>
                <button className="btn-luxury btn-outline-gold" onClick={() => window.location.href='/dealers'}>
                  Browse Inventory
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default TradeInValuator;
