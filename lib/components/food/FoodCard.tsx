import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, TouchableOpacity } from 'react-native';
import { Card } from '../ui';
import { FoodLog } from '../../../types';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Extended FoodLog interface to include health_score from FoodNutrition
interface ExtendedFoodLog extends FoodLog {
  health_score?: number;
}

interface FoodCardProps {
  foodLog: ExtendedFoodLog;
  onPress?: () => void;
  style?: ViewStyle;
}

export const FoodCard: React.FC<FoodCardProps> = ({ foodLog, onPress, style }) => {
  const router = useRouter();
  const defaultOnPress = () => {
    // Navigate to the food detail screen
    router.push(`/food/detail/${foodLog.id}` as any);
    console.log("Food card pressed:", foodLog.food_name);
  };
  
  const handlePress = onPress || defaultOnPress;

  // Calculate percentage of macros
  const totalMacros = foodLog.protein + foodLog.carbs + foodLog.fat;
  const proteinPercentage = totalMacros > 0 ? Math.round((foodLog.protein / totalMacros) * 100) : 0;
  const carbsPercentage = totalMacros > 0 ? Math.round((foodLog.carbs / totalMacros) * 100) : 0;
  const fatPercentage = totalMacros > 0 ? 100 - proteinPercentage - carbsPercentage : 0;

  // Function to get color for health score badge
  const getHealthScoreColor = (score?: number | null) => {
    if (score === null || score === undefined) return 'rgba(150, 150, 150, 1)';
    if (score >= 80) return 'rgba(46, 204, 113, 1)'; // Good - green (80-100)
    if (score >= 50) return 'rgba(243, 156, 18, 1)'; // Medium - orange (50-79)
    return 'rgba(231, 76, 60, 1)'; // Poor - red (0-49)
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.cardContainer, style]} activeOpacity={0.8}>
      <Card style={styles.card}> 
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            {foodLog.image_url ? (
              <>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: foodLog.image_url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
                {foodLog.health_score !== undefined && (
                  <View style={[
                    styles.healthScoreBadge,
                    { backgroundColor: getHealthScoreColor(foodLog.health_score) }
                  ]}>
                    <Text style={styles.healthScoreText}>{Math.round(foodLog.health_score)}</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="restaurant-outline" size={24} color="#ccc" />
              </View>
            )}
          </View>
          
          <View style={styles.content}>
            <Text style={styles.foodName} numberOfLines={1} ellipsizeMode="tail">{foodLog.food_name}</Text>
            <Text style={styles.servingSize}>{foodLog.serving_size}</Text>
            
            <View style={styles.macrosContainer}>
              <View style={styles.macrosBar}>
                <View style={[styles.macroProtein, { width: `${proteinPercentage}%` }]} />
                <View style={[styles.macroCarbs, { width: `${carbsPercentage}%` }]} />
                <View style={[styles.macroFat, { width: `${fatPercentage}%` }]} />
              </View>
              
              <View style={styles.macrosLegend}>
                <Text style={styles.macroText}>P: {foodLog.protein}g</Text>
                <Text style={styles.macroText}>C: {foodLog.carbs}g</Text>
                <Text style={styles.macroText}>F: {foodLog.fat}g</Text>
              </View>
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.calories}>{foodLog.calories} kcal</Text>
              <Text style={styles.date}>{formatDate(foodLog.created_at)}</Text>
            </View>
          </View>

          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 8,
  },
  card: {
    padding: 12, // Add padding to the card itself
    borderRadius: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically
  },
  imageContainer: {
    width: 64, // Slightly smaller image
    height: 64,
    marginRight: 12,
    position: 'relative', // For absolute positioning of badge
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  healthScoreBadge: {
    position: 'absolute',
    bottom: -5, // Position from bottom of container
    right: -5, // Position from right of container
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 1, // Ensure badge appears above other elements
  },
  healthScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Vertically center content
  },
  foodName: {
    fontSize: 15, // Slightly smaller
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  servingSize: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  macrosContainer: {
    marginBottom: 6,
  },
  macrosBar: {
    height: 5, // Thinner bar
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 4,
  },
  macroProtein: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  macroCarbs: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  macroFat: {
    height: '100%',
    backgroundColor: '#f39c12',
  },
  macrosLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align left
  },
  macroText: {
    fontSize: 11, // Smaller text
    color: '#666',
    marginRight: 8, // Space between legends
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4, // Add a bit of top margin
  },
  calories: {
    fontSize: 13, // Smaller
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 11,
    color: '#999',
  },
  chevronContainer: {
    marginLeft: 8, // Space before chevron
    justifyContent: 'center',
  },
}); 