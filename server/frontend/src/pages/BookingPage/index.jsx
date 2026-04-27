import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Car, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';
import Header from '../../components/Header/Header';
import PageTransition from '../../components/PageTransition';
import '../../components/Dealers/DealerProfile.css';

const AppointmentBooking = () => {
  const { dealerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [cars, setCars] = useState([]);
  
  const [formData, setFormData] = useState({
    car_id: '',
    car_name: '',
    booking_date: '',
    notes: ''
  });

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch(`/djangoapp/inventory/${dealerId}`);
        const data = await res.json();
        setCars(data.cars || []);
      } catch (err) {
        console.error('Failed to fetch cars', err);
      }
    };
    fetchCars();
  }, [dealerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userId = sessionStorage.getItem('username') || 'Guest';

    try {
      const res = await fetch('/djangoapp/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dealer_id: parseInt(dealerId),
          user_id: userId
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 3500);
      } else {
        const data = await res.json();
        setError(data.message || 'Transmission failed. Please verify connection.');
      }
    } catch (err) {
      setError('System Hub Unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="dealer-profile-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <div className="profile-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 2rem' }}>
          <motion.div 
            className="booking-portal-card glass-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ width: '100%', maxWidth: '800px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '40px', overflow: 'hidden', position: 'relative' }}
          >
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: '6rem', textAlign: 'center' }}
                >
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: 'spring', delay: 0.2 }}
                    style={{ color: '#c5a059', marginBottom: '2rem' }}
                  >
                    <CheckCircle size={100} strokeWidth={1} />
                  </motion.div>
                  <h2 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #c5a059)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Request Synchronized
                  </h2>
                  <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', maxWidth: '400px', margin: '0 auto' }}>
                    Your elite test drive appointment has been transmitted. Redirecting to your command center...
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr' }}>
                  {/* Sidebar Visual */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.1) 0%, transparent 100%)', padding: '4rem 3rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <Calendar size={40} color="#c5a059" style={{ marginBottom: '2rem' }} />
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', lineHeight: 1.2 }}>Concierge Booking</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      Schedule your private viewing and performance evaluation. All appointments include a guided walkthrough of vehicle features.
                    </p>
                    <div style={{ marginTop: '4rem', opacity: 0.3 }}>
                      <Car size={120} strokeWidth={0.5} />
                    </div>
                  </div>

                  {/* Form Side */}
                  <form onSubmit={handleSubmit} style={{ padding: '4rem' }}>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 900, color: '#c5a059', letterSpacing: '2px', marginBottom: '1rem' }}>
                        <Car size={14} /> SELECT VEHICLE
                      </label>
                      <select 
                        required
                        className="glass-input"
                        style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', outline: 'none' }}
                        value={formData.car_id}
                        onChange={(e) => {
                          const car = cars.find(c => c._id === e.target.value);
                          setFormData({ ...formData, car_id: e.target.value, car_name: car ? `${car.make} ${car.model}` : '' });
                        }}
                      >
                        <option value="" disabled style={{ background: '#0a0a0a' }}>Choose a vehicle...</option>
                        {cars.map(car => (
                          <option key={car._id} value={car._id} style={{ background: '#0a0a0a' }}>{car.make} {car.model} ({car.year})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 900, color: '#c5a059', letterSpacing: '2px', marginBottom: '1rem' }}>
                        <Calendar size={14} /> DATE & TIME
                      </label>
                      <input 
                        type="datetime-local" 
                        required
                        className="glass-input"
                        style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', outline: 'none' }}
                        value={formData.booking_date}
                        onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '3rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 900, color: '#c5a059', letterSpacing: '2px', marginBottom: '1rem' }}>
                        <MessageSquare size={14} /> SPECIAL REQUESTS
                      </label>
                      <textarea 
                        placeholder="Any specific performance metrics or features you'd like to test?"
                        style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', outline: 'none', minHeight: '100px' }}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ff4d4d', fontSize: '0.8rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                        ⚠ {error}
                      </motion.div>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }} disabled={loading}>
                      {loading ? 'Transmitting...' : (
                        <>Confirm Appointment <ArrowRight size={18} /></>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AppointmentBooking;
