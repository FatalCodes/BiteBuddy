import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuthStore } from '../../lib/stores';

// This navigator handles the multi-step onboarding process.
export default function OnboardingLayout() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Ensure user is logged in, otherwise redirect to login
  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="select-age" 
        options={{ 
          title: 'Step 1: Your Age',
          headerBackVisible: false, // No going back from first step
        }}
      />
      <Stack.Screen 
        name="select-height" 
        options={{ title: 'Step 2: Your Height' }}
      />
      <Stack.Screen 
        name="select-weight" 
        options={{ title: 'Step 3: Current Weight' }}
      />
      <Stack.Screen 
        name="select-goal-weight" 
        options={{ title: 'Step 4: Goal Weight' }}
      />
      <Stack.Screen 
        name="select-gender" 
        options={{ title: 'Step 5: Gender' }}
      />
      <Stack.Screen 
        name="select-activity" 
        options={{ title: 'Step 6: Activity Level' }}
      />
      {/* Add other onboarding steps if necessary */}
    </Stack>
  );
} 