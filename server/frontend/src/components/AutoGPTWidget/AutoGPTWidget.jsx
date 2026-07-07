import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './AutoGPTWidget.css';

const AutoGPTWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setMessages([{
        id: 1,
        sender: 'bot',
        text: "Hello! I'm your AutoGPT AI Assistant. How can I help you find the perfect vehicle today?"
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Mock AI Response
    setTimeout(() => {
      let botResponse = "That's a great question! Based on my market analysis, I highly recommend checking out our Elite Sponsored Dealerships. Could I get your email so I can send you a personalized list of options?";
      
      if (userMessage.text.toLowerCase().includes('suv')) {
        botResponse = "For SUVs, the Audi Q7 and BMW X5 are trending right now in your area. Would you like me to connect you with a top dealer for a test drive?";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse
      }]);
    }, 1500);
  };

  return (
    <>
      <motion.button 
        className="autogpt-fab"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <MessageSquare size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="autogpt-window"
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="autogpt-header">
              <div className="autogpt-title">
                <Bot size={20} color="var(--color-primary)" />
                AutoGPT Sales Assistant
              </div>
              <button className="autogpt-close" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="autogpt-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`autogpt-message ${msg.sender}`}>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="autogpt-input-area" onSubmit={handleSend}>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..." 
                className="autogpt-input"
              />
              <button type="submit" className="autogpt-send">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AutoGPTWidget;
