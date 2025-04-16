import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { NumberWheel } from '../../lib/components/ui';
import { useAuthStore, useUserProfileStore } from '../../lib/stores';
import { Button } from '../../lib/components';

export default function SelectHeightScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useUserProfileStore();
  
  const isOnboarding = pathname.startsWith('/onboarding');
  
  // Default height in cm (e.g., 170cm)
  const [selectedHeight, setSelectedHeight] = useState<number>(profile?.height || 170);

  // Initialize from profile
  useEffect(() => {
    if (profile?.height) {
      setSelectedHeight(profile.height);
    }
  }, [profile]);

  const handleDone = async () => {
    if (!user) return;

    const result = await updateProfile(user.id, { height: selectedHeight });
    
    if (result.success) {
      if (isOnboarding) {
        // Navigate to the next step
        router.push('/onboarding/select-weight' as any); 
      } else {
        router.back();
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to save height.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Height</Text>
        <Text style={styles.subtitle}>Used for calorie estimation.</Text>
      </View>

      <View style={styles.wheelContainer}>
        <NumberWheel
          title="Height"
          initialValue={selectedHeight}
          minValue={100}
          maxValue={250}
          step={1}
          unit="cm"
          onValueSelected={setSelectedHeight}
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

// Styles similar to select-age
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