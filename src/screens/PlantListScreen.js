import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { usePlants } from '../hooks/usePlants';

const PlantCard = ({ plant, onPress }) => {
  const getTimeDisplay = (lastCareTime) => {
    if (!lastCareTime) return 'Never';
    
    const now = Date.now();
    const careTime = new Date(lastCareTime).getTime();
    const diffMs = now - careTime;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (days < 30) return `${Math.floor(days / 7)}w`;
    return `${Math.floor(days / 30)}mo`;
  };

  const getStatusColor = (lastCareTime, frequencyDays) => {
    if (!lastCareTime) return '#ef4444'; // Red for never
    
    const daysSince = Math.floor((Date.now() - new Date(lastCareTime)) / (1000 * 60 * 60 * 24));
    const frequency = parseInt(frequencyDays || 7);
    
    if (daysSince >= frequency) return '#ef4444'; // Red - overdue
    if (daysSince >= frequency * 0.8) return '#f59e0b'; // Orange - due soon
    return '#22c55e'; // Green - all good
  };

  const getCompactStatus = (lastCareTime, type, frequency) => {
    const timeDisplay = getTimeDisplay(lastCareTime);
    
    if (timeDisplay === 'Never') return 'Never';
    
    const daysSince = lastCareTime 
      ? Math.floor((Date.now() - new Date(lastCareTime)) / (1000 * 60 * 60 * 24))
      : 999;
    const freq = parseInt(frequency || (type === 'water' ? 7 : 30));
    
    if (daysSince >= freq) return `Due ${timeDisplay}`;
    return timeDisplay;
  };

  const waterColor = getStatusColor(plant.lastWatered, plant.wateringFrequency);
  const fertColor = getStatusColor(plant.lastFertilized, plant.fertilizingFrequency);
  const waterText = getCompactStatus(plant.lastWatered, 'water', plant.wateringFrequency);
  const fertText = getCompactStatus(plant.lastFertilized, 'fertiliz', plant.fertilizingFrequency);

  const latestPhoto = plant.photos?.[plant.photos.length - 1];

  return (
    <TouchableOpacity style={styles.plantCard} onPress={onPress}>
      <View style={styles.cardContent}>
        {latestPhoto ? (
          <Image source={{ uri: latestPhoto.uri }} style={styles.plantImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="leaf" size={32} color="#22c55e" />
          </View>
        )}
        
        <View style={styles.plantInfo}>
          <Text style={styles.plantName} numberOfLines={1}>{plant.name}</Text>
          {plant.species && (
            <Text style={styles.plantSpecies} numberOfLines={1}>{plant.species}</Text>
          )}
          
          <View style={styles.statusContainer}>
            {/* Water status */}
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: waterColor }]} />
              <Text style={styles.statusLabel}>💧</Text>
              <Text style={styles.statusTime} numberOfLines={1}>{waterText}</Text>
            </View>
            
            {/* Fertilizer status */}
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: fertColor }]} />
              <Text style={styles.statusLabel}>🌱</Text>
              <Text style={styles.statusTime} numberOfLines={1}>{fertText}</Text>
            </View>
          </View>
          
          {/* Photos indicator */}
          {plant.photos?.length > 0 && (
            <View style={styles.photoIndicator}>
              <Text style={styles.photoText}>📸 {plant.photos.length}</Text>
            </View>
          )}
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
};

export default function PlantListScreen({ navigation }) {
  const { plants, loading, loadPlants } = usePlants();

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadPlants();
    }, [loadPlants])
  );

  const renderPlantCard = ({ item }) => (
    <PlantCard 
      plant={item} 
      onPress={() => navigation.navigate('PlantDetail', { plant: item })}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Loading your plants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Plant Family 🌱</Text>
        <Text style={styles.headerSubtitle}>
          {plants.length} plants • Tap to view details
        </Text>
      </View>
      
      <FlatList
        data={plants}
        renderItem={renderPlantCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>
              No plants yet!{'\n'}Add your first plant to get started
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddPlant')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  plantCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantInfo: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0, // Important for text truncation
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  plantSpecies: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusContainer: {
    marginTop: 8,
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    width: 16, // Fixed width for emoji alignment
  },
  statusTime: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1, // Takes remaining space
  },
  photoIndicator: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  photoText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});