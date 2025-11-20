import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Get saved language from localStorage or default to 'en'
        const saved = localStorage.getItem('solarshare-language');
        return saved && translations[saved] ? saved : 'en';
    });

    useEffect(() => {
        // Save language preference to localStorage
        localStorage.setItem('solarshare-language', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || translations.en[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
