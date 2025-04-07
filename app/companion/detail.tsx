import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore, useCompanionStore } from '../../lib/stores';
import { CompanionDetail } from '../../lib/components';

export default function CompanionDetailScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { companion, isLoading } = useCompanionStore();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!companion) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Stack.Screen
        options={{
          title: companion.name,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#fff',
          },
          headerTransparent: true,
          headerTintColor: '#fff',
        }}
      />
      
      <CompanionDetail companion={companion} />
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
}); 