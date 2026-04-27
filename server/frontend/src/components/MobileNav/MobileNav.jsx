import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Calendar, User, Command } from 'lucide-react';
import './MobileNav.css';

const MobileNav = () => {
  const navigate = (path) => {
    window.location.href = path;
  };

  return (
    <motion.nav 
      className="mobile-bottom-nav glass-card"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      style={{ border: 'none', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', borderBottom: 'none' }}
    >
      <motion.div whileTap={{ scale: 0.9 }} className="nav-item" onClick={() => navigate('/')}>
        <Home size={20} />
        <span>Home</span>
      </motion.div>
      <motion.div whileTap={{ scale: 0.9 }} className="nav-item" onClick={() => navigate('/dealers')}>
        <Search size={20} />
        <span>Search</span>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.9, rotate: -15 }} 
        className="nav-item center" 
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'k', ctrlKey: true}))}
      >
        <div className="plus-btn" style={{ boxShadow: 'var(--shadow-glow-primary)' }}>
          <Command size={24} color="#000" />
        </div>
      </motion.div>
      <motion.div whileTap={{ scale: 0.9 }} className="nav-item" onClick={() => navigate('/dashboard')}>
        <Calendar size={20} />
        <span>Bookings</span>
      </motion.div>
      <motion.div whileTap={{ scale: 0.9 }} className="nav-item" onClick={() => navigate('/dashboard')}>
        <User size={20} />
        <span>Account</span>
      </motion.div>
    </motion.nav>
  );
};

export default MobileNav;
