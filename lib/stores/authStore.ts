import { create } from 'zustand';
import { supabase } from '../supabase/supabase';
import { AuthState, User } from '../../types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  error: null,
  initialized: false,

  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      if (data?.user) {
        // Create initial companion for user
        await supabase.from('companions').insert({
          user_id: data.user.id,
          name: 'BiteBuddy',
          health: 50,
          happiness: 50,
          energy: 50,
        });
      }

      set({ 
        session: data.session,
        user: data.user as unknown as User,
        isLoading: false,
        initialized: true,
      });
      
      return { success: true };
    } catch (err: any) {
      set({ error: err.message, isLoading: false, initialized: true });
      return { success: false, error: err.message };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, isLoading: false, initialized: true });
        return { success: false, error: error.message };
      }

      set({ 
        session: data.session,
        user: data.user as unknown as User,
        isLoading: false,
        initialized: true,
      });
      
      return { success: true };
    } catch (err: any) {
      set({ error: err.message, isLoading: false, initialized: true });
      return { success: false, error: err.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      set({ 
        session: null,
        user: null,
        isLoading: false,
        initialized: true,
      });
      
      return { success: true };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Check for existing session
  checkSession: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        set({ error: error.message, isLoading: false, initialized: true });
        return;
      }

      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        set({ 
          session: data.session,
          user: userData.user as unknown as User,
          isLoading: false,
          initialized: true,
        });
      } else {
        set({ isLoading: false, initialized: true });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false, initialized: true });
    }
  },
})); 