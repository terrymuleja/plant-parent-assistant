import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import './src/locales/i18n';

import PlantListScreen from './src/screens/PlantListScreen';
import EditPlantScreen from './src/screens/EditPlantScreen';
import AddPlantScreen from './src/screens/AddPlantScreen';
import PlantDetailScreen from './src/screens/PlantDetailScreen';
import PhotoTimelineScreen from './src/screens/PhotoTimelineScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { PremiumProvider } from './src/hooks/usePremium';

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

export default function App() {
  return (
     <PremiumProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </PremiumProvider>
  );
}