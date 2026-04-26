import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Booking.css';

const AppointmentBooking = () => {
  const { dealerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    car_id: '',
    car_name: '',
    booking_date: '',
    notes: ''
  });

  const [cars, setCars] = useState([]);

  useEffect(() => {
    // Fetch dealer's cars to choose from
    const fetchCars = async () => {
      try {
        const res = await fetch(`/cars-api/cars/${dealerId}`);
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
      const res = await fetch('/booking-api/book', {
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
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        const data = await res.json();
        setError(data.message || 'Booking failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <Header />
      <div className="booking-container">
        <div className="booking-card glass">
          <div className="booking-header">
            <h1>Book a Test Drive</h1>
            <p>Select a vehicle and your preferred date.</p>
          </div>

          {success ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Appointment Requested!</h2>
              <p>Redirecting you to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label>Select Vehicle</label>
                <select 
                  required
                  value={formData.car_id}
                  onChange={(e) => {
                    const car = cars.find(c => c._id === e.target.value);
                    setFormData({ ...formData, car_id: e.target.value, car_name: car ? `${car.make} ${car.model}` : '' });
                  }}
                >
                  <option value="">-- Choose a car --</option>
                  {cars.map(car => (
                    <option key={car._id} value={car._id}>{car.make} {car.model} ({car.year})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Preferred Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.booking_date}
                  onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea 
                  placeholder="Any specific questions or requirements?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {error && <div className="error-text">{error}</div>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
