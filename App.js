import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from './src/locales/i18n';

import PlantListScreen from './src/screens/PlantListScreen';
import EditPlantScreen from './src/screens/EditPlantScreen';
import AddPlantScreen from './src/screens/AddPlantScreen';
import PlantDetailScreen from './src/screens/PlantDetailScreen';
import PhotoTimelineScreen from './src/screens/PhotoTimelineScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { PremiumProvider } from './src/hooks/usePremium';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://7e2217009f58c1a67ba470b5606c887d@o4510087143948288.ingest.de.sentry.io/4510087168065616',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PlantStack() {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PlantList" 
        component={PlantListScreen} 
        options={{ title: t('navigation.myPlants') }}
      />
      <Stack.Screen 
        name="AddPlant" 
        component={AddPlantScreen} 
        options={{ title: t('navigation.addNewPlant') }}
      />
      <Stack.Screen 
        name="PlantDetail" 
        component={PlantDetailScreen} 
        options={{ title: t('navigation.plantDetails') }}
      />
      <Stack.Screen 
        name="EditPlant" 
        component={EditPlantScreen} 
        options={{ title: t('navigation.editPlant') }}
      />
      <Stack.Screen 
        name="PhotoTimeline" 
        component={PhotoTimelineScreen} 
        options={{ title: t('navigation.growthTimeline') }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Plants') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Reminders') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Plants" 
        component={PlantStack} 
        options={{ headerShown: false, title: t('navigation.plants') }}
      />
      <Tab.Screen 
        name="Reminders" 
        component={RemindersScreen}
        options={{ title: t('navigation.reminders') }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: t('navigation.settings') }}
      />
    </Tab.Navigator>
  );
}

export default Sentry.wrap(function App() {
  // ADD i18n INITIALIZATION STATE
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  // INITIALIZE i18n PROPERLY - Wait for it to be ready
  useEffect(() => {
    const initI18n = async () => {
      try {
        // Check if i18n is already initialized
        if (i18n.isInitialized) {
          setIsI18nInitialized(true);
          return;
        }

        // Wait for i18n to be ready
        const checkI18nReady = () => {
          if (i18n.isInitialized) {
            setIsI18nInitialized(true);
          } else {
            // Check again in next tick
            setTimeout(checkI18nReady, 10);
          }
        };
        
        checkI18nReady();
      } catch (error) {
        console.error('Error initializing i18n:', error);
        // Set as initialized anyway to prevent infinite loading
        setIsI18nInitialized(true);
      }
    };

    initI18n();
  }, []);

  // WAIT FOR i18n TO BE READY BEFORE RENDERING COMPONENTS
  if (!isI18nInitialized) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
     <PremiumProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </PremiumProvider>
  );
});