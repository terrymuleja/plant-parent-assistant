import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

// Import translation files using ES6 imports
import en from './en/translation.json';
import fr from './fr/translation.json';
import nl from './nl/translation.json';
import es from './es/translation.json';

const locale = getLocales()[0]?.languageCode ?? 'en';

// Synchronous initialization like your working app
i18n
  .use(initReactI18next)
  .init({
    // ESSENTIAL FIXES for React Native:
    compatibilityJSON: 'v4',  // Required for React Native compatibility
    initImmediate: false,     // Ensures synchronous initialization
    
    lng: locale.startsWith('fr') ? 'fr' : 
         locale.startsWith('nl') ? 'nl' :
         locale.startsWith('es') ? 'es' : 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      nl: { translation: nl },
      es: { translation: es },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Important: prevents loading issues
    },
  });

export default i18n;