import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Globe, Zap, Shield } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import './MarketTrends.css';

const priceData = [
  { name: 'Jan', price: 42000, inventory: 120 },
  { name: 'Feb', price: 45000, inventory: 110 },
  { name: 'Mar', price: 43000, inventory: 140 },
  { name: 'Apr', price: 48000, inventory: 130 },
  { name: 'May', price: 51000, inventory: 115 },
  { name: 'Jun', price: 54000, inventory: 95 },
];

const categoryData = [
  { name: 'Luxury Sedan', value: 45 },
  { name: 'SUV/Crossover', value: 35 },
  { name: 'Electric/Hybrid', value: 20 },
];

const COLORS = ['#C5A059', '#8E6E37', '#5C4018'];

const MarketTrends = () => {
  return (
    <PageTransition>
      <div className="trends-page-wrapper">
        
        <header className="trends-hero">
          <div className="container">
            <span className="section-label">Quantum Analytics</span>
            <h1 className="gold-text">Market Intelligence</h1>
            <p>Real-time algorithmic forecasting and inventory health metrics.</p>
          </div>
        </header>

        <main className="container trends-container">
          <div className="trends-grid">
            
            {/* ── Main Trend Chart ────────────────────────────── */}
            <motion.section 
              className="trend-section glass-card full-width"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="section-header">
                <h3>Price Index vs Inventory Density</h3>
                <div className="legend">
                  <span className="dot gold"></span> Price
                  <span className="dot dim"></span> Inventory
                </div>
              </div>
              <div className="chart-large">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" />
                    <Tooltip 
                      contentStyle={{ background: '#0a0a0a', border: '1px solid #C5A059', borderRadius: '12px' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#C5A059" strokeWidth={4} dot={{ r: 6, fill: '#C5A059' }} />
                    <Line type="monotone" dataKey="inventory" stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            {/* ── Category Distribution ───────────────────────── */}
            <motion.section 
              className="trend-section glass-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3>Demand by Category</h3>
              <div className="chart-small">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pie-legend">
                {categoryData.map((c, i) => (
                  <div key={i} className="legend-item">
                    <span style={{ color: COLORS[i] }}>{c.value}%</span>
                    <label>{c.name}</label>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* ── Real-time Metrics ───────────────────────────── */}
            <motion.section 
              className="trend-section glass-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3>Live Engine Pulse</h3>
              <div className="pulse-grid">
                <div className="pulse-item">
                  <div className="icon-wrap"><Globe size={20} /></div>
                  <div>
                    <label>Global Latency</label>
                    <span>12ms</span>
                  </div>
                </div>
                <div className="pulse-item">
                  <div className="icon-wrap"><Zap size={20} /></div>
                  <div>
                    <label>Sync Cycle</label>
                    <span>Sub-second</span>
                  </div>
                </div>
                <div className="pulse-item">
                  <div className="icon-wrap"><Shield size={20} /></div>
                  <div>
                    <label>Data Integrity</label>
                    <span>100% Verified</span>
                  </div>
                </div>
              </div>
              <div className="market-status positive">
                <TrendingUp size={24} />
                <div>
                  <h4>Market Sentiment: High</h4>
                  <p>Aggregated consumer confidence index is up 8.2 points.</p>
                </div>
              </div>
            </motion.section>

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default MarketTrends;
