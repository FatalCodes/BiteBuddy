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
    router.push('/settings/edit-profile' as any); // TODO: Create this screen & remove 'as any'
    console.log('Navigate to Edit Profile');
  };
  
  const navigateToNotifications = () => {
    router.push('/settings/notifications' as any); // TODO: Create this screen & remove 'as any'
    console.log('Navigate to Notifications');
  };
  
  const navigateToPrivacy = () => {
    router.push('/settings/privacy' as any);
    console.log('Navigate to Privacy Policy');
  };

  const navigateToAbout = () => {
    router.push('/settings/about' as any);
    console.log('Navigate to About');
  };

  const navigateToHelp = () => {
    router.push('/settings/help' as any);
    console.log('Navigate to Help');
  };

  const navigateToSettings = () => {
    router.push('/settings/general' as any);
    console.log('Navigate to General Settings');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Add the custom header */}
      <CustomHeader title="Profile" />
      
      <ScrollView style={styles.container}>
        {/* Avatar/Username section (previously in a header view) */}
        <View style={styles.userInfoSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(currentUser?.username?.[0] || currentUser?.email?.[0] || '?').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{currentUser?.username || currentUser?.email || 'User'}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToEditProfile}>
            <Ionicons name="person-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Edit Profile</Text>
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
              {isClearing ? <ActivityIndicator size="small" color="#3498db" /> : <Ionicons name="download-outline" size={22} color="#3498db" />}
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingDivider} />
          
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
              {isClearing ? <ActivityIndicator size="small" color="#3498db" /> : <Ionicons name="cloud-upload-outline" size={22} color="#3498db" />}
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingDivider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Clear All Food Logs</Text>
              <Text style={styles.settingDescription}>Delete all your logged meals</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dataActionButton, isClearing && styles.disabledButton]}
              onPress={clearAllFoodLogs}
              disabled={isClearing}
            >
              {isClearing ? <ActivityIndicator size="small" color="#e74c3c" /> : <Ionicons name="trash-outline" size={22} color="#e74c3c" />}
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingDivider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Reset Companion</Text>
              <Text style={styles.settingDescription}>Reset companion to default state</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dataActionButton, isClearing && styles.disabledButton]}
              onPress={resetCompanion}
              disabled={isClearing}
            >
              {isClearing ? <ActivityIndicator size="small" color="#e74c3c" /> : <Ionicons name="refresh-outline" size={22} color="#e74c3c" />}
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>BiteBuddy v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Match background
  },
  container: {
    flex: 1,
    // Removed backgroundColor here, handled by SafeAreaView
  },
  // Renamed old header section to userInfoSection
  userInfoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
    backgroundColor: '#fff', // Keep white background for this section
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#495057',
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343a40',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16, // Keep padding inside
    paddingTop: 16, // Add top padding
    paddingBottom: 8, // Reduce bottom padding slightly
    // Shadow styles (optional, adjust as needed)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d', // Subdued title color
    marginBottom: 12,
    paddingHorizontal: 0, // Remove horizontal padding from title itself
    marginLeft: 0, // Align with items
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e9ecef',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#343a40',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10, // Add some space above
    marginBottom: 10,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#adb5bd',
    fontSize: 12,
    paddingVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6c757d',
  },
  dataActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e9ecef', // Light background for button
  },
  disabledButton: {
    opacity: 0.5,
  },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e9ecef',
    marginVertical: 4, // Small vertical margin for divider
  },
  headerContainer: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    flex: 1,
  },
}); 