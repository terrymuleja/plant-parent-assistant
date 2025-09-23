import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingItem = ({ title, value, onPress, icon, showArrow = true }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingContent}>
      <Ionicons name={icon} size={20} color="#6b7280" style={styles.settingIcon} />
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
    </View>
    {showArrow && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
  </TouchableOpacity>
);

const LanguagePicker = ({ visible, onClose, languages, currentLanguage, onSelect, t }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubtitle}>{t('settings.languageDescription')}</Text>
        
        <ScrollView style={styles.optionsList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                currentLanguage === lang.code && styles.selectedLanguageOption
              ]}
              onPress={() => {
                onSelect(lang);
                onClose();
              }}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text style={[
                styles.languageText,
                currentLanguage === lang.code && styles.selectedLanguageText
              ]}>
                {lang.name}
              </Text>
              {currentLanguage === lang.code && (
                <Ionicons name="checkmark" size={20} color="#22c55e" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

const DateFormatPicker = ({ visible, onClose, formats, currentFormat, onSelect, t }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t('settings.selectDateFormat')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubtitle}>{t('settings.dateFormatDescription')}</Text>
        
        <ScrollView style={styles.optionsList}>
          {formats.map((format) => (
            <TouchableOpacity
              key={format.format}
              style={[
                styles.formatOption,
                currentFormat === format.format && styles.selectedFormatOption
              ]}
              onPress={() => {
                onSelect(format);
                onClose();
              }}
            >
              <View style={styles.formatInfo}>
                <Text style={[
                  styles.formatLabel,
                  currentFormat === format.format && styles.selectedFormatText
                ]}>
                  {format.label}
                </Text>
                <Text style={styles.formatRegion}>({format.region})</Text>
              </View>
              {currentFormat === format.format && (
                <Ionicons name="checkmark" size={20} color="#22c55e" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showDateFormatPicker, setShowDateFormatPicker] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const dateFormats = [
    { format: 'DD/MM/YYYY', label: '23/09/2025', region: 'European' },
    { format: 'MM/DD/YYYY', label: '09/23/2025', region: 'US' },
    { format: 'YYYY-MM-DD', label: '2025-09-23', region: 'ISO' },
    { format: 'DD MMM YYYY', label: '23 Sep 2025', region: 'Long' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('app_language');
      const savedDateFormat = await AsyncStorage.getItem('date_format');
      
      if (savedLang) setCurrentLanguage(savedLang);
      if (savedDateFormat) setDateFormat(savedDateFormat);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleLanguageSelect = async (lang) => {
    setCurrentLanguage(lang.code);
    await i18n.changeLanguage(lang.code);
    await saveSettings('app_language', lang.code);
  };

  const handleDateFormatSelect = async (format) => {
    setDateFormat(format.format);
    await saveSettings('date_format', format.format);
  };

  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang ? `${lang.flag} ${lang.name}` : 'Unknown';
  };

  const getCurrentDateFormatLabel = () => {
    const format = dateFormats.find(f => f.format === dateFormat);
    return format ? `${format.label} (${format.region})` : dateFormat;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('settings.subtitle')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.languageAndRegion')}</Text>
          
          <SettingItem
            title={t('settings.language')}
            value={getCurrentLanguageName()}
            onPress={() => setShowLanguagePicker(true)}
            icon="language"
          />
          
          <SettingItem
            title={t('settings.dateFormat')}
            value={getCurrentDateFormatLabel()}
            onPress={() => setShowDateFormatPicker(true)}
            icon="calendar"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.appPreferences')}</Text>
          
          <SettingItem
            title={t('settings.notifications')}
            value={t('settings.enabled')}
            onPress={() => Alert.alert(t('settings.comingSoon'), t('settings.notificationSettings'))}
            icon="notifications"
          />
          
          <SettingItem
            title={t('settings.theme')}
            value={t('settings.light')}
            onPress={() => Alert.alert(t('settings.comingSoon'), t('settings.darkModeSettings'))}
            icon="color-palette"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.dataAndPrivacy')}</Text>
          
          <SettingItem
            title={t('settings.exportData')}
            value=""
            onPress={() => Alert.alert(t('settings.comingSoon'), t('settings.exportDescription'))}
            icon="download"
            showArrow={false}
          />
          
          <SettingItem
            title={t('settings.clearData')}
            value=""
            onPress={() => Alert.alert(
              t('settings.clearDataConfirm'),
              t('settings.clearDataWarning'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('settings.clearAll'), style: 'destructive', onPress: () => {} }
              ]
            )}
            icon="trash"
            showArrow={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          
          <SettingItem
            title={t('settings.version')}
            value="1.0.0"
            onPress={() => {}}
            icon="information-circle"
            showArrow={false}
          />
          
          <SettingItem
            title={t('settings.support')}
            value=""
            onPress={() => Alert.alert(t('settings.comingSoon'), t('settings.supportDescription'))}
            icon="help-circle"
            showArrow={false}
          />
        </View>

      </ScrollView>

      <LanguagePicker
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        languages={languages}
        currentLanguage={currentLanguage}
        onSelect={handleLanguageSelect}
        t={t}
      />

      <DateFormatPicker
        visible={showDateFormatPicker}
        onClose={() => setShowDateFormatPicker(false)}
        formats={dateFormats}
        currentFormat={dateFormat}
        onSelect={handleDateFormatSelect}
        t={t}
      />
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
    marginBottom: 32,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingValue: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  optionsList: {
    maxHeight: 300,
  },
  // Language picker styles
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedLanguageOption: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  selectedLanguageText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  // Date format picker styles
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFormatOption: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  formatInfo: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  selectedFormatText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  formatRegion: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});