import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, MapPin, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import './Leaderboard.css';

const Leaderboard = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/djangoapp/leaderboard')
      .then(res => res.json())
      .then(data => {
        setDealers(data.leaderboard || []);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <PageTransition>
      <div className="leaderboard-page">
        <div className="leaderboard-container">
          <header className="leaderboard-hero">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="section-label">Rankings</span>
              <h1 className="gold-text">Elite Network.</h1>
              <p className="hero-desc">Ranking our nationwide dealerships by algorithmic Trust Score and sentiment intelligence.</p>
            </motion.div>
          </header>

          {loading ? (
            <div className="leaderboard-loader-luxury">
              <Loader2 className="animate-spin" size={32} />
              <span>Calibrating Global Rankings...</span>
            </div>
          ) : (
            <motion.div 
              className="leaderboard-table-wrap"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="table-header-luxury glass-card">
                <span className="col-rank">#</span>
                <span className="col-dealer">Establishment</span>
                <span className="col-location">Location</span>
                <span className="col-metrics">Performance Index</span>
                <span className="col-grade">Tier</span>
              </div>

              <div className="leaderboard-list">
                {dealers.map((d, i) => (
                  <motion.div 
                    key={d.id} 
                    className="leaderboard-row glass-card"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, background: 'rgba(197, 160, 89, 0.05)' }}
                  >
                    <span className="rank-num gold-text">{i + 1}</span>
                    <div className="dealer-info-cell">
                      <span className="dealer-name">{d.name}</span>
                      <div className="review-stats">
                        <Star size={12} fill="var(--color-primary)" />
                        <span>{d.review_count} Verified Testimonials</span>
                      </div>
                    </div>
                    <div className="location-cell">
                      <MapPin size={14} />
                      <span>{d.city}</span>
                    </div>
                    <div className="metric-cell">
                      <div className="score-viz">
                        <div className="score-bar">
                          <motion.div 
                            className="score-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${d.trust_score}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <span className="score-val">{d.trust_score}</span>
                      </div>
                    </div>
                    <div className="grade-cell">
                      <span className={`tier-badge tier-${d.grade[0].toLowerCase()}`}>
                        {d.grade}
                      </span>
                      <ChevronRight size={16} className="row-arrow" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Leaderboard;
