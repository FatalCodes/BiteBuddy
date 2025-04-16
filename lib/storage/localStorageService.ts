import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodLog, FoodNutrition, Companion } from '../../types';

// Storage keys
const STORAGE_KEYS = {
  FOOD_LOGS: 'food_logs',
  COMPANION: 'companion',
};

// Local storage service for BiteBuddy app
export const localStorageService = {
  // Food logs functions
  food: {
    // Get all food logs
    getAll: async (userId: string): Promise<FoodLog[]> => {
      try {
        const key = `${STORAGE_KEYS.FOOD_LOGS}_${userId}`;
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('Error retrieving food logs from local storage:', error);
        return [];
      }
    },

    // Add a new food log
    add: async (userId: string, foodData: FoodNutrition, imageUrl?: string): Promise<{success: boolean, error?: string, data?: FoodLog}> => {
      try {
        // Create a new food log with local ID
        const newFoodLog: FoodLog = {
          id: Date.now().toString(), // Generate a local timestamp-based ID
          user_id: userId,
          food_name: foodData.food_name,
          serving_size: foodData.serving_size,
          calories: foodData.calories,
          protein: foodData.protein,
          carbs: foodData.carbs,
          fat: foodData.fat,
          image_url: imageUrl,
          created_at: new Date().toISOString(),
          // Add additional fields from FoodNutrition that might not be in FoodLog type
          health_score: foodData.health_score,
          nutrition_notes: foodData.nutrition_notes,
          description: foodData.description,
          items_breakdown: foodData.items_breakdown,
          health_tip: foodData.health_tip,
          positive_note: foodData.positive_note
        } as FoodLog;

        // Get existing logs
        const key = `${STORAGE_KEYS.FOOD_LOGS}_${userId}`;
        const existingData = await AsyncStorage.getItem(key);
        const existingLogs: FoodLog[] = existingData ? JSON.parse(existingData) : [];

        // Add new log at the beginning
        const updatedLogs = [newFoodLog, ...existingLogs];

        // Save updated logs
        await AsyncStorage.setItem(key, JSON.stringify(updatedLogs));
        
        return {
          success: true,
          data: newFoodLog
        };
      } catch (error) {
        console.error('Error adding food log to local storage:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    // Clear all food logs (for testing/reset)
    clear: async (userId: string): Promise<void> => {
      try {
        const key = `${STORAGE_KEYS.FOOD_LOGS}_${userId}`;
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Error clearing food logs from local storage:', error);
      }
    }
  },

  // Companion functions
  companion: {
    // Get companion data
    get: async (userId: string): Promise<Companion | null> => {
      try {
        const key = `${STORAGE_KEYS.COMPANION}_${userId}`;
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Error retrieving companion from local storage:', error);
        return null;
      }
    },

    // Save companion data
    save: async (userId: string, companion: Companion): Promise<boolean> => {
      try {
        const key = `${STORAGE_KEYS.COMPANION}_${userId}`;
        await AsyncStorage.setItem(key, JSON.stringify(companion));
        return true;
      } catch (error) {
        console.error('Error saving companion to local storage:', error);
        return false;
      }
    },

    // Update companion metrics based on food
    updateMetrics: async (userId: string, foodData: FoodNutrition): Promise<boolean> => {
      try {
        // Get current companion
        let companion = await localStorageService.companion.get(userId);
        
        // If no companion exists, create a default one
        if (!companion) {
          console.log('No companion found, creating default companion for metrics update');
          companion = await localStorageService.companion.createDefault(userId);
          
          if (!companion) {
            console.error('Failed to create default companion');
            return false;
          }
        }

        // Simple algorithm to update metrics based on food
        const healthChange = foodData.health_score ? (foodData.health_score - 5) / 10 : 0;
        const energyChange = foodData.calories / 500; // More calories = more energy
        
        // Update companion with new values
        const updatedCompanion = {
          ...companion,
          health: Math.min(10, Math.max(1, companion.health + healthChange)),
          energy: Math.min(10, Math.max(1, companion.energy + energyChange)),
          last_updated: new Date().toISOString()
        };

        console.log(`Updating companion metrics - Health: ${companion.health} -> ${updatedCompanion.health}, Energy: ${companion.energy} -> ${updatedCompanion.energy}`);

        // Save updated companion
        return await localStorageService.companion.save(userId, updatedCompanion);
      } catch (error) {
        console.error('Error updating companion metrics:', error);
        return false;
      }
    },

    // Create a new companion if none exists
    createDefault: async (userId: string, name: string = 'Buddy'): Promise<Companion | null> => {
      try {
        const newCompanion: Companion = {
          id: Date.now().toString(),
          user_id: userId,
          name: name,
          health: 5,
          happiness: 5,
          energy: 5,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        };

        await localStorageService.companion.save(userId, newCompanion);
        return newCompanion;
      } catch (error) {
        console.error('Error creating default companion:', error);
        return null;
      }
    }
  }
}; 