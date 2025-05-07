import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useUserProfileStore } from '../../lib/stores';
import { Button } from '../../lib/components';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male', icon: 'male' },
  { label: 'Female', value: 'female', icon: 'female' },
  { label: 'Non-binary', value: 'non-binary', icon: 'male-female' },
  { label: 'Prefer not to say', value: 'not_specified', icon: 'help-circle-outline' },
];

export default function SelectGenderScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useUserProfileStore();
  
  const isOnboarding = pathname.startsWith('/onboarding');
  
  const [selectedGender, setSelectedGender] = useState<string | null>(profile?.gender || null);

  useEffect(() => {
    setSelectedGender(profile?.gender || null);
  }, [profile]);

  const handleSelectGender = (gender: string) => {
    setSelectedGender(gender);
  };

  const handleDone = async () => {
    if (!user) return;

    // Allow skipping gender selection
    if (!selectedGender) {
      if (isOnboarding) {
        router.push('/onboarding/select-activity' as any);
      } else {
        router.back();
      }
      return; 
    }

    const result = await updateProfile(user.id, { gender: selectedGender });
    
    if (result.success) {
      if (isOnboarding) {
        router.push('/onboarding/select-activity' as any); 
      } else {
        router.back();
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to save gender.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Gender</Text>
        <Text style={styles.subtitle}>This information can help tailor some features.</Text>
      </View>

      <View style={styles.optionsContainer}>
        {GENDER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionCard,
              selectedGender === option.value && styles.selectedCard
            ]}
            onPress={() => handleSelectGender(option.value)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={option.icon as any}
              size={40} 
              color={selectedGender === option.value ? '#fff' : '#3498db'} 
              style={styles.icon}
            />
            <Text style={[
              styles.optionText,
              selectedGender === option.value && styles.selectedText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Button 
          title={isOnboarding ? "Next" : "Done"}
          onPress={handleDone} 
          isLoading={isLoading}
          disabled={!selectedGender && false}
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
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  optionCard: {
    width: '45%',
    aspectRatio: 1,
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