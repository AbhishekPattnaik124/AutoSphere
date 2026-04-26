import React from 'react';
import { Home, Search, Calendar, User, BarChart3 } from 'lucide-react';
import './MobileNav.css';

const MobileNav = () => {
  const navigate = (path) => {
    window.location.href = path;
  };

  return (
    <nav className="mobile-bottom-nav">
      <div className="nav-item" onClick={() => navigate('/')}>
        <Home size={20} />
        <span>Home</span>
      </div>
      <div className="nav-item" onClick={() => navigate('/dealers')}>
        <Search size={20} />
        <span>Search</span>
      </div>
      <div className="nav-item center" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'k', ctrlKey: true}))}>
        <div className="plus-btn">
          <BarChart3 size={24} />
        </div>
      </div>
      <div className="nav-item" onClick={() => navigate('/dashboard')}>
        <Calendar size={20} />
        <span>Bookings</span>
      </div>
      <div className="nav-item" onClick={() => navigate('/dashboard')}>
        <User size={20} />
        <span>Account</span>
      </div>
    </nav>
  );
};

export default MobileNav;
