import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore, useUserProfileStore } from '../lib/stores';

export default function Index() {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [shouldOnboard, setShouldOnboard] = useState(false);
  
  const { user, initialized: authInitialized, checkSession } = useAuthStore();
  const { fetchProfile } = useUserProfileStore();
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkSession();
        // Auth check complete, handle profile/onboarding
      } catch (err: any) {
        console.error('Error during auth initialization:', err);
        setError(err.message || 'Failed to initialize auth');
        setIsLoadingProfile(false); // Stop loading on auth error
      }
    };
    
    initializeApp();
  }, []);
  
  // Effect runs when auth is initialized and user state changes
  useEffect(() => {
    if (!authInitialized) return; // Wait for auth check
    
    if (user) {
      // User is logged in, check profile for onboarding status
      setIsLoadingProfile(true); 
      fetchProfile(user.id)
        .then(profile => {
          if (profile && !profile.has_completed_onboarding) {
            console.log('User has not completed onboarding, redirecting...');
            setShouldOnboard(true);
          } else if (!profile) {
            console.warn('User logged in but profile not found. Redirecting to onboarding.');
            setShouldOnboard(true); 
          } else {
            console.log('User profile found and onboarding complete or assumed complete.');
            setShouldOnboard(false);
          }
        })
        .catch(err => {
          console.error('Error fetching profile during initial check:', err);
          setError('Failed to load user profile.');
          setShouldOnboard(false); // Default to main app on profile error
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    } else {
      setIsLoadingProfile(false);
      setShouldOnboard(false);
    }
  }, [authInitialized, user]); // Rerun when auth status changes
  
  // Display loading states or errors
  if (!authInitialized || (user && isLoadingProfile)) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading BiteBuddy...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }
  
  // Redirect based on auth and onboarding status
  if (user) {
    if (shouldOnboard) {
      return <Redirect href="/(onboarding)/select-age" />; 
    } else {
      return <Redirect href="/(tabs)" />; 
    }
  } else {
    return <Redirect href="/auth/login" />; 
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  }
}); 