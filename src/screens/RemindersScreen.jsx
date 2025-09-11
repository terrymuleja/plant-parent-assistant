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

export default function RemindersScreen({ navigation }) {
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
      `${reminder.type === 'water' ? 'Water' : 'Fertilize'} ${reminder.plant.name}?`,
      `What would you like to do?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Go to Plant', 
          onPress: () => {
            navigation.navigate('PlantDetail', { plant: reminder.plant });
          },
          style: 'default'
        },
        { 
          text: 'Snooze 2hrs', 
          onPress: () => {
            // You could implement snooze logic here
            Alert.alert('Snoozed', `Will remind you about ${reminder.plant.name} in 2 hours`);
          }
        },
        { 
          text: 'Already Done', 
          onPress: () => {
            // Second confirmation for actual completion
            Alert.alert(
              'Confirm Care Completed',
              `⚠️ Only mark as done if you have ACTUALLY ${reminder.type === 'water' ? 'watered' : 'fertilized'} ${reminder.plant.name}.\n\nThis will update your care log and remove this reminder.`,
              [
                { text: 'No, Cancel', style: 'cancel' },
                { 
                  text: 'Yes, I Did It', 
                  onPress: async () => {
                    try {
                      await logCare(reminder.plantId, reminder.type);
                      Alert.alert('✅ Care Logged', `${reminder.plant.name} has been marked as ${reminder.type === 'water' ? 'watered' : 'fertilized'}!`);
                      generateReminders();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to log care');
                    }
                  },
                  style: 'default'
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handlePlantPress = (plant) => {
    navigation.navigate('Plants', { 
      screen: 'PlantDetail', 
      params: { plant } 
    });
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
      <TouchableOpacity 
        style={styles.reminderCard}
        onPress={() => handlePlantPress(item.plant)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {latestPhoto ? (
            <Image source={{ uri: latestPhoto.uri }} style={styles.plantImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="leaf" size={24} color="#22c55e" />
            </View>
          )}
          
          <View style={styles.reminderInfo}>
            <View style={styles.reminderHeader}>
              <Ionicons 
                name={item.icon} 
                size={16} 
                color={item.color} 
              />
              <Text style={styles.reminderTitle}>{item.title}</Text>
            </View>
            <Text style={styles.reminderDescription}>{item.description}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
                <Text style={styles.urgencyText}>{item.urgency} priority</Text>
              </View>
              <Text style={styles.tapHint}>Tap for details</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: item.color }]}
            onPress={(e) => {
              e.stopPropagation(); // Prevent card press
              handleCareAction(item);
            }}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.actionButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Care Reminders</Text>
        <Text style={styles.headerSubtitle}>
          {reminders.length} plants need attention • Tap cards for details
        </Text>
      </View>
      
      <FlatList
        data={reminders}
        renderItem={renderReminder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>
              Your plants are well cared for
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  tapHint: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
    gap: 4,
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