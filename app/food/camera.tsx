import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../lib/stores'; // Revert back to store
import { FoodForm } from '../../lib/components/food/FoodForm';
import { FoodNutrition } from '../../types';
import { FoodCamera } from '../../lib/components/food/FoodCamera';

export default function FoodCameraScreen() {
  const router = useRouter();
  const { user } = useAuthStore(); // Get user from Auth store
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [analyzedFood, setAnalyzedFood] = useState<FoodNutrition | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create a mock user for testing if no real user exists
  const currentUser = user || {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'Test User',
    created_at: new Date().toISOString(),
  };

  // Handle image capture and analysis result from FoodCamera component
  const handleCapture = (nutrition: FoodNutrition, imageUri: string) => {
    console.log("Image captured and analyzed:", imageUri);
    console.log("Nutrition data:", JSON.stringify(nutrition, null, 2));
    
    setAnalyzedFood(nutrition);
    setCapturedImageUri(imageUri);
    // No navigation needed here, state change will show the form
  };

  // Handle form submission success
  const handleSuccess = () => {
    console.log("Form submitted successfully, navigating to food log");
    // Navigate back to the food log tab after successful submission
    router.replace('/(tabs)/food-log'); 
  };

  // Handle user cancelling the camera
  const handleCancel = () => {
    console.log("Camera cancelled, going back");
    router.back(); // Go back to the previous screen
  };

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("Camera screen state updated:");
    console.log("- userId:", currentUser.id);
    console.log("- capturedImageUri:", capturedImageUri ? "exists" : "null");
    console.log("- analyzedFood:", analyzedFood ? "exists" : "null");
  }, [currentUser.id, capturedImageUri, analyzedFood]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" /> 
      <Stack.Screen options={{ title: 'Log Food' }} />

      {/* Show camera only if no image has been captured/analyzed yet */}
      {!analyzedFood && !capturedImageUri && (
        <FoodCamera 
          userId={currentUser.id}
          onCapture={handleCapture}
          onCancel={handleCancel}
        />
      )}
      
      {/* Show form with pre-filled data if food has been analyzed */}
      {analyzedFood && capturedImageUri && (
        <FoodForm 
          userId={currentUser.id}
          initialValues={analyzedFood}
          onSuccess={handleSuccess}
          foodImage={capturedImageUri}
        />
      )}

      {/* Show error message if something went wrong */}
      {!analyzedFood && capturedImageUri && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            There was a problem analyzing your food image. Please try again.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Dark background for camera
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 