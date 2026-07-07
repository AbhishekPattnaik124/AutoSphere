import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const exchangeRates = {
  USD: { rate: 1, symbol: '$', name: 'US Dollar' },
  EUR: { rate: 0.92, symbol: '€', name: 'Euro' },
  GBP: { rate: 0.79, symbol: '£', name: 'British Pound' },
  INR: { rate: 83.5, symbol: '₹', name: 'Indian Rupee' },
  JPY: { rate: 155.2, symbol: '¥', name: 'Japanese Yen' },
  CAD: { rate: 1.36, symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { rate: 1.51, symbol: 'A$', name: 'Australian Dollar' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  // Load from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem('user_currency');
    if (saved && exchangeRates[saved]) {
      setCurrency(saved);
    }
  }, []);

  const handleSetCurrency = (code) => {
    setCurrency(code);
    localStorage.setItem('user_currency', code);
  };

  const formatPrice = (usdAmount) => {
    if (!usdAmount || isNaN(usdAmount)) return usdAmount;
    
    const target = exchangeRates[currency] || exchangeRates.USD;
    const converted = parseFloat(usdAmount) * target.rate;
    
    // Format based on currency conventions
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 0,
      maximumFractionDigits: currency === 'JPY' ? 0 : 0,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, exchangeRates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
