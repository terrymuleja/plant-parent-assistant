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
import { useTranslation } from 'react-i18next';
import { usePlants } from '../hooks/usePlants';
import { useFocusEffect } from '@react-navigation/native';

export default function PlantDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { plant: routePlant } = route.params;
  const { plants, logCare, addPhoto, loadPlants } = usePlants();
  
  useFocusEffect(
  React.useCallback(() => {
    loadPlants();
  }, [loadPlants])
);

  const plant = plants.find(p => p.id === routePlant.id) || routePlant;

  const getTimeDisplay = (lastCareTime) => {
    if (!lastCareTime) return t('plantList.never');
    
    const now = Date.now();
    const careTime = new Date(lastCareTime).getTime();
    const diffMs = now - careTime;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (minutes < 1) return t('plantDetail.justNow');
    if (minutes < 60) return t('plantDetail.minutesAgo', { minutes });
    if (hours < 24) {
      return hours === 1 ? t('plantDetail.hourAgo', { hours }) : t('plantDetail.hoursAgo', { hours });
    }
    if (days < 7) {
      return days === 1 ? t('plantDetail.dayAgo', { days }) : t('plantDetail.daysAgo', { days });
    }
    if (days < 30) {
      return weeks === 1 ? t('plantDetail.weekAgo', { weeks }) : t('plantDetail.weeksAgo', { weeks });
    }
    return months === 1 ? t('plantDetail.monthAgo', { months }) : t('plantDetail.monthsAgo', { months });
  };

  const getStatusColor = (lastCareTime, frequencyDays) => {
    if (!lastCareTime) return '#ef4444';
    
    const daysSince = Math.floor((Date.now() - new Date(lastCareTime)) / (1000 * 60 * 60 * 24));
    const frequency = parseInt(frequencyDays || 7);
    
    if (daysSince >= frequency) return '#ef4444';
    if (daysSince >= frequency * 0.8) return '#f59e0b';
    return '#22c55e';
  };

  const waterTimeDisplay = getTimeDisplay(plant.lastWatered);
  const fertTimeDisplay = getTimeDisplay(plant.lastFertilized);
  
  const waterColor = getStatusColor(plant.lastWatered, plant.wateringFrequency);
  const fertColor = getStatusColor(plant.lastFertilized, plant.fertilizingFrequency);

  const daysSinceWatered = plant.lastWatered 
    ? Math.floor((Date.now() - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24))
    : null;

  const daysSinceFertilized = plant.lastFertilized 
    ? Math.floor((Date.now() - new Date(plant.lastFertilized)) / (1000 * 60 * 60 * 24))
    : null;

  const needsWater = !daysSinceWatered || daysSinceWatered >= parseInt(plant.wateringFrequency);
  const needsFertilizer = !daysSinceFertilized || daysSinceFertilized >= parseInt(plant.fertilizingFrequency);

  const handleCareAction = async (careType) => {
    const actionText = careType === 'water' ? t('plantDetail.watering').toLowerCase() : t('plantDetail.fertilizing').toLowerCase();
    Alert.alert(
      t('reminders.actionTitle', { action: actionText, plantName: plant.name }),
      t('reminders.confirmCareMessage', { action: actionText, plantName: plant.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('reminders.yesDidIt'), 
          onPress: async () => {
            await logCare(plant.id, careType);
            const pastTense = careType === 'water' ? t('reminders.watered') : t('reminders.fertilized');
            Alert.alert(t('editPlant.successTitle'), t('reminders.careLoggedMessage', { plantName: plant.name, action: pastTense }));
          }
        }
      ]
    );
  };

  const handleAddPhoto = () => {
    Alert.alert(
      t('addPlant.takePhoto'),
      t('reminders.actionMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('addPlant.takePhoto'), onPress: takePicture },
        { text: t('addPlant.gallery'), onPress: pickImage }
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

  const getLocationDisplay = (locationKey) => {
    if (!locationKey) return '';
    return t(`locations.${locationKey}`, locationKey);
  };

  const latestPhoto = plant.photos?.[plant.photos.length - 1];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
              <Text style={styles.locationText}>{getLocationDisplay(plant.location)}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('plantDetail.careStatus')}</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Ionicons name="water" size={20} color="#3b82f6" />
              <Text style={styles.statusLabel}>{t('plantDetail.watering')}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: waterColor }]}>
              <Text style={styles.statusBadgeText}>{waterTimeDisplay}</Text>
            </View>
          </View>
          
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Ionicons name="nutrition" size={20} color="#f59e0b" />
              <Text style={styles.statusLabel}>{t('plantDetail.fertilizing')}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: fertColor }]}>
              <Text style={styles.statusBadgeText}>{fertTimeDisplay}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('plantDetail.quickActions')}</Text>
          <View style={styles.actionRow}>
             <TouchableOpacity 
              style={styles.actionButtonOutline}
              onPress={handleAddPhoto}
            >
              <Ionicons name="camera" size={20} color="#6b7280" />
              <Text style={styles.actionButtonOutlineText}>{t('plantDetail.newPhoto')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButtonOutline}
              onPress={() => navigation.navigate('EditPlant', { plant })}
            >
              <Ionicons name="create" size={20} color="#6b7280" />
              <Text style={styles.actionButtonOutlineText}>{t('plantDetail.editPlant')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionRow}>
           <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: needsWater ? '#3b82f6' : '#6b7280' }]}
              onPress={() => handleCareAction('water')}
            >
              <Ionicons name="water" size={20} color="white" />
              <Text style={styles.actionButtonText}>{t('plantDetail.water')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: needsFertilizer ? '#f59e0b' : '#6b7280' }]}
              onPress={() => handleCareAction('fertilize')}
            >
              <Ionicons name="nutrition" size={20} color="white" />
              <Text style={styles.actionButtonText}>{t('plantDetail.fertilize')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionButtonOutline}
              onPress={() => navigation.navigate('PhotoTimeline', { plant })}
            >
              <Ionicons name="images" size={20} color="#6b7280" />
              <Text style={styles.actionButtonOutlineText}>
                {t('plantDetail.timeline')} ({plant.photos?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {plant.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('addPlant.notes')}</Text>
            <Text style={styles.notesText}>{plant.notes}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('plantDetail.careSchedule')}</Text>
          <Text style={styles.scheduleText}>
            💧 {t('plantDetail.waterEveryDays', { days: plant.wateringFrequency })}
          </Text>
          <Text style={styles.scheduleText}>
            🌱 {t('plantDetail.fertilizeEveryDays', { days: plant.fertilizingFrequency })}
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