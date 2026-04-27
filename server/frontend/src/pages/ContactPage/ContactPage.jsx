import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, Globe, Headphones, Cpu, FileText, ChevronDown } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import './ContactPage.css';

const offices = [
  { city: "Silicon Valley", role: "Global HQ", address: "100 Obsidian Plaza, CA 94025" },
  { city: "London", role: "European Hub", address: "50 Mayfair St, London W1J 8AJ" },
  { city: "Tokyo", role: "APAC Center", address: "1-1-1 Marunouchi, Chiyoda, Tokyo" }
];

const faqs = [
  { q: "How secure is my dealer data?", a: "AutoSphere uses AES-256 encryption and zero-trust protocols. Your data is stored in isolated, multi-region clusters." },
  { q: "Do you offer on-site training?", a: "Yes, our Elite Concierge team provides global on-site synchronization and staff training." },
  { q: "Can I integrate my existing CRM?", a: "Absolutely. Our Universal API supports direct integration with Salesforce, CDK Global, and more." }
];

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageTransition>
      <div className="contact-page-wrapper">
        
        {/* ── Cinematic Hero ───────────────────────────────── */}
        <header className="contact-hero-v3">
          <div className="background-glow" />
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              <span className="section-label">Direct Intelligence</span>
              <h1 className="cinematic-title">Connect with the <br/><span className="gold-text">Elite Hub.</span></h1>
            </motion.div>
          </div>
        </header>

        {/* ── Support Channels ────────────────────────────── */}
        <section className="support-channels">
          <div className="container grid-3">
            <motion.div className="channel-card glass-card" whileHover={{ y: -10 }}>
              <Headphones className="icon-gold" size={32} />
              <h3>Client Relations</h3>
              <p>Dedicated support for active dealership partners.</p>
              <span className="channel-link">relate@autosphere.luxury</span>
            </motion.div>
            
            <motion.div className="channel-card glass-card" whileHover={{ y: -10 }}>
              <Cpu className="icon-gold" size={32} />
              <h3>Technical Core</h3>
              <p>API documentation and system integration assistance.</p>
              <span className="channel-link">dev@autosphere.luxury</span>
            </motion.div>
 
            <motion.div className="channel-card glass-card" whileHover={{ y: -10 }}>
              <FileText className="icon-gold" size={32} />
              <h3>Media & Press</h3>
              <p>Inquiries regarding global automotive intelligence reports.</p>
              <span className="channel-link">press@autosphere.luxury</span>
            </motion.div>
          </div>
        </section>

        {/* ── Contact Form & Offices ──────────────────────── */}
        <section className="contact-main">
          <div className="container flex-split">
            <motion.div 
              className="contact-form-luxury glass-card"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="input-group">
                        <label>Identity</label>
                        <input type="text" placeholder="Full Name" required />
                      </div>
                      <div className="input-group">
                        <label>Corporate Email</label>
                        <input type="email" placeholder="name@company.com" required />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Domain of Interest</label>
                      <select>
                        <option>Global Partnership</option>
                        <option>Quantum Analytics</option>
                        <option>Inventory Ecosystem</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Transmission</label>
                      <textarea placeholder="Your message here..." rows="4" required></textarea>
                    </div>
                    <button type="submit" className="btn-luxury btn-gold">
                      Establish Contact <Send size={18} />
                    </button>
                  </form>
                ) : (
                  <motion.div className="success-v3" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                    <CheckCircle size={60} color="#C5A059" />
                    <h2>Handshake Established</h2>
                    <p>Our concierge has received your transmission.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
 
            <div className="offices-list">
              <span className="section-label">Regional Presence</span>
              {offices.map((office, i) => (
                <motion.div 
                  key={i} 
                  className="office-item"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="city-row">
                    <h4>{office.city}</h4>
                    <span className="role-tag">{office.role}</span>
                  </div>
                  <p>{office.address}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
 
        {/* ── FAQ Section ─────────────────────────────────── */}
        <section className="faq-section">
          <div className="container">
            <div className="section-header-centered">
              <span className="section-label">Knowledge</span>
              <h2>General Inquiries</h2>
            </div>
            
            <div className="faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className={`faq-item glass-card ${activeFaq === i ? 'active' : ''}`} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <div className="faq-question">
                    <span>{faq.q}</span>
                    <ChevronDown size={20} style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div 
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <p>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default ContactPage;
