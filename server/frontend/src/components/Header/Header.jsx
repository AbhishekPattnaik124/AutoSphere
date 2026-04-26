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
    <nav className="main-nav" aria-label="Main Navigation">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => window.location.href = "/"} role="button" tabIndex={0} aria-label="AutoSphere Home">
          <span className="brand-icon" aria-hidden="true">🚗</span>
          <span className="brand-name">AutoSphere</span>
        </div>

        <ul className="nav-links" role="menubar">
          <li role="none"><a role="menuitem" href="/">Home</a></li>
          <li role="none"><a role="menuitem" href="/about">About</a></li>
          <li role="none"><a role="menuitem" href="/contact">Contact</a></li>
          {username && <li role="none"><a role="menuitem" href="/dashboard">Dashboard</a></li>}
        </ul>

        <div className="nav-actions">
          <NotificationCenter aria-label="Notifications" />
          
          {username ? (
            <div className="user-menu" aria-label="User Menu">
              <span className="username" aria-live="polite">{username}</span>
              <button className="logout-btn" onClick={logout} aria-label="Log Out">Logout</button>
            </div>
          ) : (
            <div className="auth-links" aria-label="Authentication Links">
              <a href="/login" className="login-link" aria-label="Sign In">Sign In</a>
              <a href="/register" className="register-btn" aria-label="Register">Register</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
