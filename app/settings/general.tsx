import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function GeneralSettingsScreen() {
  const router = useRouter();
  
  // State for all settings
  const [settings, setSettings] = useState({
    darkMode: false,
    useMetricUnits: true,
    notifyMeals: true,
    notifyUpdates: false,
    autoBackup: true,
    language: 'English',
    calorieGoal: 2000,
  });

  // Toggle boolean settings
  const toggleSetting = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  // Change non-boolean settings
  const changeSetting = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSettings = () => {
    Alert.alert('Success', 'Settings saved successfully!');
    router.back();
  };

  const showLanguageOptions = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        { text: 'English', onPress: () => changeSetting('language', 'English') },
        { text: 'Spanish', onPress: () => changeSetting('language', 'Spanish') },
        { text: 'French', onPress: () => changeSetting('language', 'French') },
        { text: 'German', onPress: () => changeSetting('language', 'German') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const showCalorieGoalOptions = () => {
    Alert.alert(
      'Daily Calorie Goal',
      'This will open a numeric input to set your daily calorie target',
      [
        { text: 'OK' }
      ]
    );
  };

  const clearAppCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will not delete your data but may log you out.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Cache', 
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'Cache cleared successfully')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme throughout the app</Text>
            </View>
            <Switch
              trackColor={{ false: '#d0d0d0', true: '#bde0fe' }}
              thumbColor={settings.darkMode ? '#3498db' : '#f4f3f4'}
              ios_backgroundColor="#d0d0d0"
              onValueChange={() => toggleSetting('darkMode')}
              value={settings.darkMode}
            />
          </View>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.settingRow} onPress={showLanguageOptions}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingDescription}>Select app language</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{settings.language}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Units & Measurements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units & Measurements</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Use Metric Units</Text>
              <Text style={styles.settingDescription}>Display weights in grams and kilograms</Text>
            </View>
            <Switch
              trackColor={{ false: '#d0d0d0', true: '#bde0fe' }}
              thumbColor={settings.useMetricUnits ? '#3498db' : '#f4f3f4'}
              ios_backgroundColor="#d0d0d0"
              onValueChange={() => toggleSetting('useMetricUnits')}
              value={settings.useMetricUnits}
            />
          </View>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.settingRow} onPress={showCalorieGoalOptions}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Calorie Goal</Text>
              <Text style={styles.settingDescription}>Set your target calorie intake</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{settings.calorieGoal} cal</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Automatic Backup</Text>
              <Text style={styles.settingDescription}>Periodically back up your data to the cloud</Text>
            </View>
            <Switch
              trackColor={{ false: '#d0d0d0', true: '#bde0fe' }}
              thumbColor={settings.autoBackup ? '#3498db' : '#f4f3f4'}
              ios_backgroundColor="#d0d0d0"
              onValueChange={() => toggleSetting('autoBackup')}
              value={settings.autoBackup}
            />
          </View>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.settingRow} onPress={clearAppCache}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Clear App Cache</Text>
              <Text style={styles.settingDescription}>Free up storage space</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Text style={styles.clearText}>Clear</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: '#3498db',
    marginRight: 6,
  },
  buttonContainer: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearText: {
    color: '#e74c3c',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  saveButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 14,
    margin: 16,
    marginTop: 8,
    marginBottom: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 