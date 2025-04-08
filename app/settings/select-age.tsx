import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import NumberWheel from '../../lib/components/ui/NumberWheel';

export default function SelectAgeScreen() {
  const router = useRouter();
  const { initialValue = '30', onSelect = '' } = useLocalSearchParams<{
    initialValue?: string;
    onSelect?: string;
  }>();
  
  const handleValueSelected = (value: number) => {
    // If onSelect contains a route path, navigate back to that route with the selected value
    if (onSelect) {
      // For onboarding or other custom return paths
      router.back();
      // Let the calling screen handle the value via its route params
      router.setParams({ age: value.toString() });
    } else {
      // Default behavior for selecting from the physical details page
      router.push({
        pathname: '/settings/physical-details',
        params: { age: value.toString() }
      });
    }
  };
  
  return (
    <View style={styles.container}>
      <NumberWheel
        title="Age"
        minValue={13}
        maxValue={100}
        step={1}
        initialValue={parseInt(initialValue, 10)}
        onValueSelected={handleValueSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 