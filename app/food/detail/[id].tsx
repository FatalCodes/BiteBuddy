import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFoodStore, useAuthStore } from '../../../lib/stores';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../lib/components/ui';
import { FoodLog } from '../../../types';

interface ExtendedFoodLog extends FoodLog {
  health_score?: number;
  nutrition_notes?: string;
  description?: string;
  items_breakdown?: Array<{
    item: string;
    quantity: number;
    unit: string;
    calories: number;
  }>;
  health_tip?: string;
  positive_note?: string;
}

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { foodLogs } = useFoodStore();
  const { user } = useAuthStore();
  const [foodLog, setFoodLog] = useState<ExtendedFoodLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && foodLogs) {
      const logId = Array.isArray(id) ? id[0] : id;
      const log = foodLogs.find(log => log.id === logId) as ExtendedFoodLog | undefined;
      
      console.log("Food log data:", JSON.stringify(log, null, 2));
      
      setFoodLog(log || null);
      setLoading(false);
    }
  }, [id, foodLogs]);

  const getHealthScoreColor = (score?: number | null) => {
    if (score === null || score === undefined) return 'rgba(150, 150, 150, 0.7)';
    if (score >= 80) return 'rgba(46, 204, 113, 0.8)'; // Good - green (80-100)
    if (score >= 50) return 'rgba(243, 156, 18, 0.8)'; // Medium - orange (50-79)
    return 'rgba(231, 76, 60, 0.8)'; // Poor - red (0-49)
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate macronutrient percentages for pie chart
  const calculateMacroPercentages = () => {
    if (!foodLog) return { protein: 0, carbs: 0, fat: 0 };
    
    const totalMacros = foodLog.protein + foodLog.carbs + foodLog.fat;
    if (totalMacros === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: Math.round((foodLog.protein / totalMacros) * 100),
      carbs: Math.round((foodLog.carbs / totalMacros) * 100),
      fat: Math.round((foodLog.fat / totalMacros) * 100)
    };
  };

  const macroPercentages = calculateMacroPercentages();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading food details...</Text>
      </View>
    );
  }

  if (!foodLog) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>Food Log Not Found</Text>
        <Text style={styles.errorText}>The food log you're looking for doesn't exist or has been deleted.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: foodLog.food_name, headerShown: true }} />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          {foodLog.image_url ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: foodLog.image_url }}
                style={styles.foodImage}
                resizeMode="cover"
              />
              
              {/* Health Score Badge */}
              {foodLog.health_score !== undefined && (
                <View style={[
                  styles.healthScoreBadge, 
                  { backgroundColor: getHealthScoreColor(foodLog.health_score) }
                ]}>
                  <Text style={styles.healthScoreText}>
                    {Math.round(foodLog.health_score)}
                  </Text>
                  <Text style={styles.healthScoreLabel}>Health Score</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="restaurant-outline" size={64} color="#ccc" />
            </View>
          )}
        </View>

        {/* Health Insights Section */}
        {(foodLog.health_tip || foodLog.positive_note) && (
          <Card style={styles.healthInsightsContainer}>
            <View style={styles.insightsHeader}>
              <Text style={styles.insightsTitle}>Health Insights</Text>
            </View>
            {foodLog.positive_note && (
              <View style={styles.insightRow}>
                <View style={styles.insightIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
                </View>
                <Text style={styles.positiveNote}>{foodLog.positive_note}</Text>
              </View>
            )}
            {foodLog.health_tip && (
              <View style={styles.insightRow}>
                <View style={styles.insightIconContainer}>
                  <Ionicons name="bulb" size={24} color="#f39c12" />
                </View>
                <Text style={styles.healthTip}>{foodLog.health_tip}</Text>
              </View>
            )}
          </Card>
        )}
        

        <Card style={styles.detailCard}>
          <Text style={styles.foodTitle}>{foodLog.food_name}</Text>
          <Text style={styles.servingSize}>{foodLog.serving_size}</Text>
          <Text style={styles.timestamp}>{formatDate(foodLog.created_at)}</Text>

          <View style={styles.caloriesContainer}>
            <Text style={styles.caloriesValue}>{foodLog.calories}</Text>
            <Text style={styles.caloriesLabel}>calories</Text>
          </View>
          
          <View style={styles.macrosContainer}>
            <View style={styles.macrosHeader}>
              <Text style={styles.macrosTitle}>Macronutrients</Text>
            </View>

            {/* Macro visualization */}
            <View style={styles.macroVisualization}>
              <View style={styles.macroBar}>
                <View style={[styles.macroProteinBar, { width: `${macroPercentages.protein}%` }]} />
                <View style={[styles.macroCarbsBar, { width: `${macroPercentages.carbs}%` }]} />
                <View style={[styles.macroFatBar, { width: `${macroPercentages.fat}%` }]} />
              </View>
              <View style={styles.percentageLabels}>
                <Text style={styles.percentText}>{macroPercentages.protein}%</Text>
                <Text style={styles.percentText}>{macroPercentages.carbs}%</Text>
                <Text style={styles.percentText}>{macroPercentages.fat}%</Text>
              </View>
            </View>

            {/* Macro details */}
            <View style={styles.macroDetails}>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, styles.proteinIndicator]} />
                <View style={styles.macroTextContainer}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{foodLog.protein}g</Text>
                </View>
              </View>

              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, styles.carbsIndicator]} />
                <View style={styles.macroTextContainer}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{foodLog.carbs}g</Text>
                </View>
              </View>

              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, styles.fatIndicator]} />
                <View style={styles.macroTextContainer}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <Text style={styles.macroValue}>{foodLog.fat}g</Text>
                </View>
              </View>
            </View>
          </View>

          {/* User Notes Section */}
          {foodLog.notes && foodLog.notes.length > 0 && (
            <View style={styles.userNotesContainer}>
              <Text style={styles.userNotesTitle}>Your Notes</Text>
              <Text style={styles.userNotesText}>{foodLog.notes}</Text>
            </View>
          )}
        </Card>

        
        {/* Food Item Breakdown Section */}
        {foodLog.items_breakdown && foodLog.items_breakdown.length > 0 && (
          <Card style={styles.itemsContainer}>
            <View style={styles.itemsHeader}>
              <Text style={styles.itemsTitle}>Food Breakdown</Text>
            </View>
            
            <View style={styles.itemsList}>
              {foodLog.items_breakdown.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.item}</Text>
                    <Text style={styles.itemCalories}>{item.calories} cal</Text>
                  </View>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}


        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => console.log("Edit food log:", foodLog.id)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => console.log("Delete food log:", foodLog.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f8f8',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    width: '90%',
    aspectRatio: 16/9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  healthScoreBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  healthScoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  healthScoreLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  placeholderImage: {
    width: 180,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
  },
  foodTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  servingSize: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  caloriesContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3498db',
  },
  caloriesLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  macrosContainer: {
    marginVertical: 16,
  },
  macrosHeader: {
    marginBottom: 16,
  },
  macrosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  macroVisualization: {
    marginBottom: 16,
  },
  macroBar: {
    height: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 8,
  },
  macroProteinBar: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  macroCarbsBar: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  macroFatBar: {
    height: '100%',
    backgroundColor: '#f39c12',
  },
  percentageLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  macroDetails: {
    marginTop: 16,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  proteinIndicator: {
    backgroundColor: '#3498db',
  },
  carbsIndicator: {
    backgroundColor: '#2ecc71',
  },
  fatIndicator: {
    backgroundColor: '#f39c12',
  },
  macroTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 16,
    color: '#333',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  itemsContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
  },
  itemsHeader: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemsList: {
    marginBottom: 0,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  itemCalories: {
    fontSize: 14,
    color: '#666',
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3498db',
    marginLeft: 16,
  },
  notesHeader: {
    marginBottom: 8,
  },
  nutritionNotes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  userNotesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  userNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  userNotesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  healthInsightsContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
  },
  insightsHeader: {
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 8,
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  positiveNote: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  healthTip: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
}); 