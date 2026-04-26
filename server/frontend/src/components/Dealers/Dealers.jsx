import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../Header/Header';
import '../../design-system/tokens.css';
import './Dealers.css';
import reviewIcon from '../assets/reviewicon.png';

// Fix Leaflet default icon broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Custom debounce hook ────────────────────────────────────
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Skeleton loader ─────────────────────────────────────────
function DealerSkeleton() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} style={{ padding: 'var(--space-3) var(--space-4)' }}>
          <div className="skeleton" style={{ height: '20px', width: i === 1 ? '40px' : '100%', borderRadius: 'var(--radius-md)' }} />
        </td>
      ))}
    </tr>
  );
}

// ── Empty state illustration ────────────────────────────────
function EmptyState({ searchTerm }) {
  return (
    <tr>
      <td colSpan={6} style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ margin: '0 auto var(--space-4)', display: 'block' }}>
          <circle cx="40" cy="40" r="36" fill="rgba(0,250,154,0.08)" stroke="rgba(0,250,154,0.2)" strokeWidth="2"/>
          <path d="M28 52C28 52 32 42 40 42C48 42 52 52 52 52" stroke="rgba(0,250,154,0.4)" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="33" cy="34" r="3" fill="rgba(0,250,154,0.4)"/>
          <circle cx="47" cy="34" r="3" fill="rgba(0,250,154,0.4)"/>
        </svg>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
          No dealerships found
        </p>
        <p style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
          {searchTerm ? `No results for "${searchTerm}". Try a different state.` : 'No dealers available.'}
        </p>
      </td>
    </tr>
  );
}

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [origDealersList, setOrigDealersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'map'

  const debouncedSearch = useDebounce(searchTerm, 300);
  const isLoggedIn = sessionStorage.getItem('username') != null;

  // Filter dealers based on debounced search term
  const filteredDealers = debouncedSearch.trim()
    ? origDealersList.filter(d =>
        d.state?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        d.city?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        d.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : dealersList;

  const fetchDealers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/djangoapp/get_dealers');
      const data = await res.json();
      if (data.status === 200) {
        const all = Array.from(data.dealers);
        setDealersList(all);
        setOrigDealersList(all);
      }
    } catch (e) {
      console.error('Failed to fetch dealers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDealers(); }, [fetchDealers]);

  // Seed map coords (fallback if not in data)
  const mapDealers = filteredDealers.filter(d => d.lat && d.lng);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />

      {/* ── Hero Banner ───────────────────────────────────── */}
      <div className="gradient-hero" style={{ padding: 'var(--space-16) var(--space-6) var(--space-12)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 'var(--space-4)' }}>
          Nationwide Network
        </p>
        <h1 style={{ fontSize: 'var(--font-size-5xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-4)', background: 'linear-gradient(135deg, #fff, var(--color-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Find Your Dealership
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)', maxWidth: '500px', margin: '0 auto var(--space-8)' }}>
          {origDealersList.length} dealerships across the country. Search by state, city, or name.
        </p>

        {/* Search input */}
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)', pointerEvents: 'none' }}>🔍</span>
          <input
            className="input"
            type="text"
            placeholder="Search by state, city, or dealer name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search dealerships"
            style={{ paddingLeft: 'var(--space-10)', fontSize: 'var(--font-size-base)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(0,250,154,0.3)' }}
          />
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div style={{ padding: 'var(--space-8) var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}>

        {/* View toggle + result count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            {loading ? 'Loading...' : `${filteredDealers.length} dealership${filteredDealers.length !== 1 ? 's' : ''} found`}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className={`btn btn-ghost`}
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              style={viewMode === 'table' ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
            >
              ☰ Table
            </button>
            <button
              className={`btn btn-ghost`}
              onClick={() => setViewMode('map')}
              aria-pressed={viewMode === 'map'}
              style={viewMode === 'map' ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
            >
              🗺 Map
            </button>
          </div>
        </div>

        {/* ── Map view ─────────────────────────────────────── */}
        {viewMode === 'map' && (
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: 'var(--space-8)', height: '450px' }}>
            <MapContainer
              center={[39.8283, -98.5795]}
              zoom={4}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapDealers.map(dealer => (
                <Marker key={dealer.id} position={[dealer.lat, dealer.lng]}>
                  <Popup>
                    <strong>{dealer.full_name}</strong><br />
                    {dealer.city}, {dealer.state}<br />
                    <a href={`/dealer/${dealer.id}`}>View Details →</a>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            {mapDealers.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', color: 'var(--color-text-muted)' }}>
                Map coordinates not available for current dealers.
              </div>
            )}
          </div>
        )}

        {/* ── Table view ───────────────────────────────────── */}
        {viewMode === 'table' && (
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <table className="data-table" role="grid" aria-label="Dealerships list">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Dealer Name</th>
                  <th scope="col">City</th>
                  <th scope="col">Address</th>
                  <th scope="col">Zip</th>
                  <th scope="col">State</th>
                  {isLoggedIn && <th scope="col">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <DealerSkeleton key={i} />)
                  : filteredDealers.length === 0
                    ? <EmptyState searchTerm={debouncedSearch} />
                    : filteredDealers.map(dealer => (
                      <tr key={dealer.id}>
                        <td style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-sm)' }}>#{dealer.id}</td>
                        <td>
                          <a href={`/dealer/${dealer.id}`} style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-semibold)', textDecoration: 'none', transition: 'opacity var(--transition-fast)' }}
                            onMouseOver={e => e.target.style.opacity = '0.7'}
                            onMouseOut={e => e.target.style.opacity = '1'}>
                            {dealer.full_name}
                          </a>
                        </td>
                        <td>{dealer.city}</td>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{dealer.address}</td>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{dealer.zip}</td>
                        <td>
                          <span className="badge badge-primary">{dealer.state}</span>
                        </td>
                        {isLoggedIn && (
                          <td>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                              <a href={`/postreview/${dealer.id}`} aria-label={`Review ${dealer.full_name}`}>
                                <img src={reviewIcon} alt="Post Review" style={{ width: '28px', opacity: 0.8, transition: 'opacity var(--transition-fast)', filter: 'hue-rotate(130deg)' }}
                                  onMouseOver={e => e.target.style.opacity = '1'}
                                  onMouseOut={e => e.target.style.opacity = '0.8'} />
                              </a>
                              <a href={`/book/${dealer.id}`} className="btn-book-sm">Book</a>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dealers;
