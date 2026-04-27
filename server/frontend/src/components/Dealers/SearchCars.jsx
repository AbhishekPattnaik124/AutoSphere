import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, RotateCcw, Car } from 'lucide-react';
import PageTransition from '../PageTransition';
import './DealerProfile.css';

const SearchCars = () => {
  const [cars, setCars] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [dealer, setDealer] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const fetchDealer = useCallback(async () => {
    const res = await fetch(`/djangoapp/dealer/${id}`);
    const data = await res.json();
    if (data.status === 200 && data.dealer.length > 0) {
      setDealer(data.dealer[0]);
    }
  }, [id]);

  const fetchCars = useCallback(async (filters = {}) => {
    setLoading(true);
    let url = `/djangoapp/inventory/${id}`;
    const params = new URLSearchParams(filters).toString();
    if (params) url += `?${params}`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 200) {
      const carList = data.cars || [];
      setCars(carList);
      if (Object.keys(filters).length === 0) {
        const tmpMakes = [...new Set(carList.map(c => c.make))];
        const tmpModels = [...new Set(carList.map(c => c.model))];
        setMakes(tmpMakes);
        setModels(tmpModels);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDealer();
    fetchCars();
  }, [id, fetchCars, fetchDealer]);

  const handleFilter = (e) => {
    const { id, value } = e.target;
    if (value === "All") {
      fetchCars();
    } else {
      fetchCars({ [id]: value });
    }
  };

  const resetFilters = () => {
    document.querySelectorAll('select').forEach(s => s.value = "All");
    fetchCars();
  };

  return (
    <PageTransition>
      <div className="dealer-profile-page" style={{ minHeight: '100vh' }}>
        
        <div className="profile-container" style={{ padding: '120px 2rem 60px' }}>
          <header style={{ marginBottom: '4rem' }}>
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="location-tag"
            >
              Inventory Explorer
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '3.5rem', marginTop: '1rem', background: 'linear-gradient(to right, #fff, #c5a059)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Showroom: {dealer.full_name}
            </motion.h1>
          </header>

          <motion.div 
            className="filter-dock glass-card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '2rem', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '4rem', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c5a059', marginRight: '1rem' }}>
              <Filter size={20} />
              <span style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px' }}>FILTERS</span>
            </div>

            {['make', 'model', 'year', 'mileage', 'price'].map(key => (
              <div key={key} className="filter-group">
                <select id={key} onChange={handleFilter} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '100px', outline: 'none' }}>
                  <option value="All">{key.charAt(0).toUpperCase() + key.slice(1)}: All</option>
                  {key === 'make' && makes.map(m => <option key={m} value={m}>{m}</option>)}
                  {key === 'model' && models.map(m => <option key={m} value={m}>{m}</option>)}
                  {key === 'year' && [2024, 2023, 2022, 2021, 2020].map(y => <option key={y} value={y}>{y} or newer</option>)}
                  {key === 'mileage' && [
                    {v: 50000, l: 'Under 50k'},
                    {v: 100000, l: 'Under 100k'},
                    {v: 200001, l: 'Over 200k'}
                  ].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  {key === 'price' && [
                    {v: 20000, l: 'Under $20k'},
                    {v: 40000, l: 'Under $40k'},
                    {v: 80000, l: 'Under $80k'}
                  ].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
            ))}

            <button className="btn-secondary" onClick={resetFilters} style={{ padding: '10px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={14} /> Reset
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '100px' }}
              >
                <div className="pulse-loader" style={{ fontSize: '1.2rem', color: '#c5a059' }}>Synchronizing Regional Stock...</div>
              </motion.div>
            ) : cars.length > 0 ? (
              <motion.div 
                key="grid"
                className="inventory-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}
              >
                {cars.map(car => (
                  <motion.div 
                    key={car._id} 
                    className="car-card glass"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -10, transition: { duration: 0.2 } }}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden' }}
                  >
                    <div style={{ height: '200px', background: 'linear-gradient(45deg, #111, #222)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', overflow: 'hidden' }}>
                      {car.image_url ? (
                        <img src={car.image_url} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Car size={60} strokeWidth={1} color="rgba(197, 160, 89, 0.3)" />
                      )}
                    </div>
                    <div style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{car.make} {car.model}</h3>
                          <span style={{ fontSize: '0.8rem', color: '#c5a059', fontWeight: 900 }}>{car.year} EDITION</span>
                        </div>
                        <div style={{ background: 'rgba(197, 160, 89, 0.1)', color: '#c5a059', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>NEW</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>MILEAGE</span>
                          <span style={{ fontWeight: 700 }}>{car.mileage.toLocaleString()} mi</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>RETAIL PRICE</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#c5a059' }}>${car.price.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card" 
                style={{ padding: '6rem', textAlign: 'center', borderRadius: '32px' }}
              >
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</h2>
                <h3>No Matching Vehicles</h3>
                <p style={{ opacity: 0.6 }}>Our global procurement team is currently searching for inventory matching your criteria.</p>
                <button className="btn-secondary" onClick={resetFilters} style={{ marginTop: '2rem' }}>Clear All Filters</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default SearchCars;
