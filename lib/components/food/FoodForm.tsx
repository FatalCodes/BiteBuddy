import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Image, TextInput, TouchableOpacity, Animated, Alert } from 'react-native';
import { Button, Input, Card } from '../ui';
import { FoodNutrition } from '../../../types';
import { useFoodStore } from '../../stores';
import { useRouter } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';

// Define the structure for an item in the breakdown
interface BreakdownItem {
  id: string; 
  item: string;
  quantity: number;
  unit: string;
  calories: number; // Add calories to the interface
}

interface FoodFormProps {
  initialValues?: Partial<FoodNutrition>;
  userId: string;
  onSuccess?: () => void;
  foodImage?: string; // Optional food image URI to animate
}

// Helper component for Nutrition Bar
const NutritionBar = ({ label, value, percentage, color }: { label: string; value: number; percentage: number; color: string }) => (
  <View style={styles.macroRow}>
    <Text style={styles.macroLabel}>{label}</Text>
    <View style={styles.macroBarContainer}>
      <View style={[styles.macroBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.macroValue}>{value}g</Text> 
  </View>
);

export const FoodForm: React.FC<FoodFormProps> = ({
  initialValues = {},
  userId,
  onSuccess,
  foodImage,
}) => {
  const router = useRouter();
  
  // Form fields state
  const [foodName, setFoodName] = useState(initialValues.food_name || '');
  const [servingSize, setServingSize] = useState(initialValues.serving_size || '');
  const [calories, setCalories] = useState(
    initialValues.calories !== undefined ? initialValues.calories.toString() : ''
  );
  const [protein, setProtein] = useState(
    initialValues.protein !== undefined ? initialValues.protein.toString() : ''
  );
  const [carbs, setCarbs] = useState(
    initialValues.carbs !== undefined ? initialValues.carbs.toString() : ''
  );
  const [fat, setFat] = useState(
    initialValues.fat !== undefined ? initialValues.fat.toString() : ''
  );
  const [healthScore, setHealthScore] = useState(
    initialValues.health_score !== undefined ? initialValues.health_score : null
  );
  
  // Validation state
  const [errors, setErrors] = useState<{
    foodName?: string;
    servingSize?: string;
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  }>({});

  // Get addFoodLog function from food store
  const { addFoodLog } = useFoodStore();

  // Create local loading state
  const [loading, setLoading] = useState(false);

  // Helper to add unique IDs and parse pros/cons
  const processBreakdownItems = (items: any[] = []): BreakdownItem[] => 
    items.map((item, index) => ({
      item: String(item.item || 'Unknown Item'),
      quantity: parseFloat(String(item.quantity).replace(/[^0-9.]/g, '')) || 0,
      unit: String(item.unit || 'unit'),
      id: item.id || `${Date.now()}-${index}-${Math.random()}`, 
      calories: parseFloat(String(item.calories).replace(/[^0-9.]/g, '')) || 0,
    }));

  // Initialize state with processed items
  const [itemsBreakdown, setItemsBreakdown] = useState<BreakdownItem[]>(processBreakdownItems(initialValues?.items_breakdown));

  // Add refs for Swipeable components if needed for programmatic closing (maybe later)
  // const swipeableRefs = useRef<Swipeable[]>([]);

  // Debug logging - add this
  useEffect(() => {
    console.log("FoodForm initialValues:", JSON.stringify(initialValues, null, 2));
    console.log("Does initialValues have description?", Boolean(initialValues?.description));
    console.log("Description value:", initialValues?.description);
    console.log("Initial items breakdown from props:", initialValues?.items_breakdown);
    
    // Only update the items breakdown if initialValues.items_breakdown exists and is different
    // from the current itemsBreakdown items
    if (initialValues?.items_breakdown) {
      const processedItems = processBreakdownItems(initialValues.items_breakdown);
      
      // Compare if the new items are different from current items to prevent infinite loops
      const currentItemsJSON = JSON.stringify(itemsBreakdown.map(item => ({
        item: item.item,
        quantity: item.quantity,
        unit: item.unit
      })));
      
      const newItemsJSON = JSON.stringify(processedItems.map(item => ({
        item: item.item,
        quantity: item.quantity,
        unit: item.unit
      })));
      
      // Only update state if the items are actually different
      if (currentItemsJSON !== newItemsJSON) {
        console.log("Updating itemsBreakdown due to changes in initialValues");
        setItemsBreakdown(processedItems);
      } else {
        console.log("Skipping itemsBreakdown update - no changes detected");
      }
    }
  }, [initialValues]);

  // Calculate macro percentages for bars
  const proteinG = initialValues.protein || 0;
  const carbsG = initialValues.carbs || 0;
  const fatG = initialValues.fat || 0;
  const totalGrams = proteinG + carbsG + fatG;
  const proteinPercent = totalGrams > 0 ? (proteinG / totalGrams) * 100 : 0;
  const carbsPercent = totalGrams > 0 ? (carbsG / totalGrams) * 100 : 0;
  const fatPercent = totalGrams > 0 ? (fatG / totalGrams) * 100 : 0;
  const caloriesVal = initialValues.calories || 0;

  // Check form validity WITHOUT setting state
  const isFormValidCheck = () => {
    const validationChecks = {
      foodName: Boolean(foodName),
      servingSize: Boolean(servingSize),
      calories: Boolean(calories) && !isNaN(Number(calories)) && Number(calories) >= 0,
      protein: Boolean(protein) && !isNaN(Number(protein)) && Number(protein) >= 0,
      carbs: Boolean(carbs) && !isNaN(Number(carbs)) && Number(carbs) >= 0,
      fat: Boolean(fat) && !isNaN(Number(fat)) && Number(fat) >= 0
    };
    
    const isValid = Object.values(validationChecks).every(Boolean);
    console.log("Form validity check:", validationChecks, "Result:", isValid);
    return isValid;
  };

  // Validate form inputs AND set errors state (only call on submit)
  const validateFormAndSetErrors = () => {
    const newErrors: {
      foodName?: string;
      servingSize?: string;
      calories?: string;
      protein?: string;
      carbs?: string;
      fat?: string;
    } = {};

    if (!foodName) newErrors.foodName = 'Food name is required';
    if (!servingSize) newErrors.servingSize = 'Serving size is required';
    if (!calories) {
      newErrors.calories = 'Calories are required';
    } else if (isNaN(Number(calories)) || Number(calories) < 0) {
      newErrors.calories = 'Please enter a valid number';
    }
    if (!protein) {
      newErrors.protein = 'Protein is required';
    } else if (isNaN(Number(protein)) || Number(protein) < 0) {
      newErrors.protein = 'Please enter a valid number';
    }
    if (!carbs) {
      newErrors.carbs = 'Carbs are required';
    } else if (isNaN(Number(carbs)) || Number(carbs) < 0) {
      newErrors.carbs = 'Please enter a valid number';
    }
    if (!fat) {
      newErrors.fat = 'Fat is required';
    } else if (isNaN(Number(fat)) || Number(fat) < 0) {
      newErrors.fat = 'Please enter a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler to update quantity for a specific item
  const handleQuantityChange = (index: number, text: string) => {
    const newQuantity = parseFloat(text.replace(/[^0-9.]/g, '')) || 0; // Allow decimals, default to 0
    const updatedItems = [...itemsBreakdown];
    updatedItems[index] = { ...updatedItems[index], quantity: newQuantity };
    setItemsBreakdown(updatedItems);
    console.log(`Updated item ${index} quantity to: ${newQuantity}`);
  };

  // Handler to delete an item from the breakdown
  const handleDeleteItem = (index: number) => {
    const updatedItems = itemsBreakdown.filter((_, i) => i !== index);
    setItemsBreakdown(updatedItems);
    console.log(`Deleted item at index: ${index}`);
    // Optionally close the row if using refs:
    // swipeableRefs.current[index]?.close(); 
  };

  // Function to render the delete action on swipe
  const renderRightActions = (index: number) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(index)} // Call delete handler
      >
        {/* Simple Text Delete Button */}
        <Animated.Text style={styles.deleteButtonText}>Delete</Animated.Text>
        {/* Or use an Icon 
        <Ionicons name="trash-outline" size={24} color="white" /> 
        */}
      </TouchableOpacity>
    );
  };

  // Submit food log
  const handleSubmit = async () => {
    console.log("Submit button clicked, validating form...");
    
    const isValid = validateFormAndSetErrors();
    console.log("Form validation result:", isValid, "Current errors:", errors);
    
    if (!isValid) {
      console.log("Form validation failed, returning early");
      return;
    }

    try {
      console.log("Setting loading state to true");
      setLoading(true);

      const foodData: FoodNutrition = {
        food_name: foodName,
        serving_size: servingSize,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        health_score: healthScore || undefined,
        description: initialValues?.description,
        items_breakdown: itemsBreakdown.map(({ id, ...rest }) => rest),
        health_tip: initialValues?.health_tip,
        positive_note: initialValues?.positive_note
      };

      console.log("Submitting food log with userId:", userId);
      console.log("Food data:", JSON.stringify(foodData, null, 2));
      
      // Handle image path for local storage
      // For local storage, we can use the image URI directly
      let imageToSave = foodImage;
      if (imageToSave) {
        console.log("Using image path for local storage:", imageToSave);
      }
      
      // Pass the image URI to the addFoodLog function
      const result = await addFoodLog(userId, foodData, imageToSave);
      console.log("addFoodLog result:", result);

      if (result.success) {
        // Show success feedback
        console.log("Food log saved successfully");
        
        // Always show confirmation alert
        Alert.alert(
          "Food Logged Successfully",
          `${foodName} (${servingSize}) has been added to your food log.`,
          [
            {
              text: "View Food Log",
              onPress: () => {
                if (onSuccess) {
                  console.log("Navigating to food log");
                  onSuccess();
                }
              }
            },
            {
              text: "OK",
              onPress: () => {
                if (onSuccess) {
                  console.log("Calling onSuccess callback");
                  onSuccess();
                }
              }
            }
          ]
        );
      } else {
        // Show error
        console.error("Failed to log food:", result.error);
        Alert.alert("Error", "Failed to save food log. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      console.log("Setting loading state to false");
      setLoading(false);
    }
  };

  // Get health score color based on value
  const getHealthScoreColor = (score?: number | null) => {
    if (score === null || score === undefined) return '#999';
    if (score >= 80) return '#2ecc71'; // Good - green (80-100)
    if (score >= 50) return '#f39c12'; // Medium - orange (50-79)
    return '#e74c3c'; // Poor - red (0-49)
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.title}>Log Food</Text>

          {/* Top Section: Image (with Score Badge) Left | Nutrition Bars Right */}
          {foodImage && (
            <View style={styles.imageNutritionRow}>
              {/* Image Container (Left Half) */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: foodImage }} style={styles.foodImageHalf} />
                {initialValues?.health_score !== null && initialValues?.health_score !== undefined && (
                  <View style={styles.healthScoreBadgeContainer}>
                    <View style={[styles.healthScoreBadgeCircle, { backgroundColor: getHealthScoreColor(initialValues.health_score) }]}>
                      <Text style={styles.healthScoreBadgeText}>{initialValues.health_score}</Text>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Nutrition Bars Container (Right Half) */}
              <View style={styles.nutritionBarsContainer}>
                <Text style={styles.caloriesText}>{caloriesVal} kcal</Text>
                <NutritionBar label="Protein" value={proteinG} percentage={proteinPercent} color="#3498db" />
                <NutritionBar label="Carbs" value={carbsG} percentage={carbsPercent} color="#2ecc71" />
                <NutritionBar label="Fat" value={fatG} percentage={fatPercent} color="#f39c12" />
              </View>
            </View>
          )}

          {/* Health Insights Section */}
          {(initialValues?.health_tip || initialValues?.positive_note) && (
            <View style={styles.healthInsightsContainer}>
              {initialValues.positive_note && (
                <View style={styles.insightRow}>
                  <View style={styles.insightIconContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
                  </View>
                  <Text style={styles.positiveNote}>{initialValues.positive_note}</Text>
                </View>
              )}
              {initialValues.health_tip && (
                <View style={styles.insightRow}>
                  <View style={styles.insightIconContainer}>
                    <Ionicons name="bulb" size={24} color="#f39c12" />
                  </View>
                  <Text style={styles.healthTip}>{initialValues.health_tip}</Text>
                </View>
              )}
            </View>
          )}

          {/* Editable Items Breakdown Section */}
          {itemsBreakdown.length > 0 && (
            <View style={styles.breakdownContainer}>
              <Text style={styles.breakdownLabel}>Edit Quantities (Swipe left to delete):</Text>
              {itemsBreakdown.map((item, index) => (
                <Swipeable
                  key={item.id}
                  renderRightActions={() => renderRightActions(index)} 
                >
                  <View style={styles.itemRow}>
                    <View style={styles.itemNameContainer}>
                      <Text style={styles.itemName}>{item.item}</Text>
                      <Text style={styles.itemCalories}>({item.calories} cal)</Text>
                    </View>
                    <View style={styles.quantityInputContainer}>
                      <TextInput
                        style={styles.quantityInput}
                        value={String(item.quantity)}
                        onChangeText={(text) => handleQuantityChange(index, text)}
                        keyboardType="numeric"
                        placeholder="Qty"
                        selectTextOnFocus
                      />
                      <Text style={styles.itemUnit}>{item.unit}</Text>
                    </View>
                  </View>
                </Swipeable>
              ))}
            </View>
          )}

          <Input
            label="Food Name"
            placeholder="e.g. Grilled Chicken Salad"
            value={foodName}
            onChangeText={setFoodName}
            error={errors.foodName}
          />

          <Input
            label="Serving Size"
            placeholder="e.g. 1 cup, 100g"
            value={servingSize}
            onChangeText={setServingSize}
            error={errors.servingSize}
          />

          <Input
            label="Calories"
            placeholder="e.g. 250"
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
            error={errors.calories}
          />

          <View style={styles.row}>
            <View style={styles.column}>
              <Input
                label="Protein (g)"
                placeholder="e.g. 20"
                keyboardType="numeric"
                value={protein}
                onChangeText={setProtein}
                error={errors.protein}
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.column}>
              <Input
                label="Carbs (g)"
                placeholder="e.g. 30"
                keyboardType="numeric"
                value={carbs}
                onChangeText={setCarbs}
                error={errors.carbs}
              />
            </View>
          </View>

          <Input
            label="Fat (g)"
            placeholder="e.g. 10"
            keyboardType="numeric"
            value={fat}
            onChangeText={setFat}
            error={errors.fat}
          />

          {/* Submit Button */}
          <Button 
            title="Log Food" 
            onPress={handleSubmit}
            // Use the check function that doesn't set state
            disabled={!isFormValidCheck() || loading} 
            style={styles.submitButton}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 40,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  separator: {
    width: 16,
  },
  button: {
    marginTop: 16,
  },
  previewButton: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#9C27B0', // Purple color for the preview button
  },
  healthScoreContainer: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  healthScoreLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  healthScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthScoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  healthScoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nutritionNotes: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  descriptionContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f0f0f0', // Light background for description
    borderRadius: 5,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 15,
    color: '#333',
  },
  warningText: {
    fontSize: 14,
    color: '#999',
  },
  scrollContent: {
    paddingBottom: 50, // Add padding to avoid keyboard overlap
  },
  // Add styles for breakdown section
  breakdownContainer: {
    marginTop: 15,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9', // Slightly different background
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  breakdownLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 10,
    color: '#555',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Increased padding slightly
    paddingHorizontal: 10, // Add horizontal padding
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white', // Ensure row has a background color for swipe reveal
  },
  itemNameContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
  },
  itemCalories: {
    fontSize: 14,
    color: '#666',
  },
  quantityInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: '40%',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    textAlign: 'right',
    minWidth: 50, // Ensure minimum width
    fontSize: 14,
    marginRight: 5,
  },
  itemUnit: {
    fontSize: 14,
    color: '#666',
    minWidth: 30, // Ensure unit text is not cut off
  },
  // Add styles for delete action
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80, // Width of the revealed button
    // Ensure it fills height if itemRow has dynamic height, or set fixed height
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Styles for the Top Row
  imageNutritionRow: {
    flexDirection: 'row',
    marginBottom: 25, // Increased margin
    height: 160, // Slightly increased height
  },
  imageContainer: {
    flex: 1, 
    marginRight: 15, // Increased space
    height: '100%',
    position: 'relative', // Needed for absolute positioning of the badge
  },
  foodImageHalf: {
    width: '100%',
    height: '100%',
    borderRadius: 10, // Slightly more rounded
    resizeMode: 'cover', 
  },
  // Styles for the Health Score Badge
  healthScoreBadgeContainer: {
    position: 'absolute',
    bottom: -10, // Increased offset from bottom
    right: -10, // Increased offset from right
  },
  healthScoreBadgeCircle: {
    width: 45, // Badge size
    height: 45,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)', // Default background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  healthScoreBadgeText: {
    color: 'white',
    fontSize: 18 ,
    fontWeight: 'bold',
  },
  // Improved Nutrition Bar Styles
  nutritionBarsContainer: {
    flex: 1, 
    justifyContent: 'center', // Center content vertically now
    paddingLeft: 5,
  },
  caloriesText: {
    fontSize: 20, // Larger calories text
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15, // More space below calories
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // More space between bars
  },
  macroLabel: {
    width: 55, // Wider label area
    fontSize: 13,
    fontWeight: '500', // Slightly bolder label
    color: '#444',
  },
  macroBarContainer: {
    flex: 1, 
    height: 12, // Thicker bar
    backgroundColor: '#e8e8e8', 
    borderRadius: 6,
    marginHorizontal: 8, 
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  macroValue: {
    width: 45, // Wider value area
    fontSize: 13,
    color: '#444',
    textAlign: 'right',
    fontWeight: '500',
  },
  healthInsightsContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    gap: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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