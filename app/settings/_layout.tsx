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

        animation: Platform.OS === 'android' ? 'slide_from_right' : undefined,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Settings",

          headerLeft: undefined
        }} 
      />
      <Stack.Screen name="edit-profile" options={{ title: "Edit Profile" }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy Policy" }} />
      <Stack.Screen name="about" options={{ title: "About BiteBuddy" }} />
      <Stack.Screen name="help" options={{ title: "Help & Support" }} />
      <Stack.Screen name="general" options={{ title: "General Settings" }} />
      <Stack.Screen name="physical-details" options={{ title: "Physical Details" }} />
      
      <Stack.Screen name="select-age" options={{ headerShown: false }} />
      <Stack.Screen name="select-height" options={{ headerShown: false }} />
      <Stack.Screen name="select-weight" options={{ headerShown: false }} />
      <Stack.Screen name="select-goal-weight" options={{ headerShown: false }} />
      <Stack.Screen name="select-gender" options={{ headerShown: false }} />
      <Stack.Screen name="select-activity" options={{ headerShown: false }} />
    </Stack>
  );
} 