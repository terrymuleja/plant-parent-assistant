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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { plant } = route.params;
  const { updatePlant, deletePlant  } = usePlants();
  
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
    { label: t('locations.living-room'), value: 'living-room' },
    { label: t('locations.bedroom'), value: 'bedroom' },
    { label: t('locations.kitchen'), value: 'kitchen' },
    { label: t('locations.bathroom'), value: 'bathroom' },
    { label: t('locations.office'), value: 'office' },
    { label: t('locations.balcony'), value: 'balcony' },
    { label: t('locations.garden'), value: 'garden' },
    { label: t('locations.other'), value: 'other' },
  ];

  const wateringOptions = [
    { label: t('watering.daily'), value: '1' },
    { label: t('watering.every2-3days'), value: '3' },
    { label: t('watering.weekly'), value: '7' },
    { label: t('watering.biweekly'), value: '14' },
    { label: t('watering.monthly'), value: '30' },
  ];

  const fertilizingOptions = [
    { label: t('fertilizing.biweekly'), value: '14' },
    { label: t('fertilizing.monthly'), value: '30' },
    { label: t('fertilizing.bimonthly'), value: '60' },
    { label: t('fertilizing.seasonally'), value: '90' },
    { label: t('fertilizing.never'), value: '365' },
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t('alerts.error'), t('alerts.plantNameRequired'));
      return;
    }

    setLoading(true);
    try {
      await updatePlant(plant.id, formData);
      Alert.alert(
        t('editPlant.successTitle'), 
        t('editPlant.successMessage'),
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.failedToUpdate'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('editPlant.deleteConfirmTitle'),
      t('editPlant.deleteConfirmMessage', { plantName: plant.name }),
      [
        { text: t('common.cancel'), style: "cancel" },
        { 
          text: t('editPlant.delete'), 
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlant(plant.id);
              navigation.navigate('PlantList');
            } catch (error) {
              Alert.alert(t('alerts.error'), t('alerts.failedToDelete'));
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{t('editPlant.title', { plantName: plant.name })}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('addPlant.plantNameRequired')}</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder={t('addPlant.plantNamePlaceholder')}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('addPlant.species')}</Text>
          <TextInput
            style={styles.textInput}
            value={formData.species}
            onChangeText={(text) => setFormData({ ...formData, species: text })}
            placeholder={t('addPlant.speciesPlaceholder')}
          />
        </View>

        <SelectInput
          label={t('addPlant.location')}
          value={formData.location}
          options={locationOptions}
          onSelect={(value) => setFormData({ ...formData, location: value })}
        />

        <Text style={styles.sectionTitle}>{t('addPlant.careSchedule')}</Text>
        
        <SelectInput
          label={t('addPlant.wateringFrequency')}
          value={formData.wateringFrequency}
          options={wateringOptions}
          onSelect={(value) => setFormData({ ...formData, wateringFrequency: value })}
        />

        <SelectInput
          label={t('addPlant.fertilizingFrequency')}
          value={formData.fertilizingFrequency}
          options={fertilizingOptions}
          onSelect={(value) => setFormData({ ...formData, fertilizingFrequency: value })}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('addPlant.notes')}</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder={t('addPlant.notesPlaceholder')}
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
              {loading ? t('editPlant.updating') : t('editPlant.saveChanges')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={16} color="#ef4444" />
            <Text style={styles.deleteButtonText}>{t('editPlant.deletePlant')}</Text>
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
    color: '#111827'
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