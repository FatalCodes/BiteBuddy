import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  // Initialize permissions early
  useEffect(() => {
    const setupPermissions = async () => {
      try {
        // Request camera permissions early to avoid delays later
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        console.log('Camera permission status:', cameraPermission.status);
        
        // Request media library permissions
        const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Media library permission status:', mediaLibraryPermission.status);
      } catch (error) {
        console.error('Error setting up permissions:', error);
      }
    };
    
    setupPermissions();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="index"
          />
          <Stack.Screen
            name="(tabs)"
          />
          <Stack.Screen
            name="auth/login"
          />
          <Stack.Screen
            name="auth/signup"
            options={{
              headerShown: true,
              title: 'Create Account',
              headerBackTitle: 'Login',
            }}
          />
          <Stack.Screen
            name="food/entry"
            options={{
              headerShown: true,
              presentation: 'modal',
              title: 'Log Food Entry'
            }}
          />
          <Stack.Screen
            name="food/camera"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="food/detail/[id]"
            options={{
              headerShown: true,
              // Let the nested screen handle the title
            }}
          />
          <Stack.Screen
            name="companion/detail"
            options={{
              headerShown: true,
              title: 'Companion Details'
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
