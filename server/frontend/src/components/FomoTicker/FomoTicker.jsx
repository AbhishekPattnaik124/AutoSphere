import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Flame, Star, Tag } from 'lucide-react';
import './FomoTicker.css';

const fomoEvents = [
  { text: "John from Austin just booked a test drive for a BMW X5!", icon: <Flame size={16} color="#ffaa00" /> },
  { text: "A Dealership in Texas just purchased Elite Sponsorship!", icon: <Star size={16} color="#00ff9d" /> },
  { text: "Maria from Miami secured a $3,000 Trade-In Bonus!", icon: <Tag size={16} color="#00c3ff" /> },
  { text: "3 people are currently looking at the Audi Q7.", icon: <Bell size={16} color="#ff3366" /> },
];

const FomoTicker = () => {
  const [currentEvent, setCurrentEvent] = useState(null);

  useEffect(() => {
    // Show a new toast every 10 to 15 seconds
    const interval = setInterval(() => {
      const randomEvent = fomoEvents[Math.floor(Math.random() * fomoEvents.length)];
      setCurrentEvent(randomEvent);
      
      // Hide the toast after 5 seconds
      setTimeout(() => {
        setCurrentEvent(null);
      }, 5000);
      
    }, Math.floor(Math.random() * (15000 - 10000 + 1) + 10000));

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {currentEvent && (
        <motion.div
          className="fomo-ticker"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="fomo-icon">
            {currentEvent.icon}
          </div>
          <div className="fomo-text">
            {currentEvent.text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FomoTicker;
