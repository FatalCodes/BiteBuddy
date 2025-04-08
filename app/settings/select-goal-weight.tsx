import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import NumberWheel from '../../lib/components/ui/NumberWheel';
import { Ionicons } from '@expo/vector-icons';

export default function SelectGoalWeightScreen() {
  const router = useRouter();
  const { initialValue = '65', onSelect = '' } = useLocalSearchParams<{
    initialValue?: string;
    onSelect?: string;
  }>();
  
  const handleValueSelected = (value: number) => {
    // If onSelect contains a route path, navigate back to that route with the selected value
    if (onSelect) {
      // For onboarding or other custom return paths
      router.back();
      // Let the calling screen handle the value via its route params
      router.setParams({ goalWeight: value.toString() });
    } else {
      // Default behavior for selecting from the physical details page
      router.push({
        pathname: '/settings/physical-details',
        params: { goalWeight: value.toString() }
      });
    }
  };
  
  // Avatar component for the wheel selector
  const avatarComponent = (
    <View style={styles.avatarContainer}>
      <View style={styles.avatarIconContainer}>
        <Ionicons name="flag" size={32} color="#fff" />
      </View>
      <View style={styles.avatarTextContainer}>
        <Ionicons name="star" size={14} color="#FFD700" />
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <NumberWheel
        title="Target Weight"
        minValue={30}
        maxValue={250}
        step={0.5}
        precision={1}
        initialValue={parseFloat(initialValue)}
        unit="kg"
        alternateUnit="lb"
        onValueSelected={handleValueSelected}
        avatarComponent={avatarComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  avatarIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
}); 