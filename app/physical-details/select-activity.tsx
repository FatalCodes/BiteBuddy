import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useUserProfileStore } from '../../lib/stores';
import { Button } from '../../lib/components';

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', value: 'sedentary', icon: 'body', description: 'Little to no exercise, desk job' },
  { label: 'Lightly Active', value: 'light', icon: 'walk', description: 'Light exercise/sports 1-3 days/week' },
  { label: 'Moderately Active', value: 'moderate', icon: 'bicycle', description: 'Moderate exercise/sports 3-5 days/week' },
  { label: 'Very Active', value: 'active', icon: 'barbell', description: 'Hard exercise/sports 6-7 days/week' },
  { label: 'Extremely Active', value: 'very_active', icon: 'flame', description: 'Very hard exercise/sports & physical job' },
];

export default function SelectActivityScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile, updateProfile, markOnboardingComplete, isLoading } = useUserProfileStore(); 
  
  const isOnboarding = pathname.startsWith('/onboarding');
  
  const [selectedActivity, setSelectedActivity] = useState<string | null>(profile?.activity_level || null);

  useEffect(() => {
    setSelectedActivity(profile?.activity_level || null);
  }, [profile]);

  const handleSelectActivity = (activity: string) => {
    setSelectedActivity(activity);
  };

  const handleDone = async () => {
    if (!user) return;
    
    if (isOnboarding && !selectedActivity) {
        Alert.alert('Selection Required', 'Please select your typical activity level to continue.');
        return;
    }

    try {
      const result = await updateProfile(user.id, { activity_level: selectedActivity });
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to save activity level.');
        return; 
      }
      
      // If onboarding, mark as complete and navigate to main app
      if (isOnboarding) {
        console.log('Onboarding: Saving activity level and marking complete...');
        const completeResult = await markOnboardingComplete(user.id);
        if (completeResult.success) {
          console.log('Onboarding complete, navigating to tabs...');
          router.replace('/(tabs)'); 
        } else {
          Alert.alert('Error', completeResult.error || 'Failed to finalize onboarding.');
        }
      } else {
        console.log('Settings: Activity level saved, going back...');
        router.back();
      }
    } catch (error: any) {
      console.error("Error in handleDone:", error);
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Activity Level</Text>
        <Text style={styles.subtitle}>How active are you on a typical week?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {ACTIVITY_LEVELS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionCard,
              selectedActivity === option.value && styles.selectedCard
            ]}
            onPress={() => handleSelectActivity(option.value)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={option.icon as any} 
              size={32} 
              color={selectedActivity === option.value ? '#fff' : '#3498db'} 
              style={styles.icon}
            />
            <View style={styles.textContainer}> 
              <Text style={[
                styles.optionLabel,
                selectedActivity === option.value && styles.selectedText
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.optionDescription,
                selectedActivity === option.value && styles.selectedText
              ]}>
                {option.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={isOnboarding ? "Finish Setup" : "Done"} 
          onPress={handleDone} 
          isLoading={isLoading}
          disabled={isOnboarding && !selectedActivity} 
          style={styles.doneButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  optionsContainer: {
    padding: 15, 
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.10,
    shadowRadius: 2.22,
    elevation: 2,
    flexDirection: 'row',
  },
  selectedCard: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  icon: {
    marginRight: 15, 
  },
  textContainer: { 
    flex: 1, 
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4, 
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
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