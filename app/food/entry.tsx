import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
  
  // Handle successful food log
  const handleSuccess = () => {
    console.log("Food entry successful, navigating back");
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen
        options={{
          title: 'Log Food',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          presentation: 'modal',
        }}
      />
      
      <FoodForm 
        userId={currentUser.id}
        onSuccess={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
}); 