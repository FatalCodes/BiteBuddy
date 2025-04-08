import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Gender options for selection
const GENDER_OPTIONS = [
  { value: 'Male', icon: 'male', color: '#3498db' },
  { value: 'Female', icon: 'female', color: '#e84393' },
  { value: 'Other', icon: 'person', color: '#6c5ce7' },
  { value: 'Prefer not to say', icon: 'eye-off', color: '#a29bfe' }
];

export default function SelectGenderScreen() {
  const router = useRouter();
  const { initialValue = 'Male', onSelect = '' } = useLocalSearchParams<{
    initialValue?: string;
    onSelect?: string;
  }>();
  
  const [selectedGender, setSelectedGender] = useState(initialValue);
  
  const handleSelect = (gender: string) => {
    setSelectedGender(gender);
  };
  
  const handleDone = () => {
    // If onSelect contains a route path, navigate back to that route with the selected value
    if (onSelect) {
      // For onboarding or other custom return paths
      router.back();
      // Let the calling screen handle the value via its route params
      router.setParams({ gender: selectedGender });
    } else {
      // Default behavior for selecting from the physical details page
      router.push({
        pathname: '/settings/physical-details',
        params: { gender: selectedGender }
      });
    }
  };
  
  const renderGenderOption = ({ item }: { item: typeof GENDER_OPTIONS[0] }) => (
    <TouchableOpacity 
      style={[
        styles.optionContainer,
        selectedGender === item.value && styles.selectedOption
      ]} 
      onPress={() => handleSelect(item.value)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={28} color="#fff" />
      </View>
      <Text style={styles.optionText}>{item.value}</Text>
      {selectedGender === item.value && (
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
        
        <Text style={styles.title}>Gender</Text>
        
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select your gender</Text>
        
        <FlatList
          data={GENDER_OPTIONS}
          renderItem={renderGenderOption}
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
  optionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
}); 