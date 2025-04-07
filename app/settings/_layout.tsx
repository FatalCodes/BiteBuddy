import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsLayout() {
  const router = useRouter();
  
  return (
    <Stack 
      screenOptions={{ 
        presentation: 'modal',
        headerShown: true,
        // Explicitly define a custom headerLeft component with back button
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginLeft: 0, padding: 8 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} 
              size={24} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        // Use animation: 'slide_from_right' for Android to simulate iOS-like behavior
        animation: Platform.OS === 'android' ? 'slide_from_right' : undefined,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Settings",
          // Remove back button from the main settings index screen
          headerLeft: undefined
        }} 
      />
      <Stack.Screen name="edit-profile" options={{ title: "Edit Profile" }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy Policy" }} />
      <Stack.Screen name="about" options={{ title: "About BiteBuddy" }} />
      <Stack.Screen name="help" options={{ title: "Help & Support" }} />
      <Stack.Screen name="general" options={{ title: "General Settings" }} />
    </Stack>
  );
} 