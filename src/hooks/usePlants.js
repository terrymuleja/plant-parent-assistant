import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLANTS_STORAGE_KEY = '@plants';

export const usePlants = () => {
  const [plants, setPlantsState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const storedPlants = await AsyncStorage.getItem(PLANTS_STORAGE_KEY);
      if (storedPlants) {
        setPlantsState(JSON.parse(storedPlants));
      }
    } catch (error) {
      console.error('Error loading plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePlants = async (newPlants) => {
    try {
      await AsyncStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(newPlants));
      setPlantsState(newPlants);
    } catch (error) {
      console.error('Error saving plants:', error);
    }
  };

  const addPlant = async (plant) => {
    const newPlant = {
      id: Date.now().toString(),
      ...plant,
      createdAt: new Date().toISOString(),
      photos: [],
      careLog: []
    };
    const newPlants = [...plants, newPlant];
    await savePlants(newPlants);
  };

  const updatePlant = async (id, updates) => {
    const newPlants = plants.map(plant => 
      plant.id === id ? { ...plant, ...updates } : plant
    );
    await savePlants(newPlants);
  };

  const deletePlant = async (id) => {
    const newPlants = plants.filter(plant => plant.id !== id);
    await savePlants(newPlants);
  };

  const addPhoto = async (plantId, photoUri) => {
    const photo = {
      id: Date.now().toString(),
      uri: photoUri,
      timestamp: new Date().toISOString()
    };
    
    const newPlants = plants.map(plant => {
      if (plant.id === plantId) {
        return {
          ...plant,
          photos: [...(plant.photos || []), photo]
        };
      }
      return plant;
    });
    
    await savePlants(newPlants);
  };

  const logCare = async (plantId, careType) => {
    const careEntry = {
      id: Date.now().toString(),
      type: careType,
      timestamp: new Date().toISOString()
    };
    
    const newPlants = plants.map(plant => {
      if (plant.id === plantId) {
        return {
          ...plant,
          careLog: [...(plant.careLog || []), careEntry],
          lastWatered: careType === 'water' ? new Date().toISOString() : plant.lastWatered,
          lastFertilized: careType === 'fertilize' ? new Date().toISOString() : plant.lastFertilized
        };
      }
      return plant;
    });
    
    await savePlants(newPlants);
  };

  return {
    plants,
    loading,
    addPlant,
    updatePlant,
    deletePlant,
    addPhoto,
    logCare
  };
};