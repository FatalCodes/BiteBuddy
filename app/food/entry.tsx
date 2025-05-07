import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../lib/stores';
import { FoodForm } from '../../lib/components';

export default function FoodEntryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Create a mock user for testing if no real user exists
  const currentUser = user || {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'Test User',
    created_at: new Date().toISOString(),
  };
  
  const handleSuccess = () => {
    console.log("Food entry successful, navigating back");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      <Stack.Screen
        options={{
          title: 'Log Food',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'card',
          headerStyle: {
            backgroundColor: '#f8f8f8',
          },
          headerShadowVisible: false,
          headerTransparent: false,
          headerStatusBarHeight: 0,
          contentStyle: {
            backgroundColor: '#f8f8f8',
          },
        }}
      />
      
      <FoodForm 
        userId={currentUser.id}
        onSuccess={handleSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
}); 