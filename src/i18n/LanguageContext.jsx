import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import translations from './translations';

const STORAGE_KEY = 'tap-to-purr-language';

const LanguageContext = createContext();

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch { /* ignore */ }
  return 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  // Sync lang and dir to <html> element
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', language);
    html.setAttribute('dir', direction);
  }, [language, direction]);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch { /* ignore */ }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  }, [language, setLanguage]);

  const t = useCallback((key, params) => {
    let text = translations[language]?.[key] || translations.en?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    if (text.includes('®')) {
      const parts = text.split('®');
      return React.createElement(React.Fragment, null,
        ...parts.flatMap((part, i) =>
          i < parts.length - 1
            ? [part, React.createElement('span', { key: i, className: 'reg-mark' }, '®')]
            : [part]
        )
      );
    }
    return text;
  }, [language]);

  const value = useMemo(() => ({
    language,
    direction,
    setLanguage,
    toggleLanguage,
    t,
  }), [language, direction, setLanguage, toggleLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
