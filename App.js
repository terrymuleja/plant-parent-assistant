import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import PlantListScreen from './src/screens/PlantListScreen';
import EditPlantScreen from './src/screens/EditPlantScreen';
import AddPlantScreen from './src/screens/AddPlantScreen';
import PlantDetailScreen from './src/screens/PlantDetailScreen';
import PhotoTimelineScreen from './src/screens/PhotoTimelineScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import { PremiumProvider } from './src/hooks/usePremium';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PlantStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PlantList" 
        component={PlantListScreen} 
        options={{ title: 'My Plants' }}
      />
      <Stack.Screen 
        name="AddPlant" 
        component={AddPlantScreen} 
        options={{ title: 'Add New Plant' }}
      />
      <Stack.Screen 
        name="PlantDetail" 
        component={PlantDetailScreen} 
        options={{ title: 'Plant Details' }}
      />
      <Stack.Screen 
        name="EditPlant" 
        component={EditPlantScreen} 
        options={{ title: 'Edit Plant' }}
      />
      <Stack.Screen 
        name="PhotoTimeline" 
        component={PhotoTimelineScreen} 
        options={{ title: 'Growth Timeline' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Plants') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Reminders') {
            iconName = focused ? 'notifications' : 'notifications-outline';
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
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Reminders" component={RemindersScreen} />
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
