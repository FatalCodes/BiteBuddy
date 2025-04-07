import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    mealReminders: true,
    waterReminders: false,
    companionUpdates: true,
    weeklyReport: true,
    appUpdates: false
  });

  const toggleSwitch = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const saveSettings = () => {
    Alert.alert('Success', 'Notification settings saved successfully!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={24} color="#3498db" />
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable Push Notifications</Text>
              <Text style={styles.settingDescription}>Allow BiteBuddy to send you notifications</Text>
            </View>
            <Switch
              trackColor={{ false: '#d0d0d0', true: '#bde0fe' }}
              thumbColor={notificationSettings.pushEnabled ? '#3498db' : '#f4f3f4'}
              ios_backgroundColor="#d0d0d0"
              onValueChange={() => toggleSwitch('pushEnabled')}
              value={notificationSettings.pushEnabled}
            />
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Meal Reminders</Text>
              <Text style={styles.settingDescription}>Receive reminders to log your meals</Text>
            </View>
            <Switch
              trackColor={{ false: '#d0d0d0', true: '#bde0fe' }}
              thumbColor={notificationSettings.mealReminders ? '#3498db' : '#f4f3f4'}
              ios_backgroundColor="#d0d0d0"
              onValueChange={() => toggleSwitch('mealReminders')}
              value={notificationSettings.mealReminders}
            />
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Water Intake Reminders</Text>
              <Text style={styles.settingDescription}>Reminders to track your water consumption</Text>
            </View>
            <Switch
              trackColor={{ false: '#d0d0d0', true: '#bde0fe' }}
              thumbColor={notificationSettings.waterReminders ? '#3498db' : '#f4f3f4'}
              ios_backgroundColor="#d0d0d0"
              onValueChange={() => toggleSwitch('waterReminders')}
              value={notificationSettings.waterReminders}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#3498db" />
            <Text style={styles.sectionTitle}>Updates & Reports</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Companion Updates</Text>
              <Text style={styles.settingDescription}>Notifications about your companion's status</Text>
            </View>
            <Switch
              trackColor={{ false: '#d0d0d0', true: '#bde0fe' }}
              thumbColor={notificationSettings.companionUpdates ? '#3498db' : '#f4f3f4'}
              ios_backgroundColor="#d0d0d0"
              onValueChange={() => toggleSwitch('companionUpdates')}
              value={notificationSettings.companionUpdates}
            />
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Report</Text>
              <Text style={styles.settingDescription}>Receive weekly nutrition summary</Text>
            </View>
            <Switch
              trackColor={{ false: '#d0d0d0', true: '#bde0fe' }}
              thumbColor={notificationSettings.weeklyReport ? '#3498db' : '#f4f3f4'}
              ios_backgroundColor="#d0d0d0"
              onValueChange={() => toggleSwitch('weeklyReport')}
              value={notificationSettings.weeklyReport}
            />
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>App Updates</Text>
              <Text style={styles.settingDescription}>Notifications about new features and updates</Text>
            </View>
            <Switch
              trackColor={{ false: '#d0d0d0', true: '#bde0fe' }}
              thumbColor={notificationSettings.appUpdates ? '#3498db' : '#f4f3f4'}
              ios_backgroundColor="#d0d0d0"
              onValueChange={() => toggleSwitch('appUpdates')}
              value={notificationSettings.appUpdates}
            />
          </View>
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save Preferences</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
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