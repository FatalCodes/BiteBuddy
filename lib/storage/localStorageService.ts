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
        let companion = await localStorageService.companion.get(userId);
        if (!companion) {
          companion = await localStorageService.companion.createDefault(userId);
          if (!companion) return false;
        }
        const healthChange = foodData.health_score ? (foodData.health_score - 5) / 10 : 0;
        const energyChange = foodData.calories / 500; 
        const updatedCompanion = {
          ...companion,
          health: Math.min(100, Math.max(0, companion.health + healthChange)), // Assuming stats are 0-100 now
          energy: Math.min(100, Math.max(0, companion.energy + energyChange)), // Assuming stats are 0-100 now
          last_updated: new Date().toISOString()
        };
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
          health: 50, // Default to 50 for 0-100 scale
          happiness: 50,
          energy: 50,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        };
        await localStorageService.companion.save(userId, newCompanion);
        return newCompanion;
      } catch (error) {
        console.error('Error creating default companion:', error);
        return null;
      }
    },

    // ADDED updateEnergy method
    updateEnergy: async (userId: string, newEnergy: number): Promise<boolean> => {
      try {
        const currentCompanion = await localStorageService.companion.get(userId);
        if (currentCompanion) {
          const clampedEnergy = Math.max(0, Math.min(newEnergy, 100));
          const updatedCompanion: Companion = {
            ...currentCompanion,
            energy: clampedEnergy,
            last_updated: new Date().toISOString(),
          };
          return await localStorageService.companion.save(userId, updatedCompanion);
        }
        console.warn(`localStorageService: Companion not found for user ${userId} during updateEnergy.`);
        return false; // Companion not found
      } catch (error) {
        console.error("localStorageService: Error in updateEnergy", error);
        return false;
      }
    },

    // New generic update method for partial updates
    updateStats: async (userId: string, statsToUpdate: Partial<Pick<Companion, 'health' | 'happiness' | 'energy'>>): Promise<boolean> => {
      try {
        const currentCompanion = await localStorageService.companion.get(userId);
        if (currentCompanion) {
          const updatedCompanion: Companion = {
            ...currentCompanion,
            ...statsToUpdate, // Merge new stats
            // Ensure stats are clamped if they are being updated
            health: statsToUpdate.health !== undefined ? Math.max(0, Math.min(statsToUpdate.health, 100)) : currentCompanion.health,
            happiness: statsToUpdate.happiness !== undefined ? Math.max(0, Math.min(statsToUpdate.happiness, 100)) : currentCompanion.happiness,
            energy: statsToUpdate.energy !== undefined ? Math.max(0, Math.min(statsToUpdate.energy, 100)) : currentCompanion.energy,
            last_updated: new Date().toISOString(),
          };
          return await localStorageService.companion.save(userId, updatedCompanion);
        }
        console.warn(`localStorageService: Companion not found for user ${userId} during updateStats.`);
        return false;
      } catch (error) {
        console.error("localStorageService: Error in updateStats", error);
        return false;
      }
    }
  }
}; 