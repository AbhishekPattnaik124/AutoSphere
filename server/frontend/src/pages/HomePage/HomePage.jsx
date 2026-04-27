import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Zap, BarChart3, Globe, ArrowUpRight, Activity, Target, Car as CarIcon } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import heroImg from '../../assets/hero.png';
import './HomePage.css';
import { useState, useEffect } from 'react';

const HomePage = () => {
  const [featuredCars, setFeaturedCars] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/djangoapp/get_inventory/1'); // Fetch from dealer 1 as sample
        const data = await res.json();
        setFeaturedCars(data.cars?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to fetch featured cars', err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <PageTransition>
      <div className="classy-home">
        
        {/* ── Cinematic Hero ───────────────────────────────── */}
        <section className="hero-section-cinematic">
          <div className="hero-overlay"></div>
          <img src={heroImg} alt="Luxury Showroom" className="hero-bg-img" />
          
          <div className="container hero-content-v2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span className="hero-pretitle">The Global Standard</span>
              <h1 className="hero-main-title">
                Automotive Intelligence<br/>
                <span className="gold-text">Redefined.</span>
              </h1>
              <p className="hero-description">
                Experience the world's most sophisticated dealership operating system. 
                Built for precision, powered by AI, designed for the elite.
              </p>
              
              <div className="hero-cta-group">
                <a href="/dealers" className="btn-luxury btn-gold">
                  Explore Network <ChevronRight size={18} />
                </a>
                <a href="/about" className="btn-luxury btn-outline-white">
                  Our Legacy
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Elite Metrics ────────────────────────────────── */}
        <section className="metrics-strip">
          <div className="container metrics-container">
            {[
              { label: "Partner Dealers", value: "450+" },
              { label: "Active Inventory", value: "12,000+" },
              { label: "AI Decisions/Min", value: "1.2M" },
              { label: "Market Index", value: "99.9%" }
            ].map((m, i) => (
              <div key={i} className="metric-item">
                <span className="metric-value">{m.value}</span>
                <span className="metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── The Three Pillars ───────────────────────────── */}
        <section className="pillars-section">
          <div className="container">
            <div className="section-header-centered">
              <span className="section-label">Foundation</span>
              <h2>Pillars of Excellence</h2>
            </div>

            <div className="pillars-grid">
              <motion.div 
                className="pillar-card glass-card"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="pillar-icon"><Zap size={32} /></div>
                <h3>Quantum Inventory</h3>
                <p>Real-time, sub-second synchronization across your entire global network.</p>
                <a href="/advancements" className="learn-more">Details <ArrowUpRight size={16} /></a>
              </motion.div>

              <motion.div 
                className="pillar-card glass-card active"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="pillar-icon"><BarChart3 size={32} /></div>
                <h3>AI Market Pulse</h3>
                <p>Predictive analytics and sentiment engines that anticipate market shifts before they happen.</p>
                <a href="/market-trends" className="learn-more">Explore Analytics <ArrowUpRight size={16} /></a>
              </motion.div>

              <motion.div 
                className="pillar-card glass-card"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="pillar-icon"><Shield size={32} /></div>
                <h3>Zero-Trust Core</h3>
                <p>Enterprise-grade security with immutable audit logs and quantum-ready encryption.</p>
                <a href="/health-dashboard" className="learn-more">Integrity <ArrowUpRight size={16} /></a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Elite Inventory Showcase ────────────────────── */}
        {featuredCars.length > 0 && (
          <section className="inventory-showcase">
            <div className="container">
              <div className="section-header-between">
                <div>
                  <span className="section-label">Curated Selection</span>
                  <h2>Featured Assets</h2>
                </div>
                <a href="/dealers" className="btn-luxury btn-outline-white">View Full Collection</a>
              </div>

              <div className="showcase-grid">
                {featuredCars.map((car, i) => (
                  <motion.div 
                    key={car._id}
                    className="asset-card glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="asset-visual">
                      <CarIcon size={64} strokeWidth={0.5} className="car-ghost-icon" />
                      <div className="asset-badge">Luxury</div>
                    </div>
                    <div className="asset-details">
                      <h4>{car.make} {car.model}</h4>
                      <div className="asset-meta">
                        <span>{car.year}</span>
                        <span className="dot"></span>
                        <span>{car.mileage.toLocaleString()} mi</span>
                      </div>
                      <div className="asset-price">
                        ${car.price.toLocaleString()}
                      </div>
                      <a href={`/dealers`} className="asset-link">
                        Inquire <ChevronRight size={14} />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Modern Showcase ──────────────────────────────── */}
        <section className="showcase-section">
          <div className="container showcase-flex">
            <div className="showcase-text">
              <span className="section-label">Experience</span>
              <h2>Cinematic Control.</h2>
              <p>
                AutoSphere isn't just a tool; it's a window into your empire. 
                Our interface is designed to provide maximum clarity with minimum friction.
              </p>
              <ul className="showcase-list">
                <li><Globe size={18} /> Global Multi-Tenant Management</li>
                <li><Activity size={18} /> Live Performance Telemetry</li>
                <li><Target size={18} /> AI-Assisted Lead Precision</li>
              </ul>
            </div>
            <div className="showcase-visual glass-card">
              <div className="visual-mockup">
                <div className="mockup-header"></div>
                <div className="mockup-body">
                  <div className="mockup-chart"></div>
                  <div className="mockup-lines">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section className="final-cta">
          <div className="container">
            <div className="cta-box glass-card">
              <h2>Ready to elevate your network?</h2>
              <p>Join the world's most exclusive automotive ecosystem today.</p>
              <a href="/register" className="btn-luxury btn-gold">Initialize Partnership</a>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default HomePage;
