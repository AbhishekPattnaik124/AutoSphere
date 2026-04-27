import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../PageTransition';
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import './DealerProfile.css';

const Dealer = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [trustData, setTrustData] = useState({ grade: 'A', score: 95 });
  const [reviews, setReviews] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const dRes = await fetch(`/djangoapp/dealer/${id}`, { signal: controller.signal });
        const dData = await dRes.json();
        
        if (dData.dealer && dData.dealer.length > 0) {
          setDealer(dData.dealer[0]);
          setTrustData(dData.trust_data || { grade: 'B', score: 75 });
        } else {
          setDealer(null);
        }

        // Parallel fetch for ancillary data
        Promise.all([
          fetch(`/djangoapp/reviews/dealer/${id}`, { signal: controller.signal }).then(r => r.json()),
          fetch(`/djangoapp/inventory/${id}`, { signal: controller.signal }).then(r => r.json())
        ]).then(([rData, iData]) => {
          setReviews(rData.reviews || []);
          setCars(iData.cars || []);
        });

        clearTimeout(timeoutId);
      } catch (err) {
        console.error("Fetch Error:", err);
        if (err.name !== 'AbortError') setDealer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (reviews.length > 0) {
      fetch('/djangoapp/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: reviews.map(r => r.review) })
      })
      .then(res => res.json())
      .then(data => setAiSummary(data.summary))
      .catch(console.error);
    }
  }, [reviews]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  if (loading) return (
    <div className="dealer-loader" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#c5a059' }}>
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        Loading Cinematic Experience...
      </motion.div>
    </div>
  );

  if (!dealer) return (
    <PageTransition>
      <div className="dealer-profile-page error-state" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column' }}>
         <h1 style={{ fontSize: '8rem', margin: 0 }}>📭</h1>
         <h2 style={{ fontSize: '3rem', color: '#c5a059' }}>Establishment Not Found</h2>
         <p style={{ opacity: 0.6 }}>This dealership registry entry is currently inactive or relocated.</p>
         <button className="btn-primary" onClick={() => window.location.href = '/dealers'} style={{ marginTop: '30px' }}>
           Return to Registry
         </button>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="dealer-profile-page">
        
        <motion.div 
          className="profile-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="hero-content">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.span variants={itemVariants} className="location-tag">{dealer.city}, {dealer.state}</motion.span>
              <motion.h1 variants={itemVariants}>{dealer.full_name}</motion.h1>
              <motion.p variants={itemVariants} className="address">{dealer.address} • Zip {dealer.zip}</motion.p>
              
              <motion.div variants={itemVariants} className="hero-actions">
                <button className="btn-primary" onClick={() => window.location.href = `/book/${id}`}>
                  Book Test Drive
                </button>
                {sessionStorage.getItem('username') && (
                  <button className="btn-secondary" onClick={() => window.location.href = `/postreview/${id}`}>
                    Submit Review
                  </button>
                )}
              </motion.div>
            </motion.div>

            <motion.div 
              className="trust-score-viz"
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, delay: 0.5 }}
            >
              <span className="grade">{trustData.grade}</span>
              <span className="label">AutoSphere Trust Grade</span>
            </motion.div>
          </div>
        </motion.div>

        <div className="profile-container main-content">
          <AnimatePresence>
            {aiSummary && (
              <motion.div 
                className="ai-insight-box glass-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ marginBottom: '4rem', padding: '2rem', border: '1px solid var(--color-gold-glow)', borderRadius: '24px', background: 'rgba(197, 160, 89, 0.05)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{ background: 'var(--color-gold)', color: '#000', padding: '2px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900 }}>AI ANALYTICS</span>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Sentiment Intelligence Report</h3>
                </div>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.8 }}>{aiSummary}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <section className="inventory-section">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              Luxury Inventory
            </motion.h2>
            
            <motion.div 
              className="inventory-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {cars.length > 0 ? cars.map((car, idx) => (
                <motion.div key={car._id} variants={itemVariants} className="car-card glass">
                  <div className="car-image-placeholder">
                    {car.image_url ? (
                      <img src={car.image_url} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>🚗</span>
                    )}
                  </div>
                  <div className="car-details">
                    <div className="car-header">
                      <h3>{car.make} {car.model}</h3>
                      <span className="year" style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{car.year}</span>
                    </div>
                    <div className="car-meta">
                      <span className="mileage">{car.mileage.toLocaleString()} MILES</span>
                      <span className="price">${car.price.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="empty-inventory glass-card" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
                   <p style={{ opacity: 0.5 }}>Currently procuring new inventory for this location.</p>
                </div>
              )}
            </motion.div>
          </section>

          <section className="reviews-section" style={{ marginTop: '6rem' }}>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              Customer Testimonials
            </motion.h2>
            
            <motion.div 
              className="reviews-list"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {reviews.length > 0 ? reviews.map((r, i) => (
                <motion.div key={i} variants={itemVariants} className="review-card glass">
                  <div className="review-header">
                    <img src={r.sentiment === 'positive' ? positive_icon : r.sentiment === 'negative' ? negative_icon : neutral_icon} alt={r.sentiment} />
                    <div className="reviewer-info">
                      <h4>{r.name}</h4>
                      <span>{r.car_make} {r.car_model}</span>
                    </div>
                  </div>
                  <p>"{r.review}"</p>
                </motion.div>
              )) : (
                <p style={{ opacity: 0.5 }}>No verified testimonials available for this location.</p>
              )}
            </motion.div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dealer;
