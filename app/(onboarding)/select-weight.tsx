import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useAuthStore, useUserProfileStore, useOnboardingStore } from '../../lib/stores';
import { Button } from '../../lib/components';

export default function SelectWeightScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile } = useUserProfileStore();
  
  const { setWeight, navigateToNextStep, data, isLoading } = useOnboardingStore();
  
  const isOnboarding = pathname.startsWith('/(onboarding)');
  
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
    const initialWeightKg = data.weight || profile?.weight; // Assume these are in KG from original context
    let weightToSetInLbs: number;

    if (initialWeightKg) {
      weightToSetInLbs = kgToLbs(initialWeightKg);
    } else {
      weightToSetInLbs = 150; // Default to 150 lbs if no data
    }
    
    setSelectedWeightInLbs(weightToSetInLbs);
    if (unit === 'lbs') {
      setInputValue(weightToSetInLbs.toFixed(1));
    } else {
      setInputValue(lbsToKg(weightToSetInLbs).toFixed(1));
    }
  }, [data.weight, profile?.weight, kgToLbs, lbsToKg]); // unit removed from deps to avoid re-calc on unit toggle initially

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
      setSelectedWeightInLbs(null);
    }
  };

  const handleSetUnit = (newUnit: 'lbs' | 'kgs') => {
    if (unit === newUnit) return;
    setUnit(newUnit);
    if (selectedWeightInLbs !== null) {
      if (newUnit === 'lbs') {
        setInputValue(selectedWeightInLbs.toFixed(1));
      } else { // new unit is kgs
        setInputValue(lbsToKg(selectedWeightInLbs).toFixed(1));
      }
    }
  };

  const handleDone = () => {
    if (selectedWeightInLbs === null || selectedWeightInLbs <= 0) return;
    setWeight(selectedWeightInLbs); // Store weight in lbs
    navigateToNextStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Enter Your Current Weight</Text>
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
            onSubmitEditing={handleDone} // Optional: submit on done
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
          title="Next"
          onPress={handleDone} 
          disabled={selectedWeightInLbs === null || selectedWeightInLbs <= 0}
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