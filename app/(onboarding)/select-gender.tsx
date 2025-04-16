import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useUserProfileStore, useOnboardingStore } from '../../lib/stores';
import { Button } from '../../lib/components';

// Gender options for selection
const GENDER_OPTIONS = [
  { label: 'Male', value: 'male', icon: 'male' },
  { label: 'Female', value: 'female', icon: 'female' },
  { label: 'Non-binary', value: 'non-binary', icon: 'male-female' }, 
  { label: 'Prefer not to say', value: 'not_specified', icon: 'help-circle-outline' },
];

// Define interface for gender option
interface GenderOption {
  label: string;
  value: string;
  icon: string;
}

const SelectGenderScreen = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile } = useUserProfileStore();
  
  // Use onboarding store to avoid API calls
  const { setGender, navigateToNextStep, data, isLoading } = useOnboardingStore();
  
  const isOnboarding = pathname.startsWith('/(onboarding)');
  
  // Gender state
  const [selectedGender, setSelectedGender] = useState<string | null>(
    data.gender || profile?.gender || null
  );

  // Initialize from profile if needed
  useEffect(() => {
    if (profile?.gender && !data.gender && !selectedGender) {
      setSelectedGender(profile.gender);
    }
  }, [profile?.gender, data.gender, selectedGender]);

  // Memoize the gender selection handler for better performance
  const handleSelectGender = useCallback((gender: string) => {
    setSelectedGender(gender);
  }, []);

  // Memoize the done handler
  const handleDone = useCallback(() => {
    if (!selectedGender) return;

    // Update the onboarding store with the selected gender
    setGender(selectedGender);
    
    // Use navigateToNextStep to handle navigation
    navigateToNextStep();
  }, [selectedGender, setGender, navigateToNextStep]);

  // Render a gender option - memoized for performance
  const renderGenderOption = useCallback((option: GenderOption) => {
    const isSelected = selectedGender === option.value;
    
    return (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.optionCard,
          isSelected && styles.selectedCard
        ]}
        onPress={() => handleSelectGender(option.value)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={option.icon as any}
          size={40} 
          color={isSelected ? '#fff' : '#3498db'} 
          style={styles.icon}
        />
        <Text style={[
          styles.optionText,
          isSelected && styles.selectedText
        ]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedGender, handleSelectGender]);

  // Memoized gender options
  const genderOptionComponents = useMemo(() => {
    return GENDER_OPTIONS.map(renderGenderOption);
  }, [renderGenderOption]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Gender</Text>
        <Text style={styles.subtitle}>This information can help tailor some features.</Text>
      </View>

      <View style={styles.optionsContainer}>
        {genderOptionComponents}
      </View>

      <View style={styles.footer}>
        <Button
          title="Next"
          onPress={handleDone}
          disabled={!selectedGender}
          isLoading={isLoading}
          style={styles.doneButton}
        />
      </View>
    </SafeAreaView>
  );
};

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  optionCard: {
    width: '45%', // Adjust for spacing
    aspectRatio: 1, // Make it square
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: '2.5%',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  selectedCard: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  icon: {
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
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

export default React.memo(SelectGenderScreen); 