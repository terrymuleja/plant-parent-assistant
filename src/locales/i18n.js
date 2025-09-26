import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files using ES6 imports instead of require
import en from './en/translation.json';
import fr from './fr/translation.json';
import nl from './nl/translation.json';
import es from './es/translation.json';

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
    // ESSENTIAL FIXES for React Native:
    compatibilityJSON: 'v4',  // Required for React Native compatibility
    initImmediate: false,     // Ensures synchronous initialization
    
    resources,
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Important: prevents loading issues
    },
  });
};

// Initialize i18n
initI18n();

export default i18n;