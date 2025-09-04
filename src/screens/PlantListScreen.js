 
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
import { usePlants } from '../hooks/usePlants';

const PlantCard = ({ plant, onPress }) => {
  const daysSinceWatered = plant.lastWatered 
    ? Math.floor((Date.now() - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24))
    : null;

  const needsWater = !daysSinceWatered || daysSinceWatered >= parseInt(plant.wateringFrequency || 7);
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
          <Text style={styles.plantName}>{plant.name}</Text>
          {plant.species && <Text style={styles.plantSpecies}>{plant.species}</Text>}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: needsWater ? '#ef4444' : '#22c55e' }]}>
              <Text style={styles.statusText}>
                {daysSinceWatered ? `${daysSinceWatered}d ago` : 'Never watered'}
              </Text>
            </View>
            {plant.photos?.length > 0 && (
              <View style={styles.photoBadge}>
                <Text style={styles.photoText}>{plant.photos.length} photos</Text>
              </View>
            )}
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
};

export default function PlantListScreen({ navigation }) {
  const { plants, loading } = usePlants();

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
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  photoBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoText: {
    color: '#1d4ed8',
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
