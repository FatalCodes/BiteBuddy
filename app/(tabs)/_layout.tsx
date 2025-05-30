import React, { useEffect } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useCompanionStore, useFoodStore } from '../../lib/stores';
import { useColorScheme, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/Colors';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
};
const COLORS = {
  primary: '#007AFF',
  card: '#ffffff',
  text: {
    primary: '#333333',
  },
  tabIconDefault: '#ccc',
  background: '#ffffff',
};


const ACTIVE_TAB_COLOR = '#007AFF'; 

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: 0 }} {...props} />;
}

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

function CustomTabBar(props: BottomTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToCamera = () => {
    router.push('/food/camera');
  };

  if (pathname === '/food/camera') {
    return null;
  }

  return (
    <View style={styles.tabBarContainer}>
      <TouchableOpacity onPress={navigateToCamera} style={styles.fabContainer} activeOpacity={0.8}>
        <View style={styles.fab}>
          <Ionicons name="add" size={32} color="#fff" />
        </View>
      </TouchableOpacity>
      
      {Platform.OS === 'ios' ? (
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
      )}


      <BottomTabBar {...props} />
    </View>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const { user, checkSession } = useAuthStore();
  const { fetchCompanion } = useCompanionStore();
  const { fetchFoodLogs } = useFoodStore();
  const colorScheme = useColorScheme();
  
  
  // Create a mock user ID for testing
  useEffect(() => {
    const fakeUserId = "test-user-123";
    try {
      fetchCompanion(fakeUserId);
      fetchFoodLogs(fakeUserId);
    } catch (err) {
      console.log("Error loading test data:", err);
    }
  }, []);


  const activeColor = ACTIVE_TAB_COLOR;
  const inactiveColor = '#CCCCCC';

  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({ 
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          height: Platform.OS === 'ios' ? 80 : 60,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: {
          padding: 6,
          ...(route.name === 'food-log' && { marginRight: 30 }),
          ...(route.name === 'companion' && { marginLeft: 30 }),
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="home" color={color} />,
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
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="list" color={color} />,
          headerShown: true,
        }}
      />
      
      <Tabs.Screen
        name="companion"
        options={{
          title: 'Companion',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="paw" color={color} />,
          headerShown: true,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="person" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

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
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
  },
  fabContainer: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ACTIVE_TAB_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  androidBackground: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
});
