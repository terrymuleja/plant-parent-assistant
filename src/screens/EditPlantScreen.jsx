import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlants  } from '../hooks/usePlants';

const SelectInput = ({ label, value, options, onSelect }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.selectInput} 
        onPress={() => setShowOptions(!showOptions)}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value ? options.find(opt => opt.value === value)?.label : `Select ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
      </TouchableOpacity>
      
      {showOptions && (
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.option}
              onPress={() => {
                onSelect(option.value);
                setShowOptions(false);
              }}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function EditPlantScreen({ route, navigation }) {
  const { plant } = route.params;
  const { updatePlant, deletePlant  } = usePlants();
  console.log('EditPlantScreen loaded for plant:', plant);
  const [formData, setFormData] = useState({
    name: plant.name || '',
    species: plant.species || '',
    location: plant.location || '',
    notes: plant.notes || '',
    wateringFrequency: plant.wateringFrequency || '7',
    fertilizingFrequency: plant.fertilizingFrequency || '30',
  });
  const [loading, setLoading] = useState(false);

  const locationOptions = [
    { label: 'Living Room', value: 'living-room' },
    { label: 'Bedroom', value: 'bedroom' },
    { label: 'Kitchen', value: 'kitchen' },
    { label: 'Bathroom', value: 'bathroom' },
    { label: 'Office', value: 'office' },
    { label: 'Balcony', value: 'balcony' },
    { label: 'Garden', value: 'garden' },
    { label: 'Other', value: 'other' },
  ];

  const wateringOptions = [
    { label: 'Every day', value: '1' },
    { label: 'Every 2-3 days', value: '3' },
    { label: 'Weekly', value: '7' },
    { label: 'Every 2 weeks', value: '14' },
    { label: 'Monthly', value: '30' },
  ];

  const fertilizingOptions = [
    { label: 'Every 2 weeks', value: '14' },
    { label: 'Monthly', value: '30' },
    { label: 'Every 2 months', value: '60' },
    { label: 'Seasonally', value: '90' },
    { label: 'Never', value: '365' },
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Plant name is required");
      return;
    }

    setLoading(true);
    try {
      await updatePlant(plant.id, formData);
      Alert.alert(
        "Success", 
        "Plant updated successfully!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update plant");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Plant",
      `Are you sure you want to delete ${plant.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlant(plant.id);
              navigation.navigate('PlantList');
            } catch (error) {
              Alert.alert("Error", "Failed to delete plant");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Edit {plant.name}</Text>

        {/* Basic Info */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Plant Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g., My Fiddle Leaf Fig"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Species</Text>
          <TextInput
            style={styles.textInput}
            value={formData.species}
            onChangeText={(text) => setFormData({ ...formData, species: text })}
            placeholder="e.g., Ficus lyrata"
          />
        </View>

        <SelectInput
          label="Location"
          value={formData.location}
          options={locationOptions}
          onSelect={(value) => setFormData({ ...formData, location: value })}
        />

        <Text style={styles.sectionTitle}>Care Schedule</Text>
        
        <SelectInput
          label="Watering Frequency"
          value={formData.wateringFrequency}
          options={wateringOptions}
          onSelect={(value) => setFormData({ ...formData, wateringFrequency: value })}
        />

        <SelectInput
          label="Fertilizing Frequency"
          value={formData.fertilizingFrequency}
          options={fertilizingOptions}
          onSelect={(value) => setFormData({ ...formData, fertilizingFrequency: value })}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Any special care instructions or observations..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Updating...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={16} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete Plant</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  inputText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholder: {
    color: '#9ca3af',
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -8,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    backgroundColor: 'white',
    gap: 8,
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
});