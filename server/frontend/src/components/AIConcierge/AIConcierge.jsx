import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Car, MapPin, BarChart3, ChevronRight } from 'lucide-react';
import './AIConcierge.css';

const SUGGESTIONS = [
  { text: "What's the market index today?", icon: <BarChart3 size={14} /> },
  { text: "Find luxury dealers nearby", icon: <MapPin size={14} /> },
  { text: "Recommend a high-performance SUV", icon: <Car size={14} /> },
];

const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome to AutoSphere. I am your elite concierge. How may I assist your automotive journey today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (content) => {
    const text = content || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Intelligence
    setTimeout(() => {
      let response = "I've analyzed our global network. ";
      if (text.toLowerCase().includes('dealer')) {
        response += "We currently have 450+ verified partners synchronized. You can explore the full map in the Network Hub.";
      } else if (text.toLowerCase().includes('market') || text.toLowerCase().includes('index')) {
        response += "The global market index is currently at 99.9% stability, with luxury assets showing a +4.2% growth trend.";
      } else if (text.toLowerCase().includes('car') || text.toLowerCase().includes('recommend')) {
        response += "Based on current trends, the Nissan Pathfinder and Toyota Camry are showing high reliability scores this month.";
      } else {
        response += "Your request has been logged into our neural engine. Our concierge team will prioritize your inquiry.";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="ai-concierge-wrapper">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="concierge-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
          >
            <div className="pulse-ring"></div>
            <Sparkles size={24} color="#000" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="concierge-window glass-card"
            initial={{ opacity: 0, y: 100, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
          >
            <div className="concierge-header">
              <div className="header-info">
                <div className="ai-avatar">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4>AutoSphere Concierge</h4>
                  <span className="status">Online • Neural Engine v2.0</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="messages-area" ref={scrollRef}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`message-bubble ${msg.role}`}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                >
                  {msg.content}
                </motion.div>
              ))}
              {isTyping && (
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              )}
            </div>

            <div className="concierge-footer">
              <div className="suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s.text)}>
                    {s.icon} {s.text}
                  </button>
                ))}
              </div>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Inquire about the network..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="send-btn" onClick={() => handleSend()}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIConcierge;
