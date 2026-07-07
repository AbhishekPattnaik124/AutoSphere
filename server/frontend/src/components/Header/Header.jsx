import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency, exchangeRates } from '../../context/CurrencyContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = sessionStorage.getItem('username');
  const { language, switchLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();

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
    { name: t('nav_home'), path: '/' },
    { name: t('nav_dealers'), path: '/dealers' },
    { 
      name: 'Services', 
      isDropdown: true, 
      items: [
        { name: 'Compare', path: '/car-comparison' },
        { name: 'Trade-In', path: '/trade-in' },
        { name: 'AI Studio', path: '/ai-studio' },
        { name: 'Pricing', path: '/pricing' },
      ]
    },
    { name: t('nav_about'), path: '/about' },
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
          {navItems.map((item, index) => (
            <li key={index} className={item.isDropdown ? "nav-dropdown" : ""}>
              {item.isDropdown ? (
                <div className="dropdown-toggle">
                  {item.name}
                  <div className="dropdown-menu glass-card">
                    {item.items.map(subItem => (
                      <Link 
                        key={subItem.path} 
                        to={subItem.path}
                        className="dropdown-item"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link 
                  to={item.path} 
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <select 
            className="lang-selector" 
            value={language} 
            onChange={(e) => switchLanguage(e.target.value)}
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>

          <select 
            className="lang-selector currency-selector" 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
          >
            {Object.keys(exchangeRates).map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>

          <NotificationCenter />
          
          {username ? (
            <div className="user-profile-menu">
              <span className="welcome-text">System//<span className="user-bold">{username}</span></span>
              <button className="logout-mini" onClick={logout}>{t('nav_logout')}</button>
            </div>
          ) : (
            <div className="auth-group">
              <Link to="/login" className="login-btn">{t('nav_login')}</Link>
              <button className="btn-luxury btn-gold sm" onClick={() => navigate("/register")}>
                {t('nav_register')}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Header;
