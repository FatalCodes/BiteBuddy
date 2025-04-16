import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { NumberWheel } from '../../lib/components/ui';
import { useAuthStore, useUserProfileStore } from '../../lib/stores';
import { Button } from '../../lib/components';

export default function SelectGoalWeightScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useUserProfileStore();
  
  const isOnboarding = pathname.startsWith('/onboarding');
  
  // Default goal weight in kg (e.g., 65kg)
  const [selectedGoalWeight, setSelectedGoalWeight] = useState<number>(profile?.goal_weight || 65);

  // Initialize from profile
  useEffect(() => {
    if (profile?.goal_weight) {
      setSelectedGoalWeight(profile.goal_weight);
    }
  }, [profile]);

  const handleDone = async () => {
    if (!user) return;

    const weightToSave = parseFloat(selectedGoalWeight.toFixed(1));

    const result = await updateProfile(user.id, { goal_weight: weightToSave });
    
    if (result.success) {
      if (isOnboarding) {
        // Navigate to the next step
        router.push('/onboarding/select-gender' as any); 
      } else {
        router.back();
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to save goal weight.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Goal Weight</Text>
        <Text style={styles.subtitle}>What weight are you aiming for?</Text>
      </View>

      <View style={styles.wheelContainer}>
        <NumberWheel
          title="Goal Weight"
          initialValue={selectedGoalWeight}
          minValue={30} 
          maxValue={200} // Adjust max goal as needed
          step={0.1} 
          precision={1}
          unit="kg"
          alternateUnit="lb"
          onValueSelected={setSelectedGoalWeight}
          // You can potentially add the avatarComponent here if desired for visual flair
          // avatarComponent={<View><Text>🏆</Text></View>} 
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