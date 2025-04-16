import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Platform, 
  Alert, 
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useAuthStore, useUserProfileStore, useOnboardingStore } from '../../lib/stores';
import { Button } from '../../lib/components';
import { Ionicons } from '@expo/vector-icons';

// Use a simpler, more performant UI approach instead of NumberWheel
export default function SelectGoalWeightScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile } = useUserProfileStore();
  
  // Use onboarding store to avoid API calls
  const { setGoalWeight, navigateToNextStep, data, isLoading } = useOnboardingStore();
  
  const isOnboarding = pathname.startsWith('/(onboarding)');
  
  // Default goal weight in kg (e.g., 65kg)
  const [selectedGoalWeight, setSelectedGoalWeight] = useState<number | undefined>(
    data.goal_weight || profile?.goal_weight || 65
  );

  // Initialize from profile if needed
  useEffect(() => {
    if (profile?.goal_weight && !data.goal_weight) {
      setSelectedGoalWeight(profile.goal_weight);
    }
  }, [profile?.goal_weight, data.goal_weight]);

  // Generate weight values (memoized)
  const weightOptions = useMemo(() => {
    // Generate weight options from 30kg to 200kg in steps of 5kg
    const options = [];
    for (let i = 30; i <= 200; i += 5) {
      options.push(i);
    }
    return options;
  }, []);

  // Handle Done - uses useCallback to avoid unnecessary re-renders
  const handleDone = useCallback(() => {
    if (selectedGoalWeight === undefined) return;

    // Update the onboarding store with the selected goal weight
    setGoalWeight(selectedGoalWeight);
    
    // Use navigateToNextStep to handle navigation
    navigateToNextStep();
  }, [selectedGoalWeight, setGoalWeight, navigateToNextStep]);

  // Handle weight selection with useCallback
  const handleSelectWeight = useCallback((weight: number) => {
    setSelectedGoalWeight(weight);
  }, []);

  // Render a weight option item - memoized for performance
  const renderWeightItem = useCallback(({ item }: { item: number }) => {
    const isSelected = selectedGoalWeight === item;
    
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
          {item} kg
        </Text>
      </TouchableOpacity>
    );
  }, [selectedGoalWeight, handleSelectWeight]);

  // Use key extractor for FlatList
  const keyExtractor = useCallback((item: number) => item.toString(), []);

  // Custom weight input option
  const renderCustomWeightInput = useCallback(() => {
    // Could add a custom weight input here in the future
    return null;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Goal Weight</Text>
        <Text style={styles.subtitle}>What weight are you aiming for?</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Simple weight selection grid - much more performant than NumberWheel */}
        <FlatList
          data={weightOptions}
          renderItem={renderWeightItem}
          keyExtractor={keyExtractor}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.weightGrid}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          windowSize={5}
        />

        {renderCustomWeightInput()}
      </View>

      <View style={styles.footer}>
        <Button 
          title="Next"
          onPress={handleDone} 
          isLoading={isLoading}
          disabled={selectedGoalWeight === undefined}
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
    height: 60,
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