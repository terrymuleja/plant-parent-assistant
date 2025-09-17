import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_PRODUCT_ID = 'plant_parent_premium_lifetime';

const PremiumContext = createContext({ 
  isPremium: false, 
  purchasePremium: () => Promise.resolve(false),
  enablePremiumForTesting: () => Promise.resolve()
});

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);

  const checkPremiumStatus = async () => {
    const localStatus = await AsyncStorage.getItem('@premium_status');
    if (localStatus === 'true') {
      setIsPremium(true);
    }
  };

  const purchasePremium = async () => {
    try {
      // For now, just simulate purchase success
      // Real Google Play integration happens after app is published
      setIsPremium(true);
      await AsyncStorage.setItem('@premium_status', 'true');
      return true;
    } catch (error) {
      console.log('Purchase failed:', error);
      return false;
    }
  };

  const enablePremiumForTesting = async () => {
    setIsPremium(true);
    await AsyncStorage.setItem('@premium_status', 'true');
  };

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, purchasePremium, enablePremiumForTesting }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => useContext(PremiumContext);