 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlants } from '../hooks/usePlants';

export default function RemindersScreen() {
  const { plants, logCare } = usePlants();
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    generateReminders();
  }, [plants]);

  const generateReminders = () => {
    const now = Date.now();
    const reminderList = [];

    plants.forEach(plant => {
      // Water reminder
      const daysSinceWatered = plant.lastWatered 
        ? Math.floor((now - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24))
        : 999;
      
      if (daysSinceWatered >= parseInt(plant.wateringFrequency)) {
        reminderList.push({
          id: `water-${plant.id}`,
          plantId: plant.id,
          plant: plant,
          type: 'water',
          title: `Water ${plant.name}`,
          description: daysSinceWatered === 999 
            ? 'Never been watered' 
            : `Last watered ${daysSinceWatered} days ago`,
          urgency: daysSinceWatered > parseInt(plant.wateringFrequency) + 2 ? 'high' : 'medium',
          icon: 'water',
          color: '#3b82f6'
        });
      }

      // Fertilizer reminder
      const daysSinceFertilized = plant.lastFertilized 
        ? Math.floor((now - new Date(plant.lastFertilized)) / (1000 * 60 * 60 * 24))
        : 999;
      
      if (daysSinceFertilized >= parseInt(plant.fertilizingFrequency)) {
        reminderList.push({
          id: `fertilize-${plant.id}`,
          plantId: plant.id,
          plant: plant,
          type: 'fertilize',
          title: `Fertilize ${plant.name}`,
          description: daysSinceFertilized === 999 
            ? 'Never been fertilized' 
            : `Last fertilized ${daysSinceFertilized} days ago`,
          urgency: daysSinceFertilized > parseInt(plant.fertilizingFrequency) + 7 ? 'high' : 'low',
          icon: 'nutrition',
          color: '#f59e0b'
        });
      }
    });

    // Sort by urgency
    reminderList.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });

    setReminders(reminderList);
  };

  const handleCareAction = async (reminder) => {
    Alert.alert(
      'Mark as Complete',
      `Mark ${reminder.plant.name} as ${reminder.type === 'water' ? 'watered' : 'fertilized'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Done', 
          onPress: async () => {
            try {
              await logCare(reminder.plantId, reminder.type);
              Alert.alert('Success', `${reminder.plant.name} has been ${reminder.type === 'water' ? 'watered' : 'fertilized'}!`);
              generateReminders();
            } catch (error) {
              Alert.alert('Error', 'Failed to log care');
            }
          }
        }
      ]
    );
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const renderReminder = ({ item }) => {
    const latestPhoto = item.plant.photos?.[item.plant.photos.length - 1];
    
    return (
      <View style={reminderStyles.reminderCard}>
        <View style={reminderStyles.cardContent}>
          {latestPhoto ? (
            <Image source={{ uri: latestPhoto.uri }} style={reminderStyles.plantImage} />
          ) : (
            <View style={reminderStyles.placeholderImage}>
              <Ionicons name="leaf" size={24} color="#22c55e" />
            </View>
          )}
          
          <View style={reminderStyles.reminderInfo}>
            <View style={reminderStyles.reminderHeader}>
              <Ionicons 
                name={item.icon} 
                size={16} 
                color={item.color} 
              />
              <Text style={reminderStyles.reminderTitle}>{item.title}</Text>
            </View>
            <Text style={reminderStyles.reminderDescription}>{item.description}</Text>
            <View style={[reminderStyles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
              <Text style={reminderStyles.urgencyText}>{item.urgency} priority</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[reminderStyles.actionButton, { backgroundColor: item.color }]}
            onPress={() => handleCareAction(item)}
          >
            <Text style={reminderStyles.actionButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={reminderStyles.container}>
      <View style={reminderStyles.header}>
        <Text style={reminderStyles.headerTitle}>Care Reminders</Text>
        <Text style={reminderStyles.headerSubtitle}>
          {reminders.length} plants need attention
        </Text>
      </View>
      
      <FlatList
        data={reminders}
        renderItem={renderReminder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={reminderStyles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={reminderStyles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
            <Text style={reminderStyles.emptyTitle}>All caught up!</Text>
            <Text style={reminderStyles.emptyText}>
              Your plants are well cared for
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const reminderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  reminderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reminderDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#22c55e',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});