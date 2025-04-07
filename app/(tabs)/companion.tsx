import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore, useCompanionStore } from '../../lib/stores';
import { CompanionDetail } from '../../lib/components';

export default function CompanionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { companion, fetchCompanion, isLoading } = useCompanionStore();
  
  // Fetch companion data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log('Companion screen focused, fetching data...');
        fetchCompanion(user.id);
      }
    }, [user, fetchCompanion]) // Dependencies: user and fetchCompanion
  );
  
  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }
  
  // Show error if no companion found
  if (!companion && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Oops! We couldn't find your companion.
        </Text>
        <Text style={styles.errorDescription}>
          Please try restarting the app or contacting support.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {companion && <CompanionDetail companion={companion} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 