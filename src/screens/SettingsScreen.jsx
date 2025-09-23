import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert
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

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

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

  // Load saved settings on mount
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

  const showLanguagePicker = () => {
    Alert.alert(
      t('settings.selectLanguage'),
      t('settings.languageDescription'),
      [
        ...languages.map(lang => ({
          text: `${lang.flag} ${lang.name}`,
          onPress: async () => {
            setCurrentLanguage(lang.code);
            await i18n.changeLanguage(lang.code);
            await saveSettings('app_language', lang.code);
          }
        })),
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
  };

  const showDateFormatPicker = () => {
    Alert.alert(
      t('settings.selectDateFormat'),
      t('settings.dateFormatDescription'),
      [
        ...dateFormats.map(format => ({
          text: `${format.label} (${format.region})`,
          onPress: async () => {
            setDateFormat(format.format);
            await saveSettings('date_format', format.format);
          }
        })),
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
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
            onPress={showLanguagePicker}
            icon="language"
          />
          
          <SettingItem
            title={t('settings.dateFormat')}
            value={getCurrentDateFormatLabel()}
            onPress={showDateFormatPicker}
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
});