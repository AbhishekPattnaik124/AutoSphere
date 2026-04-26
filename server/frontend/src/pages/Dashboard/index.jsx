import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import './Dashboard.css';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    if (!username) {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      try {
        const [bookRes] = await Promise.all([
          fetch(`/booking-api/user/${username}`)
        ]);
        
        const bookData = await bookRes.json();
        setBookings(bookData);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) return <div className="dashboard-loader">Synchronizing User Profile...</div>;

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="user-info">
            <div className="avatar">{username[0].toUpperCase()}</div>
            <div>
              <h1>Welcome back, {username}</h1>
              <p>Your personalized automotive control center.</p>
            </div>
          </div>
          <div className="quick-actions">
            <button className="btn-primary" onClick={() => window.location.href = '/recommendations'}>
              Get AI Recommendations
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* ── Bookings Section ───────────────────────────── */}
          <section className="dashboard-section glass">
            <div className="section-header">
              <h3>Upcoming Appointments</h3>
              <a href="/dealers">Book New</a>
            </div>
            <div className="section-content">
              {bookings.length === 0 ? (
                <div className="empty-state">No upcoming test drives</div>
              ) : (
                bookings.map(b => (
                  <div key={b.booking_id} className="booking-row">
                    <div className="date-box">
                      <span className="month">{new Date(b.booking_date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="day">{new Date(b.booking_date).getDate()}</span>
                    </div>
                    <div className="booking-info">
                      <h4>{b.car_name}</h4>
                      <p>Dealer ID: {b.dealer_id}</p>
                      <span className={`status-tag ${b.status.toLowerCase()}`}>{b.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Analytics & Trends ──────────────────────────── */}
          <section className="dashboard-section glass">
            <div className="section-header">
              <h3>Market Intelligence</h3>
              <a href="/market-trends">View Trends</a>
            </div>
            <div className="promo-card">
              <h4>Stay ahead of the curve.</h4>
              <p>Average market price for Luxury vehicles is up 4.2% this month.</p>
              <div className="mini-chart">
                <div className="bar" style={{height: '40%'}}></div>
                <div className="bar" style={{height: '60%'}}></div>
                <div className="bar" style={{height: '50%'}}></div>
                <div className="bar" style={{height: '80%'}}></div>
                <div className="bar" style={{height: '90%'}}></div>
              </div>
            </div>
          </section>

          {/* ── Activity Feed ──────────────────────────────── */}
          <section className="dashboard-section glass activity-feed">
            <div className="section-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="feed-items">
              <div className="feed-item">
                <span className="dot"></span>
                <p>You searched for "Electric SUV under $50k"</p>
                <span className="time">2 hours ago</span>
              </div>
              <div className="feed-item">
                <span className="dot"></span>
                <p>Profile updated: Fuel preference set to "Hybrid"</p>
                <span className="time">Yesterday</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
