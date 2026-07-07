import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition';
import SEO from '../../components/SEO';
import { Check, Zap, Target } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import './PricingPage.css';

const PricingPage = () => {
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [dealerId, setDealerId] = useState(1000); // Default to the first OSM dealer
  const { formatPrice } = useCurrency();

  React.useEffect(() => {
    fetch('/djangoapp/get_dealers')
      .then(res => res.json())
      .then(data => {
        if (data.dealers && data.dealers.length > 0) {
          setDealers(data.dealers);
          setDealerId(data.dealers[0].id);
        }
      })
      .catch(err => console.error("Failed to load dealers for pricing demo", err));
  }, []);

  const handleSubscribe = async (credits) => {
    setLoading(true);
    try {
      const res = await fetch('/djangoapp/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealer_id: dealerId, credits })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initiate checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpotlight = async () => {
    setLoading(true);
    try {
      const res = await fetch('/djangoapp/stripe/create-spotlight-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealer_id: dealerId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initiate checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <SEO 
        title="Dealer Pricing & Lead Credits"
        description="Purchase lead credits to receive high-intent test drive bookings from Autosphere."
      />
      <div className="pricing-page">
        <motion.div 
          className="pricing-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Accelerate Your Sales.</h1>
          <p>Only pay for verified, high-intent leads that convert.</p>
          
          <div style={{ marginTop: '20px' }}>
            <label style={{ marginRight: '10px', color: 'var(--color-text-muted)' }}>Select Dealership for Checkout:</label>
            <select 
              value={dealerId} 
              onChange={(e) => setDealerId(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '8px 12px',
                borderRadius: '8px',
                outline: 'none'
              }}
            >
              {dealers.map(d => (
                <option key={d.id} value={d.id} style={{ color: '#000' }}>{d.full_name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="pricing-grid">
          {/* Starter Plan */}
          <motion.div className="pricing-card glass-card" whileHover={{ y: -10 }}>
            <div className="pricing-icon"><Zap size={32} /></div>
            <h3>Starter Credits</h3>
            <div className="price" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              {formatPrice(250)}
            </div>
            <p className="pricing-desc">For independent dealerships looking to grow.</p>
            <ul className="pricing-features">
              <li><Check size={16} /> 10 Verified Leads ({formatPrice(25)}/lead)</li>
              <li><Check size={16} /> Basic Dashboard Access</li>
              <li><Check size={16} /> Email Support</li>
            </ul>
            <button className="btn-luxury btn-outline-gold" onClick={() => handleSubscribe(10)} disabled={loading}>
              Purchase Credits
            </button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div className="pricing-card glass-card pro-card" whileHover={{ y: -10 }}>
            <div className="pricing-icon"><Target size={32} /></div>
            <div className="pro-badge">Most Popular</div>
            <h3>Elite Credits</h3>
            <div className="price" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              {formatPrice(999)}
            </div>
            <p className="pricing-desc">For high-volume dealerships demanding excellence.</p>
            <ul className="pricing-features">
              <li><Check size={16} /> 50 Verified Leads ({formatPrice(20)}/lead)</li>
              <li><Check size={16} /> Priority Placement in Search</li>
              <li><Check size={16} /> AI Sentiment Analytics Access</li>
            </ul>
            <button className="btn-luxury btn-gold" onClick={() => handleSubscribe(50)} disabled={loading}>
              {loading ? 'Processing...' : 'Purchase Credits'}
            </button>
          </motion.div>

          {/* Spotlight Sponsorship */}
          <motion.div className="pricing-card glass-card" style={{ borderColor: 'var(--color-gold-glow)' }} whileHover={{ y: -10 }}>
            <div className="pricing-icon"><Target size={32} style={{ color: 'var(--color-gold)' }} /></div>
            <h3>Spotlight Sponsorship</h3>
            <div className="price" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              {formatPrice(500)}
              <span style={{ fontSize: '1rem', opacity: 0.7 }}>/mo</span>
            </div>
            <p className="pricing-desc">Dominate your local market with premium visibility.</p>
            <ul className="pricing-features">
              <li><Check size={16} /> Pinned at Top of Directory</li>
              <li><Check size={16} /> Exclusive "Sponsored" Badge</li>
              <li><Check size={16} /> Golden Glowing Border</li>
            </ul>
            <button className="btn-luxury btn-outline-gold" onClick={handleSpotlight} disabled={loading}>
              {loading ? 'Processing...' : 'Buy Spotlight'}
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PricingPage;
