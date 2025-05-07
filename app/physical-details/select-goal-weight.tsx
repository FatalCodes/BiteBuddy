import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Alert, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useAuthStore, useUserProfileStore } from '../../lib/stores';
import { Button } from '../../lib/components';

export default function SelectGoalWeightScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useUserProfileStore();
  
  // pathname and isOnboarding might not be strictly necessary if this is always a settings screen
  const pathname = usePathname(); 
  const isOnboarding = pathname.startsWith('/onboarding');
  
  const [inputValue, setInputValue] = useState<string>('');
  const [unit, setUnit] = useState<'lbs' | 'kgs'>('lbs');
  const [selectedGoalWeightInLbs, setSelectedGoalWeightInLbs] = useState<number | null>(null);

  const lbsToKg = useCallback((lbs: number): number => {
    return parseFloat((lbs / 2.20462).toFixed(1));
  }, []);

  const kgToLbs = useCallback((kg: number): number => {
    return parseFloat((kg * 2.20462).toFixed(1));
  }, []);

  useEffect(() => {
    const initialGoalWeightKg = profile?.goal_weight;
    let weightToSetInLbs: number;

    if (initialGoalWeightKg) {
      weightToSetInLbs = kgToLbs(initialGoalWeightKg);
    } else {
      weightToSetInLbs = 140; // Default to 140 lbs if no profile data
    }
    
    setSelectedGoalWeightInLbs(weightToSetInLbs);
    if (unit === 'lbs') {
      setInputValue(weightToSetInLbs.toFixed(1));
    } else {
      setInputValue(lbsToKg(weightToSetInLbs).toFixed(1));
    }
  }, [profile?.goal_weight, kgToLbs, lbsToKg, unit]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const numericValue = parseFloat(text);
    if (!isNaN(numericValue) && numericValue > 0) {
      if (unit === 'lbs') {
        setSelectedGoalWeightInLbs(numericValue);
      } else { // input is kgs
        setSelectedGoalWeightInLbs(kgToLbs(numericValue));
      }
    } else {
      setSelectedGoalWeightInLbs(0); // Or null
    }
  };

  const handleSetUnit = (newUnit: 'lbs' | 'kgs') => {
    if (unit === newUnit) return;
    setUnit(newUnit);
    if (selectedGoalWeightInLbs !== null && selectedGoalWeightInLbs > 0) {
      if (newUnit === 'lbs') {
        setInputValue(selectedGoalWeightInLbs.toFixed(1));
      } else { // new unit is kgs
        setInputValue(lbsToKg(selectedGoalWeightInLbs).toFixed(1));
      }
    } else {
      setInputValue(''); // Clear input if no valid weight to convert
    }
  };

  const handleDone = async () => {
    if (!user || selectedGoalWeightInLbs === null || selectedGoalWeightInLbs <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid goal weight.');
      return;
    }

    const goalWeightToSaveInKg = lbsToKg(selectedGoalWeightInLbs);

    const result = await updateProfile(user.id, { goal_weight: goalWeightToSaveInKg });
    Keyboard.dismiss();
    
    if (result.success) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile'); 
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to save goal weight.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Goal Weight' }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Update Your Goal Weight</Text>
        <Text style={styles.subtitle}>What weight are you aiming for?</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder={unit === 'lbs' ? "e.g., 140" : "e.g., 63.5"}
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
          title={"Save"}
          onPress={handleDone} 
          disabled={selectedGoalWeightInLbs === null || selectedGoalWeightInLbs <= 0 || isLoading}
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
    paddingTop: 20,
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