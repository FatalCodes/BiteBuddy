import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useFoodStore } from '../../lib/stores';
import { FoodCard, Card } from '../../lib/components';

export default function FoodLogScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { foodLogs, fetchFoodLogs, isLoading } = useFoodStore();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Current user or test user fallback
  const currentUser = user || {
    id: 'test-user-id',
    email: 'test@example.com'
  };
  
  // Fetch food logs when the screen mounts or when user changes
  useEffect(() => {
    console.log("Food log screen mounted, fetching logs for user:", currentUser.id);
    refreshFoodLogs();
  }, [currentUser.id]);
  
  // Define refresh function
  const refreshFoodLogs = async () => {
    console.log("Refreshing food logs for user ID:", currentUser.id);
    setRefreshing(true);
    try {
      await fetchFoodLogs(currentUser.id);
      console.log(`Fetched ${foodLogs.length} food logs`);
    } catch (error) {
      console.error("Error refreshing food logs:", error);
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  };
  
  // Navigate to manual food entry
  const navigateToFoodEntry = () => {
    router.push('/food/entry');
  };
  
  // Navigate to camera food entry
  const navigateToFoodCamera = () => {
    router.push('/food/camera');
  };
  
  // Render header with action buttons
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Your Food Log</Text>
        <Text style={styles.subtitle}>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToFoodEntry}
        >
          <Ionicons name="create-outline" size={24} color="#3498db" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToFoodCamera}
        >
          <Ionicons name="camera-outline" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state when no food logs
  const renderEmpty = () => (
    <Card style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Food Logs Yet</Text>
      <Text style={styles.emptyText}>
        Start tracking your meals to see how they affect your companion.
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={navigateToFoodEntry}
      >
        <Text style={styles.addButtonText}>Log Your First Meal</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={foodLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FoodCard foodLog={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshFoodLogs}
            colors={["#3498db"]}
            tintColor="#3498db"
          />
        }
      />
      
      <TouchableOpacity
        style={styles.fabButton}
        onPress={navigateToFoodEntry}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
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
    padding: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  list: {
    padding: 16,
    paddingTop: 0,
    minHeight: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    margin: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
}); 