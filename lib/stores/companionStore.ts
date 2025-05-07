import { create } from 'zustand';
import { Companion, FoodNutrition } from '../../types';
import { localStorageService } from '../storage/localStorageService';

interface CompanionState {
  companion: Companion | null;
  isLoading: boolean;
  error: string | null;
  fetchCompanion: (userId: string) => Promise<void>;
  createCompanion: (userId: string, name: string) => Promise<void>;
  updateCompanionMetrics: (userId: string, foodData: FoodNutrition) => Promise<void>;
  updateCompanionStats: (userId: string, newStats: Partial<Pick<Companion, 'health' | 'happiness' | 'energy'>>) => Promise<{success: boolean, error?: string}>;
}

export const useCompanionStore = create<CompanionState>((set, get) => ({
  companion: null,
  isLoading: false,
  error: null,

  // Fetch the user's companion
  fetchCompanion: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Use local storage instead of Supabase
      const companion = await localStorageService.companion.get(userId);
      
      if (companion) {
        set({ companion, isLoading: false });
      } else {
        // No companion found, create a default one
        console.log("No companion found, creating default");
        const defaultCompanion = await localStorageService.companion.createDefault(userId);
        set({ companion: defaultCompanion, isLoading: false });
      }
    } catch (err: any) {
      console.error("Error fetching companion:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  // Create a new companion
  createCompanion: async (userId: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Create a default companion with the given name
      const newCompanion = await localStorageService.companion.createDefault(userId, name);
      
      if (newCompanion) {
        set({ companion: newCompanion, isLoading: false });
      } else {
        throw new Error('Failed to create companion');
      }
    } catch (err: any) {
      console.error("Error creating companion:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  // Update companion metrics based on food consumption
  updateCompanionMetrics: async (userId: string, foodData: FoodNutrition) => {
    try {
      set({ isLoading: true, error: null });
      
      // Use local storage for companion metrics update
      const success = await localStorageService.companion.updateMetrics(userId, foodData);
      
      if (success) {
        // Refresh companion data after update
        const updatedCompanion = await localStorageService.companion.get(userId);
        set({ companion: updatedCompanion, isLoading: false });
      } else {
        throw new Error('Failed to update companion metrics via foodData');
      }
    } catch (err: any) {
      console.error("Error updating companion metrics:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  updateCompanionStats: async (userId: string, newStats: Partial<Pick<Companion, 'health' | 'happiness' | 'energy'>>) => {
    const currentCompanion = get().companion;
    if (!currentCompanion || currentCompanion.user_id !== userId) {
      console.warn("Cannot update stats: Companion not found or user ID mismatch.");
      return { success: false, error: "Companion not found or user ID mismatch." };
    }

    // Prepare the data to be updated, ensuring values are clamped
    const updatedFields: Partial<Companion> = {};
    if (newStats.health !== undefined) updatedFields.health = Math.max(0, Math.min(newStats.health, 100));
    if (newStats.happiness !== undefined) updatedFields.happiness = Math.max(0, Math.min(newStats.happiness, 100));
    if (newStats.energy !== undefined) updatedFields.energy = Math.max(0, Math.min(newStats.energy, 100));

    if (Object.keys(updatedFields).length === 0) {
      console.log("No new stats provided to update.");
      return { success: true }; // No actual update needed
    }

    // Optimistic UI update
    const optimisticallyUpdatedCompanion = { 
      ...currentCompanion, 
      ...updatedFields, 
      last_updated: new Date().toISOString() 
    };
    set({ companion: optimisticallyUpdatedCompanion });

    try {
      const success = await localStorageService.companion.updateStats(userId, updatedFields as Partial<Pick<Companion, 'health' | 'happiness' | 'energy'>>);
      if (success) {
        console.log('Companion stats updated via localStorageService:', updatedFields);
        // Optionally, re-fetch the companion to ensure full sync, or trust optimistic update.
        // set({ companion: await localStorageService.companion.get(userId) }); 
        return { success: true };
      } else {
        console.error('localStorageService failed to update stats.');
        set({ companion: currentCompanion, error: 'Failed to persist stats update.' }); // Revert optimistic
        return { success: false, error: 'Failed to persist stats update.' };
      }
    } catch (err: any) {
      console.error("Error in updateCompanionStats persistence:", err);
      set({ companion: currentCompanion, error: err.message }); // Revert optimistic
      return { success: false, error: err.message };
    }
  },
}));

// Helper functions to calculate impact of food on companion metrics
function calculateHealthImpact(food: FoodNutrition): number {
  // A healthier food has higher protein, moderate carbs, and lower fat
  // This is a simplified model - a real app would have more nuanced evaluation
  
  const proteinQuality = Math.min(food.protein / 5, 10);
  const carbPenalty = Math.max(0, food.carbs - 60) * 0.1;
  const fatPenalty = Math.max(0, food.fat - 20) * 0.15;
  
  // Calculate overall health impact
  return proteinQuality - carbPenalty - fatPenalty;
}

function calculateHappinessImpact(food: FoodNutrition): number {
  // Most foods bring some happiness, especially high-calorie foods
  // But extremely high calorie food might reduce happiness after the initial pleasure
  
  const baseHappiness = 5;
  const calorieBonus = Math.min(food.calories / 100, 8);
  const excessCaloriePenalty = Math.max(0, food.calories - 600) * 0.01;
  
  return baseHappiness + calorieBonus - excessCaloriePenalty;
}

function calculateEnergyImpact(food: FoodNutrition): number {
  // Energy comes mainly from carbs, but too many can cause a crash later
  // Protein helps provide sustained energy
  
  const carbEnergy = Math.min(food.carbs / 10, 8);
  const carbCrashPenalty = Math.max(0, food.carbs - 70) * 0.1;
  const proteinBonus = food.protein * 0.2;
  
  return carbEnergy + proteinBonus - carbCrashPenalty;
} 