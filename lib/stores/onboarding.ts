import { create } from 'zustand';
import { createProfileService, updateProfileService } from '../services/profile';

export interface OnboardingData {
  age?: number;
  height?: number;
  weight?: number;
  goal_weight?: number;
  gender?: string;
  activity_level?: string;
  step?: number;
}

interface OnboardingStore {
  // Data state
  data: OnboardingData;
  isLoading: boolean;
  error: string | null;
  
  // Step management
  step: number;
  incrementStep: () => void;
  
  // Individual field setters
  setAge: (age: number) => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
  setGoalWeight: (goalWeight: number) => void;
  setGender: (gender: string) => void;
  setActivityLevel: (activityLevel: string) => void;
  
  // Reset the store
  reset: () => void;
  
  // Save all data at once and mark onboarding complete
  saveAllAndComplete: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

// Default initial state
const initialState = {
  data: { step: 1 },
  isLoading: false,
  error: null,
  step: 1
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  // Initialize with empty data
  ...initialState,
  
  // Step management
  incrementStep: () => {
    const currentStep = get().step;
    const newStep = currentStep + 1;
    set((state) => ({ 
      step: newStep,
      data: { ...state.data, step: newStep }
    }));
  },
  
  // Individual field setters
  setAge: (age: number) => {
    set((state) => ({ data: { ...state.data, age } }));
  },
  
  setHeight: (height: number) => {
    set((state) => ({ data: { ...state.data, height } }));
  },
  
  setWeight: (weight: number) => {
    set((state) => ({ data: { ...state.data, weight } }));
  },
  
  setGoalWeight: (goalWeight: number) => {
    set((state) => ({ data: { ...state.data, goal_weight: goalWeight } }));
  },
  
  setGender: (gender: string) => {
    set((state) => ({ data: { ...state.data, gender } }));
  },
  
  setActivityLevel: (activityLevel: string) => {
    set((state) => ({ data: { ...state.data, activity_level: activityLevel } }));
  },
  
  // Reset the store to initial state
  reset: () => {
    set(initialState);
  },
  
  // Save all collected data at once and mark onboarding complete
  saveAllAndComplete: async (userId: string) => {
    const { data } = get();
    
    // Validate we have all necessary data
    if (!data.age || !data.height || !data.weight || !data.goal_weight || !data.gender || !data.activity_level) {
      return { 
        success: false, 
        error: 'Missing required onboarding data. Please complete all steps.' 
      };
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Call API to update profile with all data at once
      const result = await updateProfileService(userId, {
        age: data.age,
        height: data.height,
        weight: data.weight,
        goal_weight: data.goal_weight,
        gender: data.gender,
        activity_level: data.activity_level,
        onboarding_completed: true // Mark onboarding as complete
      });
      
      set({ isLoading: false });
      
      if (result.error) {
        set({ error: result.error });
        return { success: false, error: result.error };
      }
      
      // Reset store after successful save
      get().reset();
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }
})); 