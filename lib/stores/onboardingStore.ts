import { create } from 'zustand';
import { useUserProfileStore } from './userProfileStore';
import { router } from 'expo-router';

interface OnboardingData {
  age?: number;
  height?: number;
  weight?: number;
  goal_weight?: number;
  gender?: string;
  activity_level?: string;
}

interface OnboardingState {
  // Data collected through the onboarding process
  data: OnboardingData;
  isLoading: boolean;
  error: string | null;
  currentStep: number;
  
  // Action to update a single field
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  
  // Actions to update specific fields (convenience methods)
  setAge: (age: number) => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
  setGoalWeight: (weight: number) => void;
  setGender: (gender: string) => void;
  setActivityLevel: (level: string) => void;
  
  // Action to save all data at once and mark onboarding complete
  saveAllAndComplete: (userId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Action to navigate to next step
  nextStep: () => void;
  
  // Action to navigate to the appropriate screen based on current step
  navigateToNextStep: () => void;
  
  // Action to reset the store
  reset: () => void;
}

// Define the steps in the onboarding flow
const ONBOARDING_STEPS = {
  1: '/(onboarding)/select-age',
  2: '/(onboarding)/select-height',
  3: '/(onboarding)/select-weight',
  4: '/(onboarding)/select-goal-weight',
  5: '/(onboarding)/select-gender',
  6: '/(onboarding)/select-activity',
  7: '/(tabs)/' // Completion - go to main app
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  data: {},
  isLoading: false,
  error: null,
  currentStep: 1,
  
  updateField: (field, value) => {
    set((state) => ({
      data: {
        ...state.data,
        [field]: value
      }
    }));
  },
  
  setAge: (age) => get().updateField('age', age),
  setHeight: (height) => get().updateField('height', height),
  setWeight: (weight) => get().updateField('weight', weight),
  setGoalWeight: (weight) => get().updateField('goal_weight', weight),
  setGender: (gender) => get().updateField('gender', gender),
  setActivityLevel: (level) => get().updateField('activity_level', level),
  
  nextStep: () => {
    set((state) => ({
      currentStep: state.currentStep + 1
    }));
  },
  
  navigateToNextStep: () => {
    // First increase the step counter
    get().nextStep();
    
    // Get the new current step
    const nextStep = get().currentStep;
    
    // Navigate to the appropriate screen based on the step number
    if (ONBOARDING_STEPS[nextStep as keyof typeof ONBOARDING_STEPS]) {
      router.push(ONBOARDING_STEPS[nextStep as keyof typeof ONBOARDING_STEPS] as any);
    } else {
      // Fallback to main app if step is out of range
      router.replace('/(tabs)/' as any);
    }
  },
  
  saveAllAndComplete: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = get();
      
      // Get the updateProfile function from the profile store
      const { updateProfile } = useUserProfileStore.getState();
      
      // Save all data AND mark onboarding as complete in one call
      const result = await updateProfile(userId, {
        ...data,
        has_completed_onboarding: true
      });
      
      set({ isLoading: false });
      return result;
    } catch (err: any) {
      console.error("Error saving onboarding data:", err);
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },
  
  reset: () => {
    set({
      data: {},
      isLoading: false,
      error: null,
      currentStep: 1
    });
  }
})); 