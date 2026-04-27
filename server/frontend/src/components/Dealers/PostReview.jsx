import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../PageTransition';
import './DealerProfile.css';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const fetchDealer = useCallback(async () => {
    const res = await fetch(`/djangoapp/dealer/${id}`);
    const data = await res.json();
    if (data.status === 200 && data.dealer.length > 0) {
      setDealer(data.dealer[0]);
    }
  }, [id]);

  const fetchCars = useCallback(async () => {
    const res = await fetch(`/djangoapp/get_cars`);
    const data = await res.json();
    setCarmodels(data.CarModels || []);
  }, []);

  useEffect(() => {
    fetchDealer();
    fetchCars();
  }, [id, fetchDealer, fetchCars]);

  const handleSubmit = async () => {
    let name = sessionStorage.getItem("firstname") + " " + sessionStorage.getItem("lastname");
    if (name.includes("null")) name = sessionStorage.getItem("username");

    if (!model || review === "" || date === "" || year === "") {
      alert("Please complete all fields to submit your elite testimonial.");
      return;
    }

    setSubmitting(true);
    const [make_chosen, ...model_parts] = model.split(" ");
    const model_chosen = model_parts.join(" ");

    const payload = {
      name,
      dealership: id,
      review,
      purchase: true,
      purchase_date: date,
      car_make: make_chosen,
      car_model: model_chosen,
      car_year: year,
    };

    try {
      const res = await fetch(`/djangoapp/add_review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 200) {
        navigate(`/dealer/${id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="dealer-profile-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        <div className="profile-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 2rem' }}>
          <motion.div 
            className="review-form-container glass-card"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{ width: '100%', maxWidth: '700px', padding: '4rem', borderRadius: '32px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <span className="location-tag" style={{ marginBottom: '1rem' }}>Verified Owner Feedback</span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #c5a059)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Review {dealer.full_name}
            </h1>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Experience</label>
              <textarea 
                className="glass-input"
                placeholder="Describe your journey with this dealership..."
                style={{ width: '100%', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', color: '#fff', fontSize: '1.1rem', minHeight: '150px', outline: 'none' }}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>PURCHASE DATE</label>
                <input 
                  type="date" 
                  className="glass-input"
                  style={{ width: '100%', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff' }}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>CAR YEAR</label>
                <input 
                  type="number" 
                  className="glass-input"
                  placeholder="2023"
                  min="2015"
                  max="2024"
                  style={{ width: '100%', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff' }}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '3rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>SELECT VEHICLE MODEL</label>
              <select 
                className="glass-input"
                style={{ width: '100%', padding: '1.2rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="" disabled selected>Choose Car Make and Model</option>
                {carmodels.map(car => (
                  <option key={`${car.CarMake}-${car.CarModel}`} value={`${car.CarMake} ${car.CarModel}`} style={{ background: '#1a1a1a' }}>
                    {car.CarMake} {car.CarModel}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '1.5rem' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Transmitting Testimonial..." : "Submit Verified Review"}
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PostReview;
