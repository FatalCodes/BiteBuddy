import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  SafeAreaView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/stores';

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const ACTIVITY_LEVELS = [
  { label: 'Sedentary (little or no exercise)', value: 'sedentary', multiplier: 1.2 },
  { label: 'Lightly active (light exercise 1-3 days/week)', value: 'light', multiplier: 1.375 },
  { label: 'Moderately active (moderate exercise 3-5 days/week)', value: 'moderate', multiplier: 1.55 },
  { label: 'Very active (hard exercise 6-7 days/week)', value: 'very', multiplier: 1.725 },
  { label: 'Extra active (very hard exercise, physical job or training twice a day)', value: 'extra', multiplier: 1.9 }
];

type SelectorPaths = 
  | '/settings/select-age'
  | '/settings/select-height'
  | '/settings/select-weight'
  | '/settings/select-goal-weight'
  | '/settings/select-gender'
  | '/settings/select-activity';

export default function PhysicalDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    age?: string;
    height?: string;
    weight?: string;
    goalWeight?: string;
    gender?: string;
    activityLevel?: string;
  }>();
  
  const isFirstRender = useRef(true);
  
  const { user } = useAuthStore();
  
  // Mock user for testing
  const currentUser = user || {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'Test User',
    created_at: new Date().toISOString(),
  };

  const [formData, setFormData] = useState({
    gender: 'Male',
    age: '30',
    height: '170', // cm
    weight: '70', // kg
    goalWeight: '65', // kg
    activityLevel: 'moderate'
  });

  // Update form data when URL params change (coming from selector screens)
  useEffect(() => {
    // Skip the first render to prevent an infinite loop
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Create a copy of existing data
    const updatedData = { ...formData };
    let hasUpdates = false;
    
    // Only update if the param exists AND is different from current value
    if (params.age && params.age !== formData.age) {
      updatedData.age = params.age;
      hasUpdates = true;
    }
    
    if (params.height && params.height !== formData.height) {
      updatedData.height = params.height;
      hasUpdates = true;
    }
    
    if (params.weight && params.weight !== formData.weight) {
      updatedData.weight = params.weight;
      hasUpdates = true;
    }
    
    if (params.goalWeight && params.goalWeight !== formData.goalWeight) {
      updatedData.goalWeight = params.goalWeight;
      hasUpdates = true;
    }
    
    if (params.gender && params.gender !== formData.gender) {
      updatedData.gender = params.gender;
      hasUpdates = true;
    }
    
    if (params.activityLevel && params.activityLevel !== formData.activityLevel) {
      updatedData.activityLevel = params.activityLevel;
      hasUpdates = true;
    }
    
    // Only update state if we actually have changes to make
    if (hasUpdates) {
      setFormData(updatedData);
    }
  }, [params]); // params is a stable reference within a single render cycle

  // Calculate BMI
  const calculateBMI = () => {
    const weightKg = parseFloat(formData.weight);
    const heightCm = parseFloat(formData.height);
    
    if (isNaN(weightKg) || isNaN(heightCm) || heightCm === 0) return 'N/A';
    
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return bmi.toFixed(1);
  };

  // Calculate daily calorie needs using the Mifflin-St Jeor Equation
  const calculateCalorieNeeds = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseFloat(formData.age);
    
    if (isNaN(weight) || isNaN(height) || isNaN(age)) return 'N/A';
    
    let bmr = 0;
    
    if (formData.gender === 'Male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (formData.gender === 'Female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // For other genders, use an average
      const maleBmr = 10 * weight + 6.25 * height - 5 * age + 5;
      const femaleBmr = 10 * weight + 6.25 * height - 5 * age - 161;
      bmr = (maleBmr + femaleBmr) / 2;
    }
    
    // Apply activity level multiplier
    const activityMultiplier = ACTIVITY_LEVELS.find(level => level.value === formData.activityLevel)?.multiplier || 1.2;
    const calories = bmr * activityMultiplier;
    
    return Math.round(calories);
  };

  // Function to navigate to selector screens
  const navigateToSelector = (selector: SelectorPaths, value: string) => {
    router.push({
      pathname: selector,
      params: { initialValue: value }
    });
  };

  // Get the display name for the activity level
  const getActivityLevelName = () => {
    const level = ACTIVITY_LEVELS.find(l => l.value === formData.activityLevel);
    return level ? level.label.split(' ')[0] : 'Select...';
  };

  // Function to handle form submission
  const handleSave = () => {
    // In a real app, save to user profile
    // For now, just show success and go back
    Alert.alert(
      'Success', 
      'Your physical details have been updated! Your recommended daily calorie intake is ' + calculateCalorieNeeds() + ' calories.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerCard}>
          <View style={styles.metricContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{calculateBMI()}</Text>
              <Text style={styles.metricLabel}>BMI</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{calculateCalorieNeeds()}</Text>
              <Text style={styles.metricLabel}>Daily Calories</Text>
            </View>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateToSelector('/settings/select-gender', formData.gender)}
          >
            <Ionicons name="person-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Gender</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{formData.gender}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateToSelector('/settings/select-age', formData.age)}
          >
            <Ionicons name="calendar-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Age</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{formData.age} years</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateToSelector('/settings/select-height', formData.height)}
          >
            <Ionicons name="resize-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Height</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{formData.height} cm</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateToSelector('/settings/select-weight', formData.weight)}
          >
            <Ionicons name="scale-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Weight</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{formData.weight} kg</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateToSelector('/settings/select-goal-weight', formData.goalWeight)}
          >
            <Ionicons name="flag-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Goal Weight</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{formData.goalWeight} kg</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateToSelector('/settings/select-activity', formData.activityLevel)}
          >
            <Ionicons name="fitness-outline" size={24} color="#666" style={styles.menuIcon} />
            <Text style={styles.menuText}>Activity Level</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{getActivityLevelName()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  metricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    width: 1,
    height: '70%',
    backgroundColor: '#eee',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 