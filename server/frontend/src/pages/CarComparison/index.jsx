import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import './CarComparison.css';

const CarComparison = () => {
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState('');
  const [inventory, setInventory] = useState([]);
  const [comparing, setComparing] = useState([]);

  useEffect(() => {
    fetch('/djangoapp/get_dealers')
      .then(res => res.json())
      .then(data => setDealers(data.dealers || []));
  }, []);

  const fetchInventory = async (dealerId) => {
    setSelectedDealer(dealerId);
    const res = await fetch(`/cars-api/cars/${dealerId}`);
    const data = await res.json();
    setInventory(data.cars || []);
  };

  const addToCompare = (car) => {
    if (comparing.length < 3 && !comparing.find(c => c._id === car._id)) {
      setComparing([...comparing, car]);
    }
  };

  const removeCar = (id) => {
    setComparing(comparing.filter(c => c._id !== id));
  };

  return (
    <div className="compare-page">
      <Header />
      <div className="compare-container">
        <header className="compare-header">
          <h1>Smart Comparison Engine</h1>
          <p>Side-by-side analysis of up to 3 vehicles. Highlight the best value automatically.</p>
        </header>

        <div className="selector-bar glass">
          <select value={selectedDealer} onChange={(e) => fetchInventory(e.target.value)}>
            <option value="">-- Choose a Dealer --</option>
            {dealers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
          <div className="inventory-scroll">
            {inventory.map(car => (
              <div key={car._id} className="mini-car-card" onClick={() => addToCompare(car)}>
                <span>{car.make} {car.model}</span>
                <strong>${car.price.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="comparison-grid">
          {comparing.map(car => (
            <div key={car._id} className="compare-card glass animate-fade-in">
              <button className="remove-btn" onClick={() => removeCar(car._id)}>×</button>
              <div className="car-head">
                <span className="year">{car.year}</span>
                <h3>{car.make} {car.model}</h3>
              </div>
              <div className="compare-rows">
                <div className="row">
                  <span className="label">Price</span>
                  <span className="value highlighting">${car.price.toLocaleString()}</span>
                </div>
                <div className="row">
                  <span className="label">Mileage</span>
                  <span className="value">{car.mileage.toLocaleString()} mi</span>
                </div>
                <div className="row">
                  <span className="label">Body Type</span>
                  <span className="value">{car.bodyType}</span>
                </div>
              </div>
              <button className="btn-primary-sm">Inquire Now</button>
            </div>
          ))}
          {[...Array(3 - comparing.length)].map((_, i) => (
            <div key={i} className="compare-placeholder glass">
              <span>+ Add car to compare</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarComparison;
