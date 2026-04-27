import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Car, Info, Sparkles, TrendingDown, Clock } from 'lucide-react';
import Header from '../../components/Header/Header';
import PageTransition from '../../components/PageTransition';
import './CarComparison.css';

const CarComparison = () => {
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState('');
  const [inventory, setInventory] = useState([]);
  const [comparing, setComparing] = useState([]);

  useEffect(() => {
    fetch('/djangoapp/get_dealers')
      .then(res => res.json())
      .then(data => setDealers(data.dealers || []));
  }, []);

  const fetchInventory = async (dealerId) => {
    setSelectedDealer(dealerId);
    const res = await fetch(`/djangoapp/inventory/${dealerId}`);
    const data = await res.json();
    setInventory(data.cars || []);
  };

  const addToCompare = (car) => {
    if (comparing.length < 3 && !comparing.find(c => c._id === car._id)) {
      setComparing([...comparing, car]);
    }
  };

  const removeCar = (id) => {
    setComparing(comparing.filter(c => c._id !== id));
  };

  // ── Logic: Find best metrics
  const minPrice = comparing.length > 1 ? Math.min(...comparing.map(c => c.price)) : null;
  const minMileage = comparing.length > 1 ? Math.min(...comparing.map(c => c.mileage)) : null;

  const getAIInsight = () => {
    if (comparing.length < 2) return "Select at least two vehicles to begin neural analysis.";
    const bestValue = comparing.reduce((prev, curr) => (prev.price < curr.price ? prev : curr));
    return `Analysis complete. The ${bestValue.make} ${bestValue.model} represents the highest economic value in this segment.`;
  };

  return (
    <PageTransition>
      <div className="compare-page">
        <Header />
        <div className="compare-container">
          <header className="compare-header">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>Smart Comparison Engine</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Side-by-side analysis of up to 3 vehicles. Highlight the best value automatically.</motion.p>
          </header>

        <div className="compare-dashboard">
          <div className="selector-bar glass-card">
            <div className="selector-header">
              <Search size={18} />
              <select value={selectedDealer} onChange={(e) => fetchInventory(e.target.value)}>
                <option value="">-- Choose a Dealer --</option>
                {dealers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
            </div>
            <div className="inventory-scroll">
              {inventory.map(car => (
                <div key={car._id} className="mini-car-card" onClick={() => addToCompare(car)}>
                  <span>{car.make} {car.model}</span>
                  <strong>${car.price.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>

          <motion.div 
            className="ai-insight-panel glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="insight-header">
              <Sparkles size={20} color="#C5A059" />
              <h3>Neural Insights</h3>
            </div>
            <p>{getAIInsight()}</p>
            <div className="insight-badges">
              <span className="badge-luxury"><TrendingDown size={12} /> Low Depreciation</span>
              <span className="badge-luxury"><Clock size={12} /> High Demand</span>
            </div>
          </motion.div>
        </div>

        <motion.div layout className="comparison-grid">
          <AnimatePresence>
            {comparing.map(car => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                key={car._id} 
                className="compare-card glass-card"
              >
              <button className="remove-btn" onClick={() => removeCar(car._id)}>×</button>
              <div className="car-head">
                <span className="year">{car.year}</span>
                <h3>{car.make} {car.model}</h3>
              </div>
              <div className="compare-rows">
                <div className={`row ${car.price === minPrice ? 'winner' : ''}`}>
                  <span className="label">Price</span>
                  <span className="value highlighting">${car.price.toLocaleString()}</span>
                </div>
                <div className={`row ${car.mileage === minMileage ? 'winner' : ''}`}>
                  <span className="label">Mileage</span>
                  <span className="value">{car.mileage.toLocaleString()} mi</span>
                </div>
                <div className="row">
                  <span className="label">Body Type</span>
                  <span className="value">{car.bodyType}</span>
                </div>
                <div className="row">
                  <span className="label">Transmission</span>
                  <span className="value">{car.transmission || 'Automatic'}</span>
                </div>
              </div>
              <button className="btn-luxury-sm">Inquire Now</button>
              </motion.div>
            ))}
          </AnimatePresence>
          {[...Array(3 - comparing.length)].map((_, i) => (
            <motion.div layout key={`placeholder-${i}`} className="compare-placeholder glass-card" style={{ borderStyle: 'dashed' }}>
              <span>+ Add car to compare</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
    </PageTransition>
  );
};

export default CarComparison;
