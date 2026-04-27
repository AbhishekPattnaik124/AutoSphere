import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, Shield, Activity } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="premium-footer">
      <div className="footer-glow"></div>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="brand-text">
              <span className="brand-dot"></span>
              AUTOSPHERE
            </span>
            <p>
              The world's most sophisticated dealership operating system. 
              Precision engineered for the elite automotive network.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>Ecosystem</h4>
            <ul>
              <li><Link to="/dealers">Dealer Network</Link></li>
              <li><Link to="/market-trends">Market Trends</Link></li>
              <li><Link to="/advancements">Advancements</Link></li>
              <li><Link to="/health-dashboard">System Status</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">Our Legacy</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Connect</h4>
            <div className="footer-social">
              <a href="#" className="social-link"><Globe size={18} /></a>
              <a href="#" className="social-link"><Mail size={18} /></a>
              <a href="#" className="social-link"><Shield size={18} /></a>
              <a href="#" className="social-link"><Activity size={18} /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © {new Date().getFullYear()} AUTOSPHERE OS. ALL RIGHTS RESERVED.
          </div>
          <div className="footer-copy">
            BUILT FOR PERFORMANCE
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
