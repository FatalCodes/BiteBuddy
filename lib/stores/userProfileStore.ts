import { create } from 'zustand';
import { supabase } from '../supabase/supabase';
import { UserProfile } from '../../types';

interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
  createProfile: (userId: string, profileData: Partial<UserProfile>) => Promise<{ success: boolean; error?: string; profile?: UserProfile }>;
  updateProfile: (userId: string, profileData: Partial<UserProfile>, options?: { silent?: boolean }) => Promise<{ success: boolean; error?: string; profile?: UserProfile }>;
  markOnboardingComplete: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  // Fetch user profile
  fetchProfile: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        set({ error: error.message, isLoading: false });
        return null;
      }
      
      const profile = data as UserProfile;
      set({ profile, isLoading: false });
      return profile;
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  // Create a new user profile
  createProfile: async (userId: string, profileData: Partial<UserProfile>) => {
    try {
      set({ isLoading: true, error: null });
      
      const newProfile = {
        user_id: userId,
        display_name: profileData.display_name || null,
        age: profileData.age || null,
        height: profileData.height || null,
        weight: profileData.weight || null,
        goal_weight: profileData.goal_weight || null,
        gender: profileData.gender || null,
        activity_level: profileData.activity_level || null,
        dietary_preferences: profileData.dietary_preferences || null,
        has_completed_onboarding: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select('*')
        .single();
      
      if (error) {
        console.error("Error creating profile:", error);
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }
      
      const profile = data as UserProfile;
      set({ profile, isLoading: false });
      return { success: true, profile };
    } catch (err: any) {
      console.error("Error creating profile:", err);
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Update user profile
  updateProfile: async (userId: string, profileData: Partial<UserProfile>, options = {}) => {
    try {
      // Only set loading state if not in silent mode (used for onboarding)
      if (!options.silent) {
        set({ isLoading: true, error: null });
      }
      
      // Get the current profile from the store instead of fetching
      let profile = get().profile;
      
      // Only fetch if we don't have a profile already loaded
      if (!profile) {
        profile = await get().fetchProfile(userId);
      }
      
      if (!profile) {
        // If profile doesn't exist, create it
        return await get().createProfile(userId, profileData);
      }
      
      // Update profile
      const updateData = {
        ...profileData,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select('*')
        .single();
      
      if (error) {
        console.error("Error updating profile:", error);
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }
      
      const updatedProfile = data as UserProfile;
      
      // Silently update the profile state without triggering isLoading if in silent mode
      if (options.silent) {
        set((state) => ({ profile: updatedProfile }));
      } else {
        set({ profile: updatedProfile, isLoading: false });
      }
      
      return { success: true, profile: updatedProfile };
    } catch (err: any) {
      console.error("Error updating profile:", err);
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Mark onboarding as complete
  markOnboardingComplete: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ has_completed_onboarding: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select('has_completed_onboarding')
        .single();

      if (error) {
        console.error("Error marking onboarding complete:", error);
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }
      
      // Update local profile state if it exists
      const currentProfile = get().profile;
      if (currentProfile && currentProfile.user_id === userId) {
          set({ profile: { ...currentProfile, has_completed_onboarding: true } });
      }
      
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      console.error("Error marking onboarding complete:", err);
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },
})); 