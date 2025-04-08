import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import NumberWheel from '../../lib/components/ui/NumberWheel';

export default function SelectHeightScreen() {
  const router = useRouter();
  const { initialValue = '170', onSelect = '' } = useLocalSearchParams<{
    initialValue?: string;
    onSelect?: string;
  }>();
  
  const handleValueSelected = (value: number) => {
    // If onSelect contains a route path, navigate back to that route with the selected value
    if (onSelect) {
      // For onboarding or other custom return paths
      router.back();
      // Let the calling screen handle the value via its route params
      router.setParams({ height: value.toString() });
    } else {
      // Default behavior for selecting from the physical details page
      router.push({
        pathname: '/settings/physical-details',
        params: { height: value.toString() }
      });
    }
  };
  
  return (
    <View style={styles.container}>
      <NumberWheel
        title="Height"
        minValue={100}
        maxValue={220}
        step={1}
        initialValue={parseInt(initialValue, 10)}
        unit="cm"
        alternateUnit="in"
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