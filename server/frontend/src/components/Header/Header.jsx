import React from 'react';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import './Header.css';

const Header = () => {
  const logout = async (e) => {
    e.preventDefault();
    let logout_url = window.location.origin + "/djangoapp/logout";
    const res = await fetch(logout_url, { method: "GET" });
    const json = await res.json();
    
    if (json) {
      let username = sessionStorage.getItem('username');
      sessionStorage.removeItem('username');
      window.location.href = window.location.origin;
    }
  };

  const username = sessionStorage.getItem('username');

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => window.location.href = "/"}>
          <span className="brand-icon">🚗</span>
          <span className="brand-name">AutoSphere</span>
        </div>

        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
          {username && <li><a href="/dashboard">Dashboard</a></li>}
        </ul>

        <div className="nav-actions">
          <NotificationCenter />
          
          {username ? (
            <div className="user-menu">
              <span className="username">{username}</span>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <a href="/login" className="login-link">Sign In</a>
              <a href="/register" className="register-btn">Register</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
