import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import './MarketTrends.css';

const MarketTrends = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/cars-api/cars/market-trends')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="market-loader">Analyzing Market Intelligence...</div>;

  const COLORS = ['#00fa9a', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="market-trends-page">
      <Header />
      <div className="market-container">
        <header className="market-header">
          <h1>Market Intelligence</h1>
          <p>Real-time data across {data.summary.total_inventory} vehicles nationwide.</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card glass">
            <span className="label">Average Market Price</span>
            <span className="value">${Math.round(data.summary.avg_price).toLocaleString()}</span>
          </div>
          <div className="stat-card glass">
            <span className="label">Total Listed Value</span>
            <span className="value">${Math.round(data.summary.total_inventory * data.summary.avg_price / 1000000).toLocaleString()}M</span>
          </div>
          <div className="stat-card glass">
            <span className="label">Leading Manufacturer</span>
            <span className="value">{data.top_makes[0]?._id}</span>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-card glass">
            <h3>Top 10 Manufacturers by Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.top_makes}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="_id" stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#111', border: '1px solid #333' }}
                  itemStyle={{ color: '#00fa9a' }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card glass">
            <h3>Inventory Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Economy', value: 35 },
                    { name: 'Premium', value: 45 },
                    { name: 'Luxury', value: 20 }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.top_makes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              <span style={{color: COLORS[0]}}>● Economy</span>
              <span style={{color: COLORS[1]}}>● Premium</span>
              <span style={{color: COLORS[2]}}>● Luxury</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTrends;
