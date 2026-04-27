import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Users, Award, Globe, Heart, Zap, Command, Layers, Compass } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import './AboutPage.css';

const values = [
  { icon: Shield, title: "Zero-Trust Security", desc: "Our platform is built on enterprise-grade security principles, ensuring total data sovereignty." },
  { icon: Target, title: "Precision Analytics", desc: "Every decision is backed by sub-millisecond AI processing and deep market data." },
  { icon: Users, title: "Elite Network", desc: "We curate a global community of the world's most prestigious automotive retailers." },
  { icon: Award, title: "The Gold Standard", desc: "We don't follow industry trends; we define the absolute peak of luxury software." },
  { icon: Globe, title: "Universal Sync", desc: "A seamless, real-time ecosystem that unifies global inventory and analytics." },
  { icon: Heart, title: "Human Centric", desc: "Technology designed to empower, with cinematic interfaces that feel alive." }
];

const timeline = [
  { year: "2024", event: "AutoSphere Alpha launched with Quantum Inventory Sync." },
  { year: "2025", event: "Expanded to 200+ elite dealers across Europe and Asia." },
  { year: "2026", event: "AI Market Sentiment Engine integrated for predictive sales." },
  { year: "Future", event: "Universal Car Blockchain Registry implementation." }
];

const AboutPage = () => {
  return (
    <PageTransition>
      <div className="about-page-wrapper">
        
        {/* ── Cinematic Hero ───────────────────────────────── */}
        <header className="about-hero-v3">
          <div className="background-glow" />
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              <span className="section-label">Our Legacy</span>
              <h1 className="cinematic-title">
                The Architecture of <br/>
                <span className="gold-text">Automotive Excellence.</span>
              </h1>
              <p className="hero-sub">
                Building the digital backbone for the world's most prestigious automotive empires.
              </p>
            </motion.div>
          </div>
        </header>

        {/* ── Mission & Vision ─────────────────────────────── */}
        <section className="mission-vision">
          <div className="container grid-2">
            <motion.div 
              className="vision-card glass-card active"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Compass className="icon-gold" size={40} />
              <h2>The Vision</h2>
              <p>To become the universal operating system for luxury automotive retail, where technology meets craftsmanship.</p>
            </motion.div>
            
            <motion.div 
              className="mission-card glass-card"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Target className="icon-gold" size={40} />
              <h2>The Mission</h2>
              <p>Empowering dealers with AI-driven intelligence to deliver unparalleled customer journeys and operational efficiency.</p>
            </motion.div>
          </div>
        </section>

        {/* ── Core Values ──────────────────────────────────── */}
        <section className="values-grid-section">
          <div className="container">
            <div className="section-header-centered">
              <span className="section-label">DNA</span>
              <h2>Our Core Principles</h2>
            </div>
            
            <div className="values-grid">
              {values.map((v, i) => (
                <motion.div 
                  key={i} 
                  className="value-item glass-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="icon-box"><v.icon size={24} /></div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Excellence Timeline ─────────────────────────── */}
        <section className="timeline-section">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Evolution</span>
              <h2>The Journey</h2>
            </div>
            
            <div className="timeline-container">
              {timeline.map((item, i) => (
                <motion.div 
                  key={i}
                  className="timeline-item"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="year-box gold-text">{item.year}</div>
                  <div className="event-box glass-card">{item.event}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Global Presence ─────────────────────────────── */}
        <section className="global-reach">
          <div className="container reach-flex">
            <div className="reach-text">
              <span className="section-label">Footprint</span>
              <h2>Unifying the Continents.</h2>
              <p>With nodes in every major automotive hub, AutoSphere provides the low-latency infrastructure required for global commerce.</p>
            </div>
            <div className="reach-stats glass-card">
              <div className="stat-node">
                <span className="gold-text">45+</span>
                <p>Countries</p>
              </div>
              <div className="stat-divider" />
              <div className="stat-node">
                <span className="gold-text">850k</span>
                <p>Vehicles Managed</p>
              </div>
              <div className="stat-divider" />
              <div className="stat-node">
                <span className="gold-text">99.9%</span>
                <p>Uptime Integrity</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default AboutPage;
