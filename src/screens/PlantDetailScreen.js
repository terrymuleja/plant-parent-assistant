import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePlants } from '../hooks/usePlants';

export default function PlantDetailScreen({ route, navigation }) {
  const { plant: routePlant } = route.params;
  const { plants, logCare, addPhoto } = usePlants();
  
  // Get fresh plant data from the hook instead of stale route params
  const plant = plants.find(p => p.id === routePlant.id) || routePlant;
  console.log('Rendering details for plant:', plant);
  // Use the same time calculation logic as PlantListScreen
  const getTimeDisplay = (lastCareTime) => {
    if (!lastCareTime) return 'Never';
    
    const now = Date.now();
    const careTime = new Date(lastCareTime).getTime();
    const diffMs = now - careTime;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (lastCareTime, frequencyDays) => {
    if (!lastCareTime) return '#ef4444'; // Red for never
    
    const daysSince = Math.floor((Date.now() - new Date(lastCareTime)) / (1000 * 60 * 60 * 24));
    const frequency = parseInt(frequencyDays || 7);
    
    if (daysSince >= frequency) return '#ef4444'; // Red - overdue
    if (daysSince >= frequency * 0.8) return '#f59e0b'; // Orange - due soon
    return '#22c55e'; // Green - all good
  };

  // Calculate status using the same logic
  const waterTimeDisplay = getTimeDisplay(plant.lastWatered);
  const fertTimeDisplay = getTimeDisplay(plant.lastFertilized);
  
  const waterColor = getStatusColor(plant.lastWatered, plant.wateringFrequency);
  const fertColor = getStatusColor(plant.lastFertilized, plant.fertilizingFrequency);

  // Determine if care is needed
  const daysSinceWatered = plant.lastWatered 
    ? Math.floor((Date.now() - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24))
    : null;

  const daysSinceFertilized = plant.lastFertilized 
    ? Math.floor((Date.now() - new Date(plant.lastFertilized)) / (1000 * 60 * 60 * 24))
    : null;

  const needsWater = !daysSinceWatered || daysSinceWatered >= parseInt(plant.wateringFrequency);
  const needsFertilizer = !daysSinceFertilized || daysSinceFertilized >= parseInt(plant.fertilizingFrequency);

  const handleCareAction = async (careType) => {
    Alert.alert(
      'Mark as ' + (careType === 'water' ? 'watered' : 'fertilized') + '?',
      'This will update your care log.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            await logCare(plant.id, careType);
            Alert.alert('Success', `${plant.name} has been ${careType === 'water' ? 'watered' : 'fertilized'}!`);
          }
        }
      ]
    );
  };

  const handleAddPhoto = () => {
    Alert.alert(
      'Take New Photo',
      'Choose how to add a new photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: takePicture },
        { text: 'Gallery', onPress: pickImage }
      ]
    );
  };

  const takePicture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      await addPhoto(plant.id, result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      await addPhoto(plant.id, result.assets[0].uri);
    }
  };

  // Get the latest photo from photos array (now consistent across all screens)
  const latestPhoto = plant.photos?.[plant.photos.length - 1];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Plant Header */}
        <View style={styles.header}>
          {latestPhoto ? (
            <Image source={{ uri: latestPhoto.uri }} style={styles.plantImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="leaf" size={64} color="#22c55e" />
            </View>
          )}
          <Text style={styles.plantName}>{plant.name}</Text>
          {plant.species && <Text style={styles.plantSpecies}>{plant.species}</Text>}
          {plant.location && (
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={16} color="#1d4ed8" />
              <Text style={styles.locationText}>{plant.location}</Text>
            </View>
          )}
        </View>

        {/* Care Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Care Status</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Ionicons name="water" size={20} color="#3b82f6" />
              <Text style={styles.statusLabel}>Watering</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: waterColor }]}>
              <Text style={styles.statusBadgeText}>{waterTimeDisplay}</Text>
            </View>
          </View>
          
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Ionicons name="nutrition" size={20} color="#f59e0b" />
              <Text style={styles.statusLabel}>Fertilizing</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: fertColor }]}>
              <Text style={styles.statusBadgeText}>{fertTimeDisplay}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: needsWater ? '#3b82f6' : '#6b7280' }]}
              onPress={() => handleCareAction('water')}
            >
              <Ionicons name="water" size={20} color="white" />
              <Text style={styles.actionButtonText}>Water</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: needsFertilizer ? '#f59e0b' : '#6b7280' }]}
              onPress={() => handleCareAction('fertilize')}
            >
              <Ionicons name="nutrition" size={20} color="white" />
              <Text style={styles.actionButtonText}>Fertilize</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionButtonOutline}
              onPress={handleAddPhoto}
            >
              <Ionicons name="camera" size={20} color="#6b7280" />
              <Text style={styles.actionButtonOutlineText}>New Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButtonOutline}
              onPress={() => navigation.navigate('PhotoTimeline', { plant })}
            >
              <Ionicons name="images" size={20} color="#6b7280" />
              <Text style={styles.actionButtonOutlineText}>
                Timeline ({plant.photos?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plant Info */}
        {plant.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{plant.notes}</Text>
          </View>
        )}

        {/* Care Schedule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Care Schedule</Text>
          <Text style={styles.scheduleText}>
            💧 Water every {plant.wateringFrequency} days
          </Text>
          <Text style={styles.scheduleText}>
            🌱 Fertilize every {plant.fertilizingFrequency} days
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  plantImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginBottom: 16,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  plantSpecies: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  locationText: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 8,
  },
  actionButtonOutlineText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  scheduleText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
});