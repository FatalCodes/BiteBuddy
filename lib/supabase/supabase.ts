import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

// SecureStore adapter for Supabase
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://pddpruvkmmsqkcopfivq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZHBydXZrbW1zcWtjb3BmaXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NDA2MzQsImV4cCI6MjA1OTMxNjYzNH0.KtldCqrR08v9d2iav3pDjimVH6uEbVlQT15ypydq3FE';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return !!session;
}; 