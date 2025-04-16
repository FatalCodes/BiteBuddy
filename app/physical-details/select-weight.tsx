import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { NumberWheel } from '../../lib/components/ui';
import { useAuthStore, useUserProfileStore } from '../../lib/stores';
import { Button } from '../../lib/components';

export default function SelectWeightScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useUserProfileStore();
  
  const isOnboarding = pathname.startsWith('/onboarding');
  
  // Default weight in kg (e.g., 70kg)
  const [selectedWeight, setSelectedWeight] = useState<number>(profile?.weight || 70);

  // Initialize from profile
  useEffect(() => {
    if (profile?.weight) {
      setSelectedWeight(profile.weight);
    }
  }, [profile]);

  const handleDone = async () => {
    if (!user) return;

    // Round to one decimal place before saving, consistent with wheel
    const weightToSave = parseFloat(selectedWeight.toFixed(1));

    const result = await updateProfile(user.id, { weight: weightToSave });
    
    if (result.success) {
      if (isOnboarding) {
        // Navigate to the next step
        router.push('/onboarding/select-goal-weight' as any); 
      } else {
        router.back();
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to save weight.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Current Weight</Text>
        <Text style={styles.subtitle}>Helps track progress and estimate needs.</Text>
      </View>

      <View style={styles.wheelContainer}>
        <NumberWheel
          title="Weight"
          initialValue={selectedWeight}
          minValue={30} 
          maxValue={250}
          step={0.1} // Allow decimal steps
          precision={1} // Show one decimal place
          unit="kg"
          alternateUnit="lb" // Allow lbs conversion
          onValueSelected={setSelectedWeight}
        />
      </View>

      <View style={styles.footer}>
        <Button 
          title={isOnboarding ? "Next" : "Done"}
          onPress={handleDone} 
          isLoading={isLoading}
          style={styles.doneButton}
        />
      </View>
    </SafeAreaView>
  );
}

// Styles similar to previous screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  doneButton: {
    backgroundColor: '#3498db',
  },
}); 