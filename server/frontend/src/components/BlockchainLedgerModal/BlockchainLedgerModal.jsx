import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Link as LinkIcon, Clock, ChevronDown } from 'lucide-react';
import './BlockchainLedgerModal.css';

const BlockchainLedgerModal = ({ vin, onClose }) => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await fetch(`/djangoapp/ledger/${vin}`);
        const data = await res.json();
        if (data.status === 'success') {
          setLedger(data.ledger);
        }
      } catch (err) {
        console.error("Blockchain fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (vin) fetchLedger();
  }, [vin]);

  return (
    <AnimatePresence>
      <motion.div 
        className="blockchain-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="blockchain-modal"
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
        >
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          
          <div className="blockchain-header">
            <ShieldCheck size={32} color="#00ff9d" />
            <h2>Web3 Vehicle Ledger</h2>
            <p className="vin-display">VIN: {vin}</p>
          </div>

          <div className="ledger-content">
            {loading ? (
              <div className="ledger-loading">
                <div className="pulse-dot"></div>
                Syncing with Blockchain...
              </div>
            ) : (
              <div className="timeline">
                {ledger.map((entry, idx) => (
                  <div key={entry.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-card">
                      <div className="timeline-header">
                        <span className={`event-type ${entry.event_type.toLowerCase()}`}>
                          {entry.event_type}
                        </span>
                        <span className="timestamp">
                          <Clock size={12} />
                          {entry.timestamp}
                        </span>
                      </div>
                      <p className="description">{entry.description}</p>
                      <div className="hash-box">
                        <LinkIcon size={12} />
                        <span className="hash">Tx Hash: {entry.hash}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BlockchainLedgerModal;
