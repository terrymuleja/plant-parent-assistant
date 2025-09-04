 
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
  const { plant } = route.params;
  const { logCare, addPhoto } = usePlants();

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
      'Add Photo',
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

  const latestPhoto = plant.photos?.[plant.photos.length - 1];

  return (
    <SafeAreaView style={detailStyles.container}>
      <ScrollView contentContainerStyle={detailStyles.scrollContainer}>
        {/* Plant Header */}
        <View style={detailStyles.header}>
          {latestPhoto ? (
            <Image source={{ uri: latestPhoto.uri }} style={detailStyles.plantImage} />
          ) : (
            <View style={detailStyles.placeholderImage}>
              <Ionicons name="leaf" size={64} color="#22c55e" />
            </View>
          )}
          <Text style={detailStyles.plantName}>{plant.name}</Text>
          {plant.species && <Text style={detailStyles.plantSpecies}>{plant.species}</Text>}
          {plant.location && (
            <View style={detailStyles.locationBadge}>
              <Ionicons name="location" size={16} color="#1d4ed8" />
              <Text style={detailStyles.locationText}>{plant.location}</Text>
            </View>
          )}
        </View>

        {/* Care Status */}
        <View style={detailStyles.card}>
          <Text style={detailStyles.cardTitle}>Care Status</Text>
          <View style={detailStyles.statusRow}>
            <View style={detailStyles.statusItem}>
              <Ionicons name="water" size={20} color="#3b82f6" />
              <Text style={detailStyles.statusLabel}>Watering</Text>
            </View>
            <View style={[detailStyles.statusBadge, { backgroundColor: needsWater ? '#ef4444' : '#22c55e' }]}>
              <Text style={detailStyles.statusBadgeText}>
                {daysSinceWatered ? `${daysSinceWatered}d ago` : 'Never'}
              </Text>
            </View>
          </View>
          
          <View style={detailStyles.statusRow}>
            <View style={detailStyles.statusItem}>
              <Ionicons name="nutrition" size={20} color="#f59e0b" />
              <Text style={detailStyles.statusLabel}>Fertilizing</Text>
            </View>
            <View style={[detailStyles.statusBadge, { backgroundColor: needsFertilizer ? '#ef4444' : '#22c55e' }]}>
              <Text style={detailStyles.statusBadgeText}>
                {daysSinceFertilized ? `${daysSinceFertilized}d ago` : 'Never'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={detailStyles.card}>
          <Text style={detailStyles.cardTitle}>Quick Actions</Text>
          <View style={detailStyles.actionRow}>
            <TouchableOpacity 
              style={[detailStyles.actionButton, { backgroundColor: needsWater ? '#3b82f6' : '#6b7280' }]}
              onPress={() => handleCareAction('water')}
            >
              <Ionicons name="water" size={20} color="white" />
              <Text style={detailStyles.actionButtonText}>Water</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[detailStyles.actionButton, { backgroundColor: needsFertilizer ? '#f59e0b' : '#6b7280' }]}
              onPress={() => handleCareAction('fertilize')}
            >
              <Ionicons name="nutrition" size={20} color="white" />
              <Text style={detailStyles.actionButtonText}>Fertilize</Text>
            </TouchableOpacity>
          </View>
          
          <View style={detailStyles.actionRow}>
            <TouchableOpacity 
              style={detailStyles.actionButtonOutline}
              onPress={handleAddPhoto}
            >
              <Ionicons name="camera" size={20} color="#6b7280" />
              <Text style={detailStyles.actionButtonOutlineText}>Add Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={detailStyles.actionButtonOutline}
              onPress={() => navigation.navigate('PhotoTimeline', { plant })}
            >
              <Ionicons name="images" size={20} color="#6b7280" />
              <Text style={detailStyles.actionButtonOutlineText}>
                Timeline ({plant.photos?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plant Info */}
        {plant.notes && (
          <View style={detailStyles.card}>
            <Text style={detailStyles.cardTitle}>Notes</Text>
            <Text style={detailStyles.notesText}>{plant.notes}</Text>
          </View>
        )}

        {/* Care Schedule */}
        <View style={detailStyles.card}>
          <Text style={detailStyles.cardTitle}>Care Schedule</Text>
          <Text style={detailStyles.scheduleText}>
            💧 Water every {plant.wateringFrequency} days
          </Text>
          <Text style={detailStyles.scheduleText}>
            🌱 Fertilize every {plant.fertilizingFrequency} days
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const detailStyles = StyleSheet.create({
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
