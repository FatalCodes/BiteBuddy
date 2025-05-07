import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { Image as ExpoImage } from 'expo-image';
import { Asset } from 'expo-asset';

// Keep the splash screen visible while fetching resources
SplashScreen.preventAutoHideAsync();

// Define the image path relative to THIS FILE for prefetching
// Adjust the path if your assets/images folder is located differently relative to app/_layout.tsx
// Assuming app/_layout.tsx is at /app/_layout.tsx and images are at /assets/images/...
const monkBgToPrefetch = require('../assets/images/buddy/monk-bg-min2.png');

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    const setupPermissionsAndPrefetch = async () => {
      try {
        // Permissions setup
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        console.log('Camera permission status:', cameraPermission.status);
        const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Media library permission status:', mediaLibraryPermission.status);

        // Prefetch critical images
        const asset = Asset.fromModule(monkBgToPrefetch);
        if (asset.uri) {
          console.log('Prefetching monk background:', asset.uri);
          await ExpoImage.prefetch(asset.uri);
          console.log('Monk background prefetch initiated or completed.');
        } else {
          // This case might happen if the asset metadata isn't immediately available
          // For local assets via require(), this is less common but good to be aware of.
          // You might need to await asset.downloadAsync() first if URI isn't directly available.
          console.log('Monk background asset URI not immediately available for prefetch.');
          // Fallback or alternative prefetch strategy if needed:
          // await asset.downloadAsync(); // This ensures it's downloaded
          // if (asset.localUri) ExpoImage.prefetch(asset.localUri);
        }

      } catch (error) {
        console.error('Error setting up permissions or prefetching images:', error);
      }
    };
    setupPermissionsAndPrefetch();
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after fonts have loaded (or error occurred)
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Prevent rendering until the fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Render the layout inside the original ThemeProvider
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  // Removed theme retrieval and NavigationThemeProvider wrapping
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style='dark' />
        <Stack screenOptions={{ 
          headerShown: false,
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
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
              title: 'Log Food Entry',
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
            name="food/add-details"
            options={{
              headerShown: true,
              presentation: 'modal',
              title: 'Add Food Details',
            }}
          />
          <Stack.Screen
            name="food/detail/[id]"
            options={{
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="companion/detail"
            options={{
              headerShown: true,
              title: 'Companion Details',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
