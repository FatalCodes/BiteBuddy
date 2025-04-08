import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Activity level options for selection
const ACTIVITY_LEVELS = [
  { 
    value: 'sedentary', 
    label: 'Sedentary', 
    description: 'Little or no exercise', 
    icon: 'body', 
    color: '#95a5a6' 
  },
  { 
    value: 'light', 
    label: 'Lightly Active', 
    description: 'Light exercise 1-3 days/week', 
    icon: 'walk', 
    color: '#3498db' 
  },
  { 
    value: 'moderate', 
    label: 'Moderately Active', 
    description: 'Moderate exercise 3-5 days/week', 
    icon: 'bicycle', 
    color: '#2ecc71' 
  },
  { 
    value: 'very', 
    label: 'Very Active', 
    description: 'Hard exercise 6-7 days/week', 
    icon: 'fitness', 
    color: '#e74c3c' 
  },
  { 
    value: 'extra', 
    label: 'Extra Active', 
    description: 'Very hard exercise, physical job or training twice a day', 
    icon: 'flame', 
    color: '#e67e22' 
  }
];

export default function SelectActivityScreen() {
  const router = useRouter();
  const { initialValue = 'moderate', onSelect = '' } = useLocalSearchParams<{
    initialValue?: string;
    onSelect?: string;
  }>();
  
  const [selectedActivity, setSelectedActivity] = useState(initialValue);
  
  const handleSelect = (activityValue: string) => {
    setSelectedActivity(activityValue);
  };
  
  const handleDone = () => {
    // If onSelect contains a route path, navigate back to that route with the selected value
    if (onSelect) {
      // For onboarding or other custom return paths
      router.back();
      // Let the calling screen handle the value via its route params
      router.setParams({ activityLevel: selectedActivity });
    } else {
      // Default behavior for selecting from the physical details page
      router.push({
        pathname: '/settings/physical-details',
        params: { activityLevel: selectedActivity }
      });
    }
  };
  
  const renderActivityOption = ({ item }: { item: typeof ACTIVITY_LEVELS[0] }) => (
    <TouchableOpacity 
      style={[
        styles.optionContainer,
        selectedActivity === item.value && styles.selectedOption
      ]} 
      onPress={() => handleSelect(item.value)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={28} color="#fff" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.optionLabel}>{item.label}</Text>
        <Text style={styles.optionDescription}>{item.description}</Text>
      </View>
      {selectedActivity === item.value && (
        <Ionicons name="checkmark-circle" size={24} color={item.color} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Activity Level</Text>
        
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>How active are you?</Text>
        <Text style={styles.sectionSubtitle}>This helps calculate your calorie needs</Text>
        
        <FlatList
          data={ACTIVITY_LEVELS}
          renderItem={renderActivityOption}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.optionsList}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  doneButton: {
    padding: 8,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#777',
    marginBottom: 20,
  },
  optionsList: {
    paddingBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#d6e8ff',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#777',
  },
}); 