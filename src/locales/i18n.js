import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Load saved language on app start
const initI18n = async () => {
  let deviceLanguage = 'en';
  
  try {
    // First try to get saved language
    const savedLanguage = await AsyncStorage.getItem('app_language');
    if (savedLanguage) {
      deviceLanguage = savedLanguage;
    } else {
      // Fall back to device language
      deviceLanguage = getLocales()[0]?.languageCode || 'en';
    }
  } catch (error) {
    console.log('Could not get language settings, using English');
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
      // Add this to handle undefined interpolation values
      format: function(value, format, lng) {
        if (value === undefined || value === null) {
          return '';
        }
        return value;
      }
    },
    react: {
      useSuspense: false, // Important: prevents loading issues
    },
  });
};

// Initialize i18n
initI18n();

export default i18n;