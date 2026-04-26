import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header/Header';
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import review_icon from "../assets/reviewbutton.png";
import './DealerProfile.css';

const Dealer = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, rRes, iRes] = await Promise.all([
          fetch(`/djangoapp/dealer/${id}`),
          fetch(`/djangoapp/reviews/dealer/${id}`),
          fetch(`/cars-api/cars/${id}`)
        ]);
        
        const dData = await dRes.json();
        const rData = await rRes.json();
        const iData = await iRes.json();

        setDealer(dData.dealer[0] || {});
        setReviews(rData.reviews || []);
        setCars(iData.cars || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getSentimentStats = () => {
    if (!reviews.length) return { pos: 0, neu: 100, neg: 0 };
    const pos = reviews.filter(r => r.sentiment === 'positive').length;
    const neg = reviews.filter(r => r.sentiment === 'negative').length;
    const total = reviews.length;
    return {
      pos: (pos / total) * 100,
      neg: (neg / total) * 100,
      neu: ((total - pos - neg) / total) * 100
    };
  };

  const stats = getSentimentStats();

  if (loading) return <div className="dealer-loader">Loading Dealership Profile...</div>;

  return (
    <div className="dealer-profile-page">
      <Header />
      
      <div className="profile-hero">
        <div className="profile-container">
          <div className="hero-content">
            <span className="location-tag">{dealer.city}, {dealer.state}</span>
            <h1>{dealer.full_name}</h1>
            <p className="address">{dealer.address} • Zip {dealer.zip}</p>
            
            <div className="hero-stats">
              <div className="trust-score">
                <span className="grade">A</span>
                <span className="label">Trust Grade</span>
              </div>
              <div className="sentiment-bar">
                <div className="bar-label">Customer Satisfaction</div>
                <div className="multi-bar">
                  <div className="segment pos" style={{width: `${stats.pos}%`}}></div>
                  <div className="segment neu" style={{width: `${stats.neu}%`}}></div>
                  <div className="segment neg" style={{width: `${stats.neg}%`}}></div>
                </div>
                <div className="bar-legend">
                  <span>{Math.round(stats.pos)}% Positive</span>
                  <span>{Math.round(stats.neg)}% Negative</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => window.location.href = `/book/${id}`}>
              Book Test Drive
            </button>
            {sessionStorage.getItem('username') && (
              <button className="btn-secondary" onClick={() => window.location.href = `/postreview/${id}`}>
                Post Review
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-container main-content">
        <section className="inventory-section">
          <div className="section-header">
            <h2>Current Inventory</h2>
            <div className="filters">
               <input type="text" placeholder="Search models..." />
            </div>
          </div>
          
          <div className="inventory-grid">
            {cars.map(car => (
              <div key={car._id} className="car-card glass">
                <div className="car-image-placeholder">
                  <span>🚗</span>
                </div>
                <div className="car-details">
                  <div className="car-header">
                    <h3>{car.make} {car.model}</h3>
                    <span className="year">{car.year}</span>
                  </div>
                  <div className="car-meta">
                    <span>{car.mileage.toLocaleString()} miles</span>
                    <span className="price">${car.price.toLocaleString()}</span>
                  </div>
                  <div className="car-actions">
                    <button className="btn-sm">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="reviews-section">
          <h2>Verified Reviews</h2>
          <div className="reviews-list">
            {reviews.map((r, i) => (
              <div key={i} className="review-card glass">
                <div className="review-header">
                  <img src={r.sentiment === 'positive' ? positive_icon : r.sentiment === 'negative' ? negative_icon : neutral_icon} alt={r.sentiment} />
                  <div className="reviewer-info">
                    <h4>{r.name}</h4>
                    <span>{r.car_make} {r.car_model} owner</span>
                  </div>
                </div>
                <p>"{r.review}"</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dealer;
