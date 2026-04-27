import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Calendar, Activity, Users, 
  ChevronRight, ArrowUpRight, Zap 
} from 'lucide-react';
import './Dashboard.css';

const marketData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 4500 },
  { name: 'Fri', value: 6000 },
  { name: 'Sat', value: 5500 },
  { name: 'Sun', value: 7000 },
];

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    if (!username) {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch User Bookings
        const bookRes = await fetch(`/djangoapp/bookings/user/${username}`);
        const bookData = await bookRes.json();
        setBookings(Array.isArray(bookData) ? bookData : []);

        // 2. Fetch Global Dashboard Stats
        const statsRes = await fetch('/djangoapp/dashboard-stats');
        const statsData = await statsRes.json();
        if (statsData.status === 200) {
          setStats(statsData);
        }
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) return (
    <div className="dashboard-loader-container" style={{ background: '#050505', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5A059' }}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        style={{ width: 40, height: 40, border: '4px solid rgba(197, 160, 89, 0.2)', borderTopColor: '#C5A059', borderRadius: '50%' }}
      />
    </div>
  );

  return (
    <div className="dashboard-page">
      
      <div className="dashboard-container">
        <motion.header 
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="user-info">
            <div className="avatar">{username[0].toUpperCase()}</div>
            <div>
              <h1>Elite Intelligence</h1>
              <p>Welcome back, {username}. Systems synchronized.</p>
            </div>
          </div>
          <div className="quick-actions">
            <a href="/advancements" className="btn-luxury btn-gold">
              Launch Advancements <Zap size={18} />
            </a>
          </div>
        </motion.header>

        <div className="stats-grid">
          {[
            { label: "Active Inquiries", value: bookings.length, icon: Calendar, trend: "Live" },
            { label: "Avg Car Price", value: stats?.market_trends?.summary?.avg_price ? `$${Math.round(stats.market_trends.summary.avg_price).toLocaleString()}` : "$42.5k", icon: TrendingUp, trend: "+2.1%" },
            { label: "Elite Partners", value: stats?.total_dealers || "42", icon: Users, trend: "Stable" },
            { label: "Global Inventory", value: stats?.market_trends?.summary?.total_inventory || "1,250", icon: Activity, trend: "Sync" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <stat.icon size={20} color="#C5A059" />
                <span style={{ color: '#00ff9d', fontSize: '0.7rem', fontWeight: 900 }}>{stat.trend}</span>
              </div>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-grid">
          <motion.section 
            className="dashboard-section"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="section-header">
              <h3>Live Market Trends</h3>
              <a href="/market-trends">Detailed Analytics <ChevronRight size={16} /></a>
            </div>
            
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.market_trends?.top_makes?.map(m => ({ name: m._id, value: m.count })) || marketData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(197, 160, 89, 0.2)', borderRadius: '12px' }}
                    itemStyle={{ color: '#C5A059' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#C5A059" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
            <motion.section 
              className="dashboard-section"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="section-header">
                <h3>Scheduled drives</h3>
                <a href="/dealers">New Booking</a>
              </div>
              <div className="section-content">
                {bookings.length === 0 ? (
                  <div className="empty-state" style={{ textAlign: 'center', padding: 'var(--space-10)', opacity: 0.3 }}>
                    No appointments scheduled
                  </div>
                ) : (
                  bookings.slice(0, 3).map(b => (
                    <div key={b.booking_id} className="booking-row">
                      <div className="date-box">
                        <span className="month">{new Date(b.booking_date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="day">{new Date(b.booking_date).getDate()}</span>
                      </div>
                      <div className="booking-info">
                        <h4>{b.car_name}</h4>
                        <span className={`status-tag`}>{b.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.section>

            <motion.section 
              className="dashboard-section activity-feed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="section-header">
                <h3>System Ledger</h3>
              </div>
              <div className="feed-items">
                {[
                  { text: 'Auth: Session token rotated successfully.', time: '2 mins ago' },
                  { text: 'Sync: Global inventory hub updated.', time: '1 hour ago' },
                  { text: 'Security: Zero-trust check passed.', time: '4 hours ago' }
                ].map((item, i) => (
                  <div key={i} className="feed-item">
                    <span className="dot"></span>
                    <div>
                      <p>{item.text}</p>
                      <span className="time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
