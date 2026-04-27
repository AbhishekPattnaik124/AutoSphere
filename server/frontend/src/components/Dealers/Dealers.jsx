import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Map as MapIcon, Table as TableIcon, Star, ChevronRight } from 'lucide-react';
import PageTransition from '../PageTransition';
import './Dealers.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Dealers = () => {
  const [origDealersList, setOrigDealersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const isLoggedIn = sessionStorage.getItem('username') != null;

  const fetchDealers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/djangoapp/get_dealers');
      const data = await res.json();
      if (data.status === 200) {
        setOrigDealersList(data.dealers || []);
      }
    } catch (e) {
      console.error('Failed to fetch dealers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDealers(); }, [fetchDealers]);

  const filteredDealers = (origDealersList || []).filter(d =>
    d.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="dealers-portal">
        <header className="portal-hero">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="section-label">Global Network</span>
              <h1 className="gold-text">Elite Retailers.</h1>
              <p className="hero-desc">Connecting you with the world's most prestigious automotive dealerships.</p>
              
              <div className="search-box-luxury glass-card">
                <Search size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by state, city, or dealership name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </header>

        <main className="container portal-content">
          <div className="controls-bar">
            <div className="results-count">
              <span className="gold-text">{filteredDealers.length}</span> Locations Synchronized
            </div>
            <div className="view-toggles">
              <button 
                className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <TableIcon size={16} /> List View
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <MapIcon size={16} /> Geo View
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'table' ? (
              <motion.div 
                key="table"
                className="table-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <table className="luxury-table">
                  <thead>
                    <tr>
                      <th>Dealership</th>
                      <th>Location</th>
                      <th>Status</th>
                      {isLoggedIn && <th>Engagement</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDealers.map((dealer, i) => (
                      <motion.tr 
                        key={dealer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <td>
                          <div className="dealer-name-cell">
                            <span className="dealer-id">#{dealer.id}</span>
                            <a href={`/dealer/${dealer.id}`} className="dealer-link">{dealer.full_name}</a>
                          </div>
                        </td>
                        <td>
                          <div className="location-cell">
                            <span className="city">{dealer.city}</span>
                            <span className="state-badge">{dealer.state}</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-tag online">Active</span>
                        </td>
                        {isLoggedIn && (
                          <td>
                            <div className="action-cell">
                              <a href={`/postreview/${dealer.id}`} className="icon-action"><Star size={18} /></a>
                              <a href={`/book/${dealer.id}`} className="btn-luxury btn-gold sm">Book</a>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div 
                key="map"
                className="map-container-luxury glass-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
              >
                <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {filteredDealers.filter(d => d.lat && d.lng).map(dealer => (
                    <Marker key={dealer.id} position={[dealer.lat, dealer.lng]}>
                      <Popup className="luxury-popup">
                        <div className="popup-content">
                          <h4>{dealer.full_name}</h4>
                          <p>{dealer.city}, {dealer.state}</p>
                          <a href={`/dealer/${dealer.id}`}>View Details <ChevronRight size={14} /></a>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dealers;
