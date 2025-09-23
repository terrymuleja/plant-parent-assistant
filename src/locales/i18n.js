import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

// Import translation files using require (React Native compatible)
const en = require('./en/translation.json');
const fr = require('./fr/translation.json');
const nl = require('./nl/translation.json');
const es = require('./es/translation.json');

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  nl: { translation: nl },
  es: { translation: es },
};

// Get device language with fallback
let deviceLanguage = 'en';
try {
  deviceLanguage = getLocales()[0]?.languageCode || 'en';
} catch (error) {
  console.log('Could not get device locale, using English');
}

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;