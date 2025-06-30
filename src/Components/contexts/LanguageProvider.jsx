import React, { createContext, useState, useContext, useCallback } from 'react';
import { translations } from '@/components/config/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const setLang = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};