import { create } from 'zustand';
import { supabase } from '../supabase/supabase';
import { FoodLog, FoodNutrition } from '../../types';
import { useCompanionStore } from './companionStore';
import { analyzeFoodImage } from '../utils/openai';
import { localStorageService } from '../storage/localStorageService';

interface FoodState {
  foodLogs: FoodLog[];
  isLoading: boolean;
  error: string | null;
  fetchFoodLogs: (userId: string) => Promise<void>;
  addFoodLog: (userId: string, foodData: FoodNutrition, imageUrl?: string) => Promise<{ success: boolean; error?: string }>;
  simulateAIAnalysis: (imageUri: string) => Promise<{ success: boolean; error?: string; data?: FoodNutrition }>;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foodLogs: [],
  isLoading: false,
  error: null,

  // Fetch food logs for a user
  fetchFoodLogs: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Use local storage instead of Supabase
      const logs = await localStorageService.food.getAll(userId);
      
      set({ foodLogs: logs, isLoading: false });
    } catch (err: any) {
      console.error("Error fetching food logs:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  // Add a new food log
  addFoodLog: async (userId: string, foodData: FoodNutrition, imageUrl?: string) => {
    try {
      console.log("addFoodLog called with userId:", userId);
      
      if (!userId) {
        console.error("addFoodLog: Missing userId");
        return { success: false, error: "Missing user ID" };
      }
      
      if (!foodData.food_name || !foodData.serving_size) {
        console.error("addFoodLog: Missing required food data");
        return { success: false, error: "Missing required food data" };
      }
      
      set({ isLoading: true, error: null });
      
      console.log("Adding food log with data:", JSON.stringify(foodData, null, 2));
      
      // Use local storage instead of Supabase
      const result = await localStorageService.food.add(userId, foodData, imageUrl);
      
      if (!result.success) {
        console.error("Error adding food log:", result.error);
        set({ error: result.error, isLoading: false });
        return { success: false, error: result.error };
      }
      
      console.log("Food log added successfully:", result.data);
      
      // Update local state with the new log
      if (result.data) {
        set({ 
          foodLogs: [result.data, ...get().foodLogs], 
          isLoading: false 
        });
      }

      // Update companion metrics based on food nutrition
      try {
        // Use local storage companion metrics update
        await localStorageService.companion.updateMetrics(userId, foodData);
      } catch (companionError) {
        console.error("Error updating companion metrics:", companionError);
        // Don't fail the whole operation if companion update fails
      }
      
      return { success: true };
    } catch (err: any) {
      console.error("Error adding food log:", err);
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Analyze food from image using OpenAI GPT-4 Vision API
  simulateAIAnalysis: async (imageUri: string): Promise<{ success: boolean; error?: string; data?: FoodNutrition }> => {
    set({ isLoading: true });
    
    try {
      // Use our OpenAI analysis function
      const result = await analyzeFoodImage(imageUri);
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error("Error analyzing food image:", error);
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to analyze image' });
      
      // Return error state instead of fallback data
      return { 
        success: false, 
        error: 'Failed to analyze the image. Please try again.' 
      };
    }
  }
})); 