import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import NumberWheel from '../../lib/components/ui/NumberWheel';

export default function SelectWeightScreen() {
  const router = useRouter();
  const { initialValue = '70', onSelect = '' } = useLocalSearchParams<{
    initialValue?: string;
    onSelect?: string;
  }>();
  
  const handleValueSelected = (value: number) => {
    // If onSelect contains a route path, navigate back to that route with the selected value
    if (onSelect) {
      // For onboarding or other custom return paths
      router.back();
      // Let the calling screen handle the value via its route params
      router.setParams({ weight: value.toString() });
    } else {
      // Default behavior for selecting from the physical details page
      router.push({
        pathname: '/settings/physical-details',
        params: { weight: value.toString() }
      });
    }
  };
  
  return (
    <View style={styles.container}>
      <NumberWheel
        title="Weight"
        minValue={30}
        maxValue={250}
        step={0.5}
        precision={1}
        initialValue={parseFloat(initialValue)}
        unit="kg"
        alternateUnit="lb"
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