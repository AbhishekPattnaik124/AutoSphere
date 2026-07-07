import React, { createContext, useState, useContext } from 'react';

const translations = {
  en: {
    nav_home: "Home",
    nav_about: "About Us",
    nav_dealers: "Dealerships",
    nav_pricing: "Pricing",
    nav_login: "Login",
    nav_register: "Register",
    nav_logout: "Logout",
    hero_title: "The Future of Auto Retail",
    hero_subtitle: "Discover the most premium vehicles with God-Tier AI recommendations.",
    btn_explore: "Explore Inventory",
    btn_dealers: "Find Dealers",
  },
  es: {
    nav_home: "Inicio",
    nav_about: "Nosotros",
    nav_dealers: "Concesionarios",
    nav_pricing: "Precios",
    nav_login: "Entrar",
    nav_register: "Registrarse",
    nav_logout: "Salir",
    hero_title: "El Futuro del Comercio Automotriz",
    hero_subtitle: "Descubra los vehículos más premium con recomendaciones de IA.",
    btn_explore: "Explorar Inventario",
    btn_dealers: "Buscar Concesionarios",
  },
  fr: {
    nav_home: "Accueil",
    nav_about: "À Propos",
    nav_dealers: "Concessionnaires",
    nav_pricing: "Tarifs",
    nav_login: "Connexion",
    nav_register: "S'inscrire",
    nav_logout: "Déconnexion",
    hero_title: "L'Avenir de la Vente Auto",
    hero_subtitle: "Découvrez les véhicules les plus premium avec des recommandations IA.",
    btn_explore: "Explorer l'Inventaire",
    btn_dealers: "Trouver des Concessionnaires",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
