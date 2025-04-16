import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform, FlatList } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useUserProfileStore, useOnboardingStore } from '../../lib/stores';
import { Button } from '../../lib/components';

// Define activity levels with necessary info - outside component to avoid recreations
const ACTIVITY_LEVELS = [
  { label: 'Sedentary', value: 'sedentary', icon: 'body', description: 'Little to no exercise, desk job' },
  { label: 'Lightly Active', value: 'light', icon: 'walk', description: 'Light exercise/sports 1-3 days/week' },
  { label: 'Moderately Active', value: 'moderate', icon: 'bicycle', description: 'Moderate exercise/sports 3-5 days/week' },
  { label: 'Very Active', value: 'active', icon: 'barbell', description: 'Hard exercise/sports 6-7 days/week' },
  { label: 'Extremely Active', value: 'very_active', icon: 'flame', description: 'Very hard exercise/sports & physical job' },
];

// Define interface for activity option
interface ActivityOption {
  label: string;
  value: string;
  icon: string;
  description: string;
}

export default React.memo(function SelectActivityScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  // Use onboarding store to collect and save all data at once
  const { 
    setActivityLevel, 
    data, 
    isLoading: onboardingIsLoading, 
    saveAllAndComplete 
  } = useOnboardingStore();
  
  const { profile } = useUserProfileStore();
  
  const isOnboarding = pathname.startsWith('/(onboarding)');
  
  const [selectedActivity, setSelectedActivity] = useState<string | null>(profile?.activity_level || null);
  const [isLoading, setLoading] = useState(false);

  // Initialize from profile if needed
  useEffect(() => {
    if (profile?.activity_level && !data.activity_level && !selectedActivity) {
      setSelectedActivity(profile.activity_level);
    }
  }, [profile?.activity_level, data.activity_level, selectedActivity]);

  // Handle activity selection with useCallback
  const handleSelectActivity = useCallback((activity: string) => {
    setSelectedActivity(activity);
  }, []);

  // Handle completion with useCallback - save ALL data at once
  const handleDone = async () => {
    if (!user || !selectedActivity) return;

    try {
      setLoading(true);
      
      // Update activity level in store
      setActivityLevel(selectedActivity);
      
      // Save all data and mark onboarding complete
      const result = await saveAllAndComplete(user.id);
      
      if (!result.success) {
        Alert.alert(
          "Error",
          "Failed to save your profile. Please try again.",
          [{ text: "OK" }]
        );
        return;
      }

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      Alert.alert(
        "Error",
        "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Render an activity option - memoized for performance
  const renderActivityItem = useCallback(({ item }: { item: ActivityOption }) => {
    const isSelected = selectedActivity === item.value;
    
    return (
      <TouchableOpacity
        key={item.value}
        style={[
          styles.optionCard,
          isSelected && styles.selectedCard
        ]}
        onPress={() => handleSelectActivity(item.value)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={item.icon as any} 
          size={32} 
          color={isSelected ? '#fff' : '#3498db'} 
          style={styles.icon}
        />
        
        <View style={styles.textContainer}> 
          <Text style={[
            styles.optionLabel,
            isSelected && styles.selectedText
          ]}>
            {item.label}
          </Text>
          
          <Text style={[
            styles.optionDescription,
            isSelected && styles.selectedText
          ]}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [selectedActivity, handleSelectActivity]);

  // Use key extractor for FlatList
  const keyExtractor = useCallback((item: ActivityOption) => item.value, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Activity Level</Text>
        <Text style={styles.subtitle}>How active are you on a typical week?</Text>
      </View>

      {/* Use FlatList instead of ScrollView for better performance */}
      <FlatList
        data={ACTIVITY_LEVELS}
        renderItem={renderActivityItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.optionsContainer}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
      />

      <View style={styles.footer}>
        <Button 
          title={isOnboarding ? "Finish Setup" : "Done"}
          onPress={handleDone} 
          disabled={!selectedActivity}
          isLoading={isLoading}
          style={styles.doneButton}
        />
      </View>
    </SafeAreaView>
  );
});

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
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 1,
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