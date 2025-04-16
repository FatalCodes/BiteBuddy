import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { NumberWheel } from '../../lib/components/ui';
import { useAuthStore, useUserProfileStore } from '../../lib/stores';
import { Button } from '../../lib/components';

export default function SelectAgeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useUserProfileStore();
  
  const isOnboarding = pathname.startsWith('/onboarding');
  
  const [selectedAge, setSelectedAge] = useState<number>(profile?.age || 25);

  useEffect(() => {
    if (profile?.age) {
      setSelectedAge(profile.age);
    }
  }, [profile]);

  const handleDone = async () => {
    if (!user) return;

    const result = await updateProfile(user.id, { age: selectedAge });
    
    if (result.success) {
      if (isOnboarding) {
        router.push('/onboarding/select-height' as any);
      } else {
        router.back();
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to save age.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Age</Text>
        <Text style={styles.subtitle}>This helps personalize your recommendations.</Text>
      </View>

      <View style={styles.wheelContainer}>
        <NumberWheel
          title="Age"
          initialValue={selectedAge}
          minValue={13}
          maxValue={100}
          onValueSelected={setSelectedAge}
          unit="years"
        />
      </View>

      <View style={styles.footer}>
        <Button 
          title={isOnboarding ? "Next" : "Done"}
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
    justifyContent: 'space-between',
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
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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