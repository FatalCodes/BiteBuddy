import { create } from 'zustand';
import { supabase } from '../supabase/supabase';
import { AuthState, User } from '../../types';

export const useAuthStore = create<AuthState>((set, get) => ({
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
      
      const user = data?.user;
      if (user) {
        // Create initial companion for user
        await supabase.from('companions').insert({
          user_id: user.id,
          name: 'BiteBuddy',
          health: 50,
          happiness: 50,
          energy: 50,
        });
        
        // Ensure user profile is created, default onboarding status is false
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (!existingProfile) {
          await supabase.from('user_profiles').insert({
            user_id: user.id,
            display_name: email.split('@')[0], 
            has_completed_onboarding: false, // Explicitly false
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      set({ 
        session: data.session,
        user: user as unknown as User,
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

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect URL config is crucial here
        },
      });

      if (authError) {
        console.error('Google Sign-In OAuth Error:', authError);
        set({ error: authError.message, isLoading: false });
        return { success: false, error: authError.message };
      }
      
      // Although signInWithOAuth handles redirects, we might need to wait for the session
      // A better approach uses auth state listeners, but for now, let's assume 
      // we check profile *after* potential session update.
      // This part is less reliable with signInWithOAuth and better with native flows.
      
      // **Placeholder**: Ideally, profile check/creation happens *after* the redirect
      // and session confirmation, perhaps triggered by an auth state change listener.
      // For simplicity now, we'll just mark success.
      // Proper implementation requires listening to `onAuthStateChange`.

      console.log('Google OAuth initiated. Waiting for redirect and session...');
      // We don't get user/session immediately here with signInWithOAuth
      
      set({ isLoading: false }); // May need adjustment based on redirect handling
      return { success: true }; 
    } catch (err: any) {
      console.error('Google Sign-In Exception:', err);
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },
  
  // Sign in with Apple using native flow (ID token)
  signInWithApple: async (token: string, fullName?: string | null) => {
    try {
      set({ isLoading: true, error: null });
      if (!token) {
        throw new Error('No identity token provided for Apple Sign-In.');
      }
      
      // Sign in using the ID token
      const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: token, 
      });

      if (authError) {
        console.error('Apple Sign-In (ID Token) Error:', authError);
        set({ error: authError.message, isLoading: false });
        return { success: false, error: authError.message };
      }
      
      const user = authData.user;
      if (!user) {
          throw new Error('Apple Sign-In succeeded but no user data was returned.');
      }

      // Check if a profile exists for this user
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id') // Select only id to check existence
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle to handle null or one row
        
      if (profileError && profileError.code !== 'PGRST116') { // Ignore 'PGRST116' (No rows found)
          console.error('Error checking for existing profile:', profileError);
          // Proceed with login, but profile might be missing
      }

      // If no profile exists, create one
      if (!profileData) {
        console.log(`No profile found for user ${user.id}, creating one.`);
        // Construct display name: use Apple full name if provided, otherwise parse email
        const displayName = fullName || (user.email ? user.email.split('@')[0] : 'User');
        
        const { error: createProfileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            display_name: displayName,
            // Add other default profile fields if necessary
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
        if (createProfileError) {
            console.error('Error creating profile after Apple Sign-In:', createProfileError);
            // Log the error, but the user is still logged in
            set({ error: `Logged in, but failed to create profile: ${createProfileError.message}` });
        }
      }
      
      // Update auth state with session and user
      set({ 
        session: authData.session,
        user: user as unknown as User,
        isLoading: false,
        initialized: true,
      });
      return { success: true };
    } catch (err: any) {
      console.error('Apple Sign-In (ID Token) Exception:', err);
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