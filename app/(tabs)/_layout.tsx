import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useCompanionStore, useFoodStore } from '../../lib/stores';
import { useColorScheme, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';

// Re-define constants locally for headerRight styling
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
};
const COLORS = {
  card: '#ffffff',
  text: {
    primary: '#333333',
  },
};

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

// Component for Home Screen Header Actions
function HomeHeaderRight() {
  const router = useRouter();
  const navigateToFoodCamera = () => router.push('/food/camera');
  const navigateToFoodEntry = () => router.push('/food/entry');

  return (
    <View style={styles.headerRightContainer}>
      <TouchableOpacity onPress={navigateToFoodCamera} style={styles.headerRightButton} activeOpacity={0.7}>
        <Ionicons name="camera-outline" size={26} color={COLORS.text.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={navigateToFoodEntry} style={styles.headerRightButton} activeOpacity={0.7}>
        <Ionicons name="add-circle-outline" size={28} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const { user, checkSession } = useAuthStore();
  const { fetchCompanion } = useCompanionStore();
  const { fetchFoodLogs } = useFoodStore();
  const colorScheme = useColorScheme();
  
  // TEMPORARILY DISABLED: Auth checks for testing
  /*
  // Check for user session and redirect if not logged in
  useEffect(() => {
    const checkAuth = async () => {
      await checkSession();
    };
    
    checkAuth();
  }, []);
  
  // Fetch user data if logged in
  useEffect(() => {
    if (user) {
      fetchCompanion(user.id);
      fetchFoodLogs(user.id);
    } else {
      router.replace('/auth/login');
    }
  }, [user, router]);
  */
  
  // Create a mock user ID for testing
  useEffect(() => {
    // Use a fake user ID for testing
    const fakeUserId = "test-user-123";
    try {
      fetchCompanion(fakeUserId);
      fetchFoodLogs(fakeUserId);
    } catch (err) {
      console.log("Error loading test data:", err);
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'BiteBuddy',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: true,
          headerTitleAlign: 'left',
          headerRight: () => <HomeHeaderRight />,
          headerStyle: {
            backgroundColor: COLORS.card,
            elevation: Platform.OS === 'android' ? 4 : 0,
            shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
          },
          headerTintColor: COLORS.text.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      />
      
      <Tabs.Screen
        name="food-log"
        options={{
          title: 'Food Log',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          headerShown: true,
        }}
      />
      
      <Tabs.Screen
        name="companion"
        options={{
          title: 'Companion',
          tabBarIcon: ({ color }) => <TabBarIcon name="paw" color={color} />,
          headerShown: true,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

// Styles for HeaderRight component
const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerRightButton: {
    marginLeft: SPACING.md,
    padding: SPACING.xs,
  },
});
