import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { localStorageService } from './localStorageService';

// Keys used in AsyncStorage that we want to export/import
const EXPORTABLE_KEY_PREFIXES = [
  'food_logs_',
  'companion_',
];

export const dataManager = {
  /**
   * Export all user data to a JSON file
   */
  exportData: async (userId: string): Promise<boolean> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filter keys to include only ones with our prefixes and this user's data
      const userKeys = allKeys.filter(key => 
        EXPORTABLE_KEY_PREFIXES.some(prefix => key.startsWith(prefix)) && 
        key.includes(userId)
      );
      
      // Get all data for these keys
      const keyValuePairs = await AsyncStorage.multiGet(userKeys);
      
      // Create export object
      const exportData = {
        userId,
        timestamp: new Date().toISOString(),
        data: keyValuePairs.reduce((acc, [key, value]) => {
          acc[key] = value ? JSON.parse(value) : null;
          return acc;
        }, {} as Record<string, any>)
      };
      
      // Convert to JSON string
      const exportString = JSON.stringify(exportData, null, 2);
      
      // Create a temporary file
      const fileName = `bitebuddy_export_${new Date().getTime()}.json`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Write to file
      await FileSystem.writeAsStringAsync(filePath, exportString, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Share the file
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export BiteBuddy Data'
        });
        return true;
      } else {
        console.error('Sharing is not available on this device');
        return false;
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      return false;
    }
  },
  
  /**
   * Import user data from a JSON file
   */
  importData: async (userId: string): Promise<boolean> => {
    try {
      // Let user pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return false;
      }
      
      // Read the file content
      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      
      // Parse JSON
      const importData = JSON.parse(fileContent);
      
      // Validate data structure
      if (!importData || !importData.data || typeof importData.data !== 'object') {
        throw new Error('Invalid import file format');
      }
      
      // Store each key-value pair
      const promises = Object.entries(importData.data).map(async ([key, value]) => {
        // Replace the user ID in the key with the current user's ID
        const newKey = key.replace(importData.userId, userId);
        
        // Store in AsyncStorage
        await AsyncStorage.setItem(newKey, JSON.stringify(value));
      });
      
      await Promise.all(promises);
      
      // Refresh local data
      const foodLogs = await localStorageService.food.getAll(userId);
      console.log(`Imported ${foodLogs.length} food logs`);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}; 