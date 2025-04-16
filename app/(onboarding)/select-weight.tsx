import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity, FlatList } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useAuthStore, useUserProfileStore, useOnboardingStore } from '../../lib/stores';
import { Button } from '../../lib/components';

export default function SelectWeightScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile } = useUserProfileStore();
  
  // Use onboarding store to avoid API calls
  const { setWeight, navigateToNextStep, data, isLoading } = useOnboardingStore();
  
  const isOnboarding = pathname.startsWith('/(onboarding)');
  
  // Default weight in kg (e.g., 70kg)
  const [selectedWeight, setSelectedWeight] = useState<number>(data.weight || profile?.weight || 70);

  // Initialize from profile if needed
  useEffect(() => {
    if (profile?.weight && !data.weight) {
      setSelectedWeight(profile.weight);
    }
  }, [profile?.weight, data.weight]);

  // Generate weight values (memoized)
  const weightOptions = useMemo(() => {
    // Generate weight options from 30kg to 200kg in steps of 0.5kg
    const options = [];
    for (let i = 30; i <= 200; i += 0.5) {
      options.push(i);
    }
    return options;
  }, []);

  // Convert kg to lbs for display
  const kgToLbs = useCallback((kg: number) => {
    return Math.round(kg * 2.20462);
  }, []);

  // Handle weight selection with useCallback
  const handleSelectWeight = useCallback((weight: number) => {
    setSelectedWeight(weight);
  }, []);

  // Render a weight option item - memoized for performance
  const renderWeightItem = useCallback(({ item }: { item: number }) => {
    const isSelected = selectedWeight === item;
    
    return (
      <TouchableOpacity
        style={[
          styles.weightOption,
          isSelected && styles.selectedWeightOption
        ]}
        onPress={() => handleSelectWeight(item)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.weightText,
          isSelected && styles.selectedWeightText
        ]}>
          {item.toFixed(1)} kg
        </Text>
        <Text style={[
          styles.weightTextSecondary,
          isSelected && styles.selectedWeightText
        ]}>
          {kgToLbs(item)} lbs
        </Text>
      </TouchableOpacity>
    );
  }, [selectedWeight, handleSelectWeight, kgToLbs]);

  // Use key extractor for FlatList
  const keyExtractor = useCallback((item: number) => item.toString(), []);

  const handleDone = () => {
    if (!selectedWeight) return;

    // Update the onboarding store with the selected weight
    setWeight(selectedWeight);
    
    // Use navigateToNextStep to handle navigation
    navigateToNextStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Current Weight</Text>
        <Text style={styles.subtitle}>Helps track progress and estimate needs.</Text>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          data={weightOptions}
          renderItem={renderWeightItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.weightGrid}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          windowSize={5}
        />
      </View>

      <View style={styles.footer}>
        <Button 
          title="Next"
          onPress={handleDone} 
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
    paddingHorizontal: 10,
  },
  weightGrid: {
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  weightOption: {
    flex: 1,
    margin: 8,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedWeightOption: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  weightText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
  weightTextSecondary: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectedWeightText: {
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