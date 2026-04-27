import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = sessionStorage.getItem('username');

  const logout = async (e) => {
    e.preventDefault();
    let logout_url = window.location.origin + "/djangoapp/logout";
    const res = await fetch(logout_url, { method: "GET" });
    const json = await res.json();
    
    if (json) {
      sessionStorage.removeItem('username');
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dealers', path: '/dealers' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    ...(username ? [{ name: 'Dashboard', path: '/dashboard' }] : [])
  ];

  return (
    <motion.nav 
      className="main-nav"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="nav-wrapper container">
        <div className="nav-brand" onClick={() => navigate("/")} role="button">
          <div className="pulse-container">
            <span className="brand-dot"></span>
            <div className="pulse-wave"></div>
          </div>
          <span className="brand-text">AUTOSPHERE <span className="os-tag">OS</span></span>
        </div>

        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <NotificationCenter />
          
          {username ? (
            <div className="user-profile-menu">
              <span className="welcome-text">System//<span className="user-bold">{username}</span></span>
              <button className="logout-mini" onClick={logout}>Sign Out</button>
            </div>
          ) : (
            <div className="auth-group">
              <Link to="/login" className="login-btn">Log In</Link>
              <button className="btn-luxury btn-gold sm" onClick={() => navigate("/register")}>
                Initialize
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Header;
