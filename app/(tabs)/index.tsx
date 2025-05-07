import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl, Image, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore, useCompanionStore, useFoodStore } from '../../lib/stores';
import { Card, CompanionCard, FoodCard } from '../../lib/components';
import { formatDate } from '../../lib/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#3498db',
  secondary: '#2ecc71',
  tertiary: '#f39c12',
  background: '#f8f9fb',
  card: '#ffffff',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
  },
  border: '#eeeeee',
  shadow: '#000000',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { companion, fetchCompanion, updateCompanionStats, isLoading: companionLoading } = useCompanionStore();
  const { foodLogs, fetchFoodLogs, isLoading: foodLogsLoading } = useFoodStore();
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const currentUser = user || {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'BiteBuddy User',
    created_at: new Date().toISOString(),
  };
  
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealCount: 0
  });
  
  const today = new Date();
  const formattedDate = formatDate(today.toISOString());
  
  const dailyCalorieGoal = 2000;
  
  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      if (!initialLoadComplete) setInitialLoadComplete(false);
    }
    console.log("Loading data for user:", currentUser.id);
    try {
      await Promise.all([
        fetchFoodLogs(currentUser.id),
        fetchCompanion(currentUser.id)
      ]);
      console.log("Data fetch calls completed successfully");
      if (!isRefresh) setInitialLoadComplete(true);
    } catch (error) {
      console.error("Error loading data:", error);
      if (!isRefresh) setInitialLoadComplete(true);
    }
  }, [currentUser.id, fetchFoodLogs, fetchCompanion, initialLoadComplete]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  };
  
  // Calculate stats whenever food logs change
  useEffect(() => {
    if (foodLogs.length > 0) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayLogs = foodLogs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= todayStart;
      });
      
      const stats = todayLogs.reduce((acc, log) => {
        return {
          calories: acc.calories + log.calories,
          protein: acc.protein + log.protein,
          carbs: acc.carbs + log.carbs,
          fat: acc.fat + log.fat,
          mealCount: acc.mealCount + 1
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 });
      
      setTodayStats(stats);
    }
  }, [foodLogs]);
  
  // --- Companion Stat Calculation Functions ---
  const calculateCompanionEnergy = (caloriePercentage: number): number => {
    if (caloriePercentage >= 90) return 95;
    if (caloriePercentage >= 60) return 75;
    if (caloriePercentage >= 30) return 50;
    return 20;
  };

  const calculateCompanionHealth = (averageHealthScore: number | null): number => {
    if (averageHealthScore === null || isNaN(averageHealthScore)) return 50; // Default health if no score
    // Map health_score (1-10) to companion health (0-100)
    // Example: score of 1 -> 10 health, score of 5 -> 50 health, score of 10 -> 100 health
    return Math.max(0, Math.min(averageHealthScore * 10, 100)); 
  };

  const calculateCompanionHappiness = (health: number, energy: number): number => {
    // Simple average, clamped. Healthier and more energetic = happier.
    const average = (health + energy) / 2;
    return Math.max(0, Math.min(average, 100));
  };
  // --- End Companion Stat Calculation Functions ---

  // useEffect to calculate stats and update companion energy when foodLogs or companion data changes
  useEffect(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayLogs = foodLogs.filter(log => new Date(log.created_at) >= todayStart);

    const newTodayStats = todayLogs.reduce((acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
      mealCount: acc.mealCount + 1
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 });
    
    setTodayStats(newTodayStats);

    if (currentUser.id && companion) { // Ensure companion is loaded before trying to update its energy
      const currentCaloriePercentage = Math.min(Math.round((newTodayStats.calories / dailyCalorieGoal) * 100), 100);
      const newEnergy = calculateCompanionEnergy(currentCaloriePercentage);
      
      // Calculate Health based on average health_score of today's food logs
      let avgHealthScore: number | null = null;
      if (todayLogs.length > 0) {
        const totalHealthScore = todayLogs.reduce((sum, log) => sum + (log.health_score || 0), 0);
        // Ensure health_score exists and is a number for items included in average
        const logsWithHealthScore = todayLogs.filter(log => typeof log.health_score === 'number');
        if (logsWithHealthScore.length > 0) {
           avgHealthScore = totalHealthScore / logsWithHealthScore.length;
        } else {
           avgHealthScore = 5; // Default average score if no logs have score (maps to 50 health)
        }
      } else {
        avgHealthScore = 3; // Lower default if no food logged (maps to 30 health)
      }
      const newHealth = calculateCompanionHealth(avgHealthScore);

      // Calculate Happiness based on new Health and new Energy
      const newHappiness = calculateCompanionHappiness(newHealth, newEnergy);

      // Check if any stat actually changed before updating
      if (companion.energy !== newEnergy || companion.health !== newHealth || companion.happiness !== newHappiness) {
        console.log(`Updating companion stats - H:${newHealth}, P:${newHappiness}, E:${newEnergy}`);
        updateCompanionStats(currentUser.id, { 
          health: newHealth, 
          happiness: newHappiness, 
          energy: newEnergy 
        });
      }
    }
  }, [foodLogs, currentUser.id, companion, updateCompanionStats, dailyCalorieGoal]); // Add companion & updateCompanionStats to deps
  
  const navigateToFoodEntry = () => {
    router.push('/food/entry');
  };
  
  const navigateToCompanionDetail = () => {
    router.push('/companion/detail');
  };
  
  const navigateToFoodLog = () => {
    router.navigate('/(tabs)/food-log');
  };
  
  const navigateToFoodCamera = () => {
    router.push('/food/camera');
  };

  interface NutritionBarProps {
    label: string;
    value: number;
    color: string;
    max?: number;
    icon?: string;
  }
  
  const NutritionBar = ({ label, value, color, max = 100, icon }: NutritionBarProps) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <View style={styles.nutritionBarContainer}>
        <View style={styles.nutritionBarLabelContainer}>
          {icon && (
            <MaterialCommunityIcons name={icon as any} size={16} color={color} style={styles.nutritionBarIcon} />
          )}
          <Text style={styles.nutritionBarLabel}>{label}</Text>
          <Text style={styles.nutritionBarValue}>{Math.round(value)}g</Text>
        </View>
        <View style={styles.nutritionBarTrack}>
          <View style={[styles.nutritionBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  const calculateMacroPercentages = () => {
    const { protein, carbs, fat } = todayStats;
    const totalGrams = protein + carbs + fat;
    
    if (totalGrams === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: Math.round((protein / totalGrams) * 100),
      carbs: Math.round((carbs / totalGrams) * 100),
      fat: Math.round((fat / totalGrams) * 100)
    };
  };
  
  const macroPercentages = useMemo(() => {
    const { protein, carbs, fat } = todayStats;
    const totalGrams = protein + carbs + fat;
    if (totalGrams === 0) return { protein: 0, carbs: 0, fat: 0 };
    return {
      protein: Math.round((protein / totalGrams) * 100),
      carbs: Math.round((carbs / totalGrams) * 100),
      fat: Math.round((fat / totalGrams) * 100)
    };
  }, [todayStats]);
  
  // Calculate caloriePercentage for UI based on the latest todayStats
  const caloriePercentage = useMemo(() => {
    return Math.min(Math.round((todayStats.calories / dailyCalorieGoal) * 100), 100);
  }, [todayStats.calories, dailyCalorieGoal]);

  // Use a combined loading state from stores for the initial full screen loader
  const showFullScreenLoader = foodLogsLoading || companionLoading || !initialLoadComplete;

  if (showFullScreenLoader) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your BiteBuddy dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + SPACING.xl }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh} 
          colors={[COLORS.primary]} 
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Today's Nutrition Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Nutrition</Text>
          <TouchableOpacity onPress={navigateToFoodLog} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>View History</Text>
          </TouchableOpacity>
        </View>
        
        <Card style={styles.card}>
          {/* Calories Display */}
          <View style={styles.calorieContainer}>
            <View style={styles.calorieTextContainer}>
              <Text style={styles.calorieValue}>{todayStats.calories}</Text>
              <Text style={styles.calorieLabel}>CALORIES</Text>
            </View>
            <View style={styles.calorieProgressContainer}>
              <View style={styles.calorieProgressOuter}>
                <View style={[styles.calorieProgressInner, { width: `${caloriePercentage}%` }]} />
              </View>
              <Text style={styles.calorieGoalText}>{caloriePercentage}% of {dailyCalorieGoal} kcal goal</Text>
            </View>
          </View>
          
          {/* Nutrition Progress Bars */}
          <View style={styles.nutritionBarsContainer}>
            <NutritionBar label="Protein" value={todayStats.protein} color={COLORS.primary} max={50} icon="food-steak" />
            <NutritionBar label="Carbs" value={todayStats.carbs} color={COLORS.secondary} max={200} icon="bread-slice" />
            <NutritionBar label="Fat" value={todayStats.fat} color={COLORS.tertiary} max={70} icon="oil" />
          </View>
          
          {/* Meal Count and Log More Button */}
          <View style={styles.mealsInfoContainer}>
            <Text style={styles.mealCount}>
              <Text style={styles.mealCountNumber}>{todayStats.mealCount}</Text> meal{todayStats.mealCount !== 1 ? 's' : ''} logged today
            </Text>
            <TouchableOpacity style={styles.logMoreButton} onPress={navigateToFoodEntry} activeOpacity={0.7}>
              <Text style={styles.logMoreButtonText}>Log Meal</Text>
              <Ionicons name="add-circle-outline" size={18} color="#fff" style={styles.logMoreIcon} />
            </TouchableOpacity>
          </View>
        </Card>
      </View>
      

      {companion && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Companion</Text>
            <TouchableOpacity onPress={navigateToCompanionDetail} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <CompanionCard companion={companion} onPress={navigateToCompanionDetail} />

        </View>
      )}
      
      {/* Recent Food Logs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Food Logs</Text>
          <TouchableOpacity onPress={navigateToFoodLog} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {foodLogs.length > 0 ? (
          <View style={styles.foodLogListContainer}>
            {foodLogs.slice(0, 3).map(foodLog => (
              <FoodCard key={foodLog.id} foodLog={foodLog} style={styles.foodCard} />
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="restaurant-outline" size={40} color="#ccc" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>
              No meals logged today. Let's track something!
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={navigateToFoodEntry}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="#fff" style={styles.addButtonIcon} />
              <Text style={styles.addButtonText}>Add First Meal</Text>
            </TouchableOpacity>
          </Card>
        )}
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>BiteBuddy</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  card: {
    borderRadius: 16,
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  calorieContainer: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
  },
  calorieTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  calorieLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    letterSpacing: 0.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  calorieProgressContainer: {
    marginTop: SPACING.xs,
  },
  calorieProgressOuter: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  calorieProgressInner: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  calorieGoalText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
    textAlign: 'right',
  },
  nutritionBarsContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  nutritionBarContainer: {
    marginBottom: SPACING.md,
  },
  nutritionBarLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  nutritionBarIcon: {
    marginRight: SPACING.sm,
  },
  nutritionBarLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  nutritionBarValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  nutritionBarTrack: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  nutritionBarFill: {
    height: 8,
    borderRadius: 4,
  },
  mealsInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  mealCountNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text.primary,
  },
  logMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logMoreButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  logMoreIcon: {
    marginLeft: SPACING.sm,
  },
  foodLogListContainer: {
    // Container for FoodCards if needed for specific list styling
  },
  foodCard: {
    marginBottom: SPACING.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    marginBottom: SPACING.md,
    color: COLORS.text.light,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addButtonIcon: {
    marginRight: SPACING.sm,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.text.light,
    fontWeight: '500',
  },
});
