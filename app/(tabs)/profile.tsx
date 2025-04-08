import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch, ActivityIndicator, Platform, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useCompanionStore, useFoodStore } from '../../lib/stores';
import { localStorageService } from '../../lib/storage/localStorageService';
import { dataManager } from '../../lib/storage/dataManager';

// Custom header component to match the style of other tab headers
const CustomHeader = ({ title }: { title: string }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { foodLogs, fetchFoodLogs } = useFoodStore();
  const [isClearing, setIsClearing] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(2000);

  // Create a mock user for testing if no real user exists
  const currentUser = user || {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'Test User',
    created_at: new Date().toISOString(),
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      router.replace('/auth/login');
    } else {
      Alert.alert('Error', result.error || 'Failed to sign out');
    }
  };

  const clearAllFoodLogs = async () => {
    Alert.alert(
      'Clear Food Logs',
      'Are you sure you want to delete all your food logs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await localStorageService.food.clear(currentUser.id);
              await fetchFoodLogs(currentUser.id); // Refresh logs (should be empty now)
              Alert.alert('Success', 'All food logs have been cleared.');
            } catch (error) {
              console.error('Error clearing food logs:', error);
              Alert.alert('Error', 'Failed to clear food logs');
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const resetCompanion = async () => {
    Alert.alert(
      'Reset Companion',
      'Are you sure you want to reset your companion to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              const { createCompanion } = useCompanionStore.getState();
              await createCompanion(currentUser.id, 'Buddy');
              Alert.alert('Success', 'Your companion has been reset.');
            } catch (error) {
              console.error('Error resetting companion:', error);
              Alert.alert('Error', 'Failed to reset companion');
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const exportUserData = async () => {
    try {
      setIsClearing(true); // Reuse the loading state
      const success = await dataManager.exportData(currentUser.id);
      
      if (success) {
        Alert.alert('Success', 'Your data has been exported successfully.');
      } else {
        Alert.alert('Error', 'Failed to export data. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'An unexpected error occurred while exporting data.');
    } finally {
      setIsClearing(false);
    }
  };

  const importUserData = async () => {
    Alert.alert(
      'Import Data',
      'Importing data will replace your current data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            try {
              setIsClearing(true);
              const success = await dataManager.importData(currentUser.id);
              
              if (success) {
                // Refresh data after import
                await fetchFoodLogs(currentUser.id);
                const { fetchCompanion } = useCompanionStore.getState();
                await fetchCompanion(currentUser.id);
                
                Alert.alert('Success', 'Your data has been imported successfully.');
              } else {
                Alert.alert('Cancelled', 'Data import was cancelled or failed.');
              }
            } catch (error) {
              console.error('Error importing data:', error);
              Alert.alert('Error', 'Failed to import data. Please ensure the file is valid.');
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  // Placeholder Navigation Functions
  const navigateToEditProfile = () => {
    router.push('/settings/edit-profile' as any);
  };
  
  const navigateToNotifications = () => {
    router.push('/settings/notifications' as any);
  };
  
  const navigateToPrivacy = () => {
    router.push('/settings/privacy' as any);
  };

  const navigateToAbout = () => {
    router.push('/settings/about' as any);
  };

  const navigateToHelp = () => {
    router.push('/settings/help' as any);
  };

  const navigateToSettings = () => {
    router.push('/settings/general' as any);
  };
  
  const navigateToPhysicalDetails = () => {
    router.push('/settings/physical-details' as any);
  };
  
  const editCalorieGoal = () => {
    Alert.prompt(
      'Daily Calorie Goal',
      'Enter your target daily calorie intake:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (value) => {
            const newGoal = parseInt(value || '2000', 10);
            if (!isNaN(newGoal) && newGoal > 0) {
              setCalorieGoal(newGoal);
              Alert.alert('Success', 'Daily calorie goal updated successfully!');
            } else {
              Alert.alert('Error', 'Please enter a valid number greater than 0');
            }
          }
        }
      ],
      'plain-text',
      calorieGoal.toString()
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Add the custom header */}
      <CustomHeader title="Profile" />
      
      <ScrollView style={styles.container}>
        {/* Remove the Avatar/Username section */}
        
        {/* Personal Plan Section - add a firstSection class to the first section */}
        <View style={[styles.sectionContainer, styles.firstSection]}>
          <Text style={styles.sectionTitle}>Personal Plan</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={editCalorieGoal}>
            <Ionicons name="flame-outline" size={24} color="#FF6B6B" style={styles.menuIcon} />
            <Text style={styles.menuText}>Daily Calorie Goal</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{calorieGoal} kcal</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToEditProfile}>
            <Ionicons name="person-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Account Details</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToPhysicalDetails}>
            <Ionicons name="body-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Physical Details</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToNotifications}>
            <Ionicons name="notifications-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToPrivacy}>
            <Ionicons name="lock-closed-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
        
        {/* App Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>App</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToAbout}>
            <Ionicons name="information-circle-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>About</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToHelp}>
            <Ionicons name="help-circle-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Help</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
        
        {/* Data Management Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>Save your food logs and companion data</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dataActionButton, isClearing && styles.disabledButton]}
              onPress={exportUserData}
              disabled={isClearing}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Export</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Import Data</Text>
              <Text style={styles.settingDescription}>Restore from a backup file</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dataActionButton, isClearing && styles.disabledButton]}
              onPress={importUserData}
              disabled={isClearing}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Import</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Clear Food Logs</Text>
              <Text style={styles.settingDescription}>Delete all your food logging history</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dataActionButton, styles.clearButton, isClearing && styles.disabledButton]}
              onPress={clearAllFoodLogs}
              disabled={isClearing}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Clear</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Reset Companion</Text>
              <Text style={styles.settingDescription}>Reset your buddy to default state</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dataActionButton, styles.clearButton, isClearing && styles.disabledButton]}
              onPress={resetCompanion}
              disabled={isClearing}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Reset</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
        
        {/* Version Text */}
        <Text style={styles.versionText}>BiteBuddy v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    backgroundColor: '#f9f9f9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#888',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
  dataActionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginBottom: 30,
    marginTop: 8,
  },
  firstSection: {
    marginTop: 24,
  },
}); 