import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Alert, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useAuthStore, useUserProfileStore } from '../../lib/stores';
import { Button } from '../../lib/components';

export default function SelectWeightScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useUserProfileStore();
  
  const isOnboarding = pathname.startsWith('/onboarding'); // This might be always false here
  
  const [inputValue, setInputValue] = useState<string>('');
  const [unit, setUnit] = useState<'lbs' | 'kgs'>('lbs');
  const [selectedWeightInLbs, setSelectedWeightInLbs] = useState<number | null>(null);

  const lbsToKg = useCallback((lbs: number): number => {
    return parseFloat((lbs / 2.20462).toFixed(1));
  }, []);

  const kgToLbs = useCallback((kg: number): number => {
    return parseFloat((kg * 2.20462).toFixed(1));
  }, []);

  useEffect(() => {
    const initialWeightKg = profile?.weight; 
    let weightToSetInLbs: number;

    if (initialWeightKg) {
      weightToSetInLbs = kgToLbs(initialWeightKg);
    } else {
      weightToSetInLbs = 150; // Default to 150 lbs if no profile data
    }
    
    setSelectedWeightInLbs(weightToSetInLbs);
    if (unit === 'lbs') {
      setInputValue(weightToSetInLbs.toFixed(1));
    } else {
      setInputValue(lbsToKg(weightToSetInLbs).toFixed(1));
    }
    // Dependency on profile.weight will re-run if it changes elsewhere
  }, [profile?.weight, kgToLbs, lbsToKg, unit]); // Added unit here to ensure input value updates if unit changes before initial profile load

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const numericValue = parseFloat(text);
    if (!isNaN(numericValue) && numericValue > 0) {
      if (unit === 'lbs') {
        setSelectedWeightInLbs(numericValue);
      } else { // input is kgs
        setSelectedWeightInLbs(kgToLbs(numericValue));
      }
    } else {
      setSelectedWeightInLbs(0); // Or null, to indicate invalid/empty
    }
  };

  const handleSetUnit = (newUnit: 'lbs' | 'kgs') => {
    if (unit === newUnit) return;
    setUnit(newUnit);
    if (selectedWeightInLbs !== null && selectedWeightInLbs > 0) {
      if (newUnit === 'lbs') {
        setInputValue(selectedWeightInLbs.toFixed(1));
      } else { // new unit is kgs
        setInputValue(lbsToKg(selectedWeightInLbs).toFixed(1));
    }
    } else if (selectedWeightInLbs === 0 && inputValue !== '') {
      // If current input was valid but became 0 due to clearing, and then unit is toggled
      // We might want to clear inputValue or re-evaluate. For now, keeps it simple.
      // If selectedWeightInLbs is 0 or null, toggling unit ideally shows empty or placeholder.
       setInputValue(''); // Clear input if there's no valid weight to convert
    }
  };

  const handleDone = async () => {
    if (!user || selectedWeightInLbs === null || selectedWeightInLbs <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }

    const weightToSaveInKg = lbsToKg(selectedWeightInLbs);

    const result = await updateProfile(user.id, { weight: weightToSaveInKg });
    Keyboard.dismiss();
    
    if (result.success) {
      // isOnboarding check might be irrelevant if this screen is not part of onboarding
      if (router.canGoBack()) {
        router.back();
      } else {
        // Fallback if cannot go back (e.g. deep link)
        router.replace('/(tabs)/profile'); // Or some other appropriate default screen
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to save weight.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Current Weight' }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Update Your Current Weight</Text>
        <Text style={styles.subtitle}>Helps track progress and estimate needs.</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder={unit === 'lbs' ? "e.g., 150" : "e.g., 68"}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleDone}
          />
          <View style={styles.unitToggleContainer}>
            <TouchableOpacity 
              style={[styles.unitButton, unit === 'lbs' && styles.unitButtonActive]}
              onPress={() => handleSetUnit('lbs')}
            >
              <Text style={[styles.unitButtonText, unit === 'lbs' && styles.unitButtonTextActive]}>lbs</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.unitButton, unit === 'kgs' && styles.unitButtonActive]}
              onPress={() => handleSetUnit('kgs')}
            >
              <Text style={[styles.unitButtonText, unit === 'kgs' && styles.unitButtonTextActive]}>kgs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title={"Save"} // Changed from "Next" or "Done"
          onPress={handleDone} 
          disabled={selectedWeightInLbs === null || selectedWeightInLbs <= 0 || isLoading}
          isLoading={isLoading}
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
    paddingTop: 20, // Adjusted padding for non-onboarding screen
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 28, 
    fontWeight: '500',
    color: '#333',
    paddingVertical: 10,
    marginRight: 10, 
  },
  unitToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  unitButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  unitButtonActive: {
    backgroundColor: '#3498db',
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  unitButtonTextActive: {
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