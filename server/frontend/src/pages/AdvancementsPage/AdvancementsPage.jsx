import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Cpu, Globe, Zap, Lock, BarChart3, Database, 
  MessageSquare, Settings, Users, Bell, Layers, Activity, 
  Share2, Key, Target, Map, PenTool, Briefcase, Cloud, 
  Compass, Eye, Heart, Image, Link, Mail, Phone, 
  PieChart, Printer, Radio, Save, Send, Smartphone, 
  Star, Terminal, Trash2, Video, Wifi, ShieldCheck, ChevronLeft
} from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import './AdvancementsPage.css';

const advancements = [
  { icon: Cpu, title: "AI Sentiment Engine", desc: "Real-time analysis of customer reviews and market emotions.", category: "AI & ML" },
  { icon: Globe, title: "Quantum Hub", desc: "Global multi-dealer synchronization across continents.", category: "Network" },
  { icon: Zap, title: "Event Streams", desc: "Sub-millisecond inventory updates via event-driven hooks.", category: "Data" },
  { icon: Lock, title: "Blockchain Ledger", desc: "Immutable audit logs for every transaction and change.", category: "Security" },
  { icon: BarChart3, title: "Predictive Analytics", desc: "Machine learning models forecasting next month's sales.", category: "AI & ML" },
  { icon: Database, title: "NoSQL Core", desc: "Scalable car inventory storage with flexible schematics.", category: "Data" },
  { icon: Search, title: "Semantic Search", desc: "Find the perfect car using natural language queries.", category: "Search" },
  { icon: MessageSquare, title: "AI Concierge", desc: "24/7 automated assistance for booking and support.", category: "AI & ML" },
  { icon: Settings, title: "Dynamic Pricing", desc: "Algorithmic adjustments based on supply and demand.", category: "Economics" },
  { icon: Users, title: "Customer 360", desc: "A holistic view of the entire customer lifecycle.", category: "CRM" },
  { icon: Bell, title: "Smart Alerts", desc: "Geo-fenced notifications for nearby dealership deals.", category: "Network" },
  { icon: Layers, title: "Micro-Frontend", desc: "Modular architecture for independent feature scaling.", category: "DevOps" },
  { icon: Activity, title: "Health Monitoring", desc: "Real-time platform heartbeat and service metrics.", category: "DevOps" },
  { icon: Share2, title: "Viral Referrals", desc: "Integrated social sharing and reward ecosystems.", category: "Marketing" },
  { icon: Key, title: "Vault Auth", desc: "Enterprise-grade key management and rotation.", category: "Security" },
  { icon: Target, title: "Lead Precision", desc: "Intelligent lead scoring and automated assignment.", category: "CRM" },
  { icon: Map, title: "Inventory Heatmaps", desc: "Visual representation of car density across regions.", category: "Visual" },
  { icon: PenTool, title: "Digital Signing", desc: "Secure, legally binding document execution.", category: "Security" },
  { icon: Briefcase, title: "Fleet Management", desc: "Specialized tools for large-scale enterprise fleets.", category: "Enterprise" },
  { icon: Cloud, title: "Serverless Edge", desc: "Global distribution with ultra-low latency execution.", category: "Network" },
  { icon: Compass, title: "AR Showroom", desc: "Virtual 3D car walkthroughs in your own space.", category: "Visual" },
  { icon: Eye, title: "Visual Inspection", desc: "AI-powered damage detection from car photographs.", category: "AI & ML" },
  { icon: Heart, title: "Retention Loop", desc: "Automated loyalty programs and re-engagement tools.", category: "Marketing" },
  { icon: Image, title: "Ultra HD Media", desc: "Lossless image hosting for every car detail.", category: "Visual" },
  { icon: Link, title: "API Ecosystem", desc: "Open endpoints for 3rd party tool integration.", category: "DevOps" },
  { icon: Mail, title: "CRM Automation", desc: "Drip campaigns triggered by user behavior.", category: "Marketing" },
  { icon: Phone, title: "VoIP Gateway", desc: "Direct-to-dealer calling with call tracking.", category: "CRM" },
  { icon: PieChart, title: "Market Share", desc: "Real-time competitor benchmarking analytics.", category: "Economics" },
  { icon: Printer, title: "Auto-Reporting", desc: "Scheduled PDF reports sent to your inbox.", category: "Data" },
  { icon: Radio, title: "Live Streams", desc: "Broadcast live car reveals and dealer auctions.", category: "Visual" },
  { icon: Save, title: "Draft Engine", desc: "Never lose progress with cloud-saved state.", category: "Data" },
  { icon: Send, title: "Instant Booking", desc: "One-click test drive scheduling system.", category: "CRM" },
  { icon: Smartphone, title: "PWA Support", desc: "Install AutoSphere as a native-feeling mobile app.", category: "Network" },
  { icon: Star, title: "Reputation Pro", desc: "Advanced review management and dealer scoring.", category: "Marketing" },
  { icon: Terminal, title: "Dev Console", desc: "Full CLI access for advanced platform control.", category: "DevOps" },
  { icon: Trash2, title: "Smart Purge", desc: "Automated cleanup of stale inventory and logs.", category: "Data" },
  { icon: Video, title: "Virtual Tours", desc: "Guided video walkthroughs with real dealers.", category: "Visual" },
  { icon: Wifi, title: "Connected Cars", desc: "Direct telemetry integration for modern vehicles.", category: "Network" },
  { icon: ShieldCheck, title: "Zero Trust", desc: "Continuous verification of every access request.", category: "Security" },
  { icon: Zap, title: "Turbo Mode", desc: "Low-bandwidth optimization for emerging markets.", category: "Network" }
];

const AdvancementsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredAdvancements = advancements.filter(adv => 
    adv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    adv.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="advancements-page-wrapper">
        
        <header className="adv-hero">
          <div className="container">
            <a href="/" className="back-link"><ChevronLeft size={18} /> Back to Collection</a>
            <h1 className="gold-text">Elite Advancements</h1>
            <p>Explore the 40 technological pillars of the AutoSphere ecosystem.</p>
            
            <div className="search-container glass-card">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search capabilities (e.g. AI, Security, Network)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <section className="adv-grid-section">
          <div className="container">
            <motion.div 
              className="full-advancements-grid"
              layout
            >
              <AnimatePresence mode='popLayout'>
                {filteredAdvancements.map((adv, i) => (
                  <motion.div 
                    key={adv.title} 
                    className="adv-card glass-card"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5, borderColor: '#C5A059' }}
                  >
                    <div className="category-tag">{adv.category}</div>
                    <div className="adv-icon-wrapper">
                      <adv.icon size={24} />
                    </div>
                    <h3>{adv.title}</h3>
                    <p>{adv.desc}</p>
                    <button className="activate-btn" onClick={() => alert(`${adv.title} is active and processing in your secure environment.`)}>
                      Access Module
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default AdvancementsPage;
