import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../lib/stores';

export default function Index() {
  // TEMPORARY: Bypass authentication and go straight to the app
  // Remove this line and uncomment the code below when ready to re-enable auth
  return <Redirect href="/(tabs)" />;
  
  /*
  const [error, setError] = useState<string | null>(null);
  const { user, initialized, checkSession } = useAuthStore();
  
  useEffect(() => {
    // Add error handling to checkSession
    const initializeApp = async () => {
      try {
        await checkSession();
      } catch (err: any) {
        console.error('Error during initialization:', err);
        setError(err.message || 'Failed to initialize app');
      }
    };
    
    initializeApp();
  }, []);
  
  // Display any errors that occurred during initialization
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }
  
  // If we have a user, redirect to tabs, otherwise to login
  if (!initialized) {
    return (
      <View style={styles.container}>
        <Text>Loading BiteBuddy...</Text>
      </View>
    );
  }
  
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
  */
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  }
}); 