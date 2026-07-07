import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition';
import SEO from '../../components/SEO';
import { MapPin, Star, TrendingUp, ShieldCheck } from 'lucide-react';
import './CityGuide.css';

const CityGuide = () => {
  const { city } = useParams();
  const formattedCity = city ? city.replace(/-/g, ' ') : 'Your City';
  
  const [dealers, setDealers] = useState([]);
  
  useEffect(() => {
    // In a real app, we might have a specific endpoint for city data
    // Here we fetch all dealers and filter locally for the mock
    const fetchDealers = async () => {
      try {
        const res = await fetch('/djangoapp/get_dealers');
        const data = await res.json();
        if (data.dealers) {
          const localDealers = data.dealers.filter(d => 
            d.city.toLowerCase() === formattedCity.toLowerCase()
          );
          setDealers(localDealers.length > 0 ? localDealers : data.dealers.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching dealers", err);
      }
    };
    fetchDealers();
  }, [formattedCity]);

  // Generate JSON-LD for Article SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Best Car Dealerships in ${formattedCity}`,
    "description": `Discover the top-rated luxury car dealerships in ${formattedCity}. We analyze market trends, pricing, and reviews.`,
    "author": {
      "@type": "Organization",
      "name": "Autosphere OS"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Autosphere OS",
      "logo": {
        "@type": "ImageObject",
        "url": "https://autosphere-os.com/logo.png"
      }
    }
  };

  return (
    <PageTransition>
      <SEO 
        title={`Best Car Dealerships in ${formattedCity} - 2024 Guide`}
        description={`Read our comprehensive guide to finding the best luxury and affordable cars in ${formattedCity}. Updated daily with real-time market data.`}
      />
      
      {/* Inject JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="city-guide-page">
        <motion.div 
          className="city-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="city-hero-content">
            <span className="badge">Updated for 2024</span>
            <h1>The Ultimate Guide to Buying a Car in <span className="highlight-gold">{formattedCity}</span></h1>
            <p>We analyzed millions of data points to find the top-rated dealerships, the best prices, and the latest market trends for your local area.</p>
          </div>
        </motion.div>

        <div className="guide-content">
          <section className="guide-section glass-card">
            <h2><TrendingUp className="icon-gold" /> Market Trends in {formattedCity}</h2>
            <p>
              The automotive market in {formattedCity} is experiencing a shift towards hybrid and luxury SUVs. 
              Average prices for pre-owned luxury vehicles are currently hovering around $45,000, 
              which is a 5% decrease from last quarter. Now is an excellent time to buy.
            </p>
          </section>

          <section className="guide-section">
            <h2><Star className="icon-gold" /> Top Rated Dealerships</h2>
            <div className="dealer-cards-grid">
              {dealers.map((dealer) => (
                <div key={dealer.id} className="dealer-card glass-card">
                  <h3>{dealer.full_name}</h3>
                  <div className="dealer-meta">
                    <span className="location"><MapPin size={16} /> {dealer.address}</span>
                  </div>
                  <p className="dealer-desc">
                    Known for their exceptional customer service and extensive inventory of premium vehicles in the {formattedCity} area.
                  </p>
                  <a href={`/dealer/${dealer.id}`} className="btn-luxury btn-outline-gold sm">View Profile</a>
                </div>
              ))}
            </div>
          </section>

          <section className="guide-section glass-card">
            <h2><ShieldCheck className="icon-gold" /> Why Trust Autosphere?</h2>
            <p>
              All dealerships listed on Autosphere OS are strictly verified. We use AI sentiment analysis 
              to ensure that dealer reviews are authentic, giving you the peace of mind you deserve when 
              making one of life's biggest purchases.
            </p>
          </section>
        </div>
      </div>
    </PageTransition>
  );
};

export default CityGuide;
