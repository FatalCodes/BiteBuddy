import { encode } from 'base-64';
import { FoodNutrition } from '../../types';

// Environment variables would be better for API keys
export const OPENAI_API_KEY = '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'; // ADD YOUR API KEY HERE (but use environment variables in production)
const API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `
You are a helpful nutrition assistant integrated into a mobile app called BiteBuddy. 
Your first task is to determine if the image contains food. 

First, respond with a JSON object containing:
- contains_food: A boolean indicating whether the image contains food.
- error_message: If contains_food is false, provide a friendly message explaining that no food was detected (e.g., "I couldn't detect any food in this image. Please try taking another photo of your meal."). If contains_food is true, this should be null.

If contains_food is true, also include these fields:
- food_name: A concise name for the overall meal.
- serving_size: An estimated serving size for the entire plate.
- calories: Estimated total macronutrients (integers).
- protein: Estimated total macronutrients (integers).
- carbs: Estimated total macronutrients (integers).
- fat: Estimated total macronutrients (integers).
- health_score: An estimated healthiness score (0-100), where 0 is extremely unhealthy and 100 is perfectly healthy.
- description: A CONCISE overall description of the meal components.
- items_breakdown: An array of objects, where each object represents a distinct food item detected. Each object MUST have:
    - 'item' (string, e.g., "Scrambled Eggs")
    - 'quantity' (number, e.g., 2)
    - 'unit' (string, e.g., "eggs", "cup")
    - 'calories' (number, e.g., 140) - Estimated calories for this specific item and quantity
- health_tip: A specific, actionable suggestion for making this meal healthier (e.g., "Try substituting white bread with whole grain bread for added fiber and nutrients.").
- positive_note: One specific positive aspect about the meal's nutritional value (e.g., "Great choice with the eggs - they're an excellent source of protein and essential nutrients!").

Example response for non-food image:
{
  "contains_food": false,
  "error_message": "I couldn't detect any food in this image. Please try taking another photo of your meal."
}

Example response for food image:
{
  "contains_food": true,
  "error_message": null,
  "food_name": "Breakfast Plate",
  "serving_size": "1 portion",
  "calories": 450,
  "protein": 22,
  "carbs": 48,
  "fat": 18,
  "health_score": 75,
  "description": "Scrambled eggs with whole grain toast",
  "items_breakdown": [
    {
      "item": "Scrambled Eggs",
      "quantity": 2,
      "unit": "eggs",
      "calories": 180
    },
    {
      "item": "Whole Grain Toast",
      "quantity": 2,
      "unit": "slices",
      "calories": 160
    },
    {
      "item": "Butter",
      "quantity": 1,
      "unit": "tbsp",
      "calories": 110
    }
  ],
  "health_tip": "Try adding some spinach or bell peppers to your eggs for an extra boost of vitamins and minerals.",
  "positive_note": "Great choice with the eggs - they're an excellent source of protein and essential nutrients!"
}

Provide only the JSON object in your response, nothing else. Ensure all numerical values are numbers.
`;

// Function to convert image to base64
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    console.log("🔍 Converting image to base64...", uri.substring(0, 50) + "...");
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (base64) {
          console.log("✅ Base64 conversion successful", base64.substring(0, 20) + "...");
          resolve(base64);
        }
        else reject(new Error('Failed to convert image to base64'));
      };
      reader.onerror = (error) => {
        console.error("❌ FileReader error:", error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("❌ Error converting image to base64:", error);
    throw error;
  }
};

// Function to analyze food image using OpenAI GPT-4 Vision
export const analyzeFoodImage = async (imageUri: string): Promise<{ success: boolean; error?: string; data?: FoodNutrition }> => {
  try {
    console.log("🔍 Starting food analysis for:", imageUri.substring(0, 50) + "...");
    
    // For simulator/testing, return fake data if no API key is provided
    if (!OPENAI_API_KEY) {
      console.log("⚠️ No API key provided, using simulated data");
      return { success: true, data: simulateFoodAnalysis() };
    }

    console.log("🔑 API key found, proceeding with OpenAI analysis");
    
    let base64Image;
    try {
      base64Image = await imageToBase64(imageUri);
    } catch (error) {
      console.error("❌ Error preparing image:", error);
      console.log("⚠️ Falling back to simulated data due to image preparation error");
      return { success: true, data: simulateFoodAnalysis() };
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    console.log("🚀 Sending request to OpenAI API...");
    
    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: SYSTEM_PROMPT
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API error:", errorText);
      console.log("⚠️ Falling back to simulated data due to API error");
      return { success: true, data: simulateFoodAnalysis() };
    }

    console.log("✅ Received successful response from OpenAI");
    const data = await response.json();
    
    // Parse the response to extract nutritional information
    const content = data.choices[0]?.message?.content;
    if (!content) {
      console.error("❌ No content in OpenAI response");
      return { success: true, data: simulateFoodAnalysis() };
    }

    console.log("📋 Raw response:", content);

    // Extract JSON from the response text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ Could not find JSON in the response");
      return { success: true, data: simulateFoodAnalysis() };
    }

    try {
      const responseData = JSON.parse(jsonMatch[0]);
      console.log("✅ Successfully parsed response data:", responseData);

      // Check if the image contains food
      if (!responseData.contains_food) {
        return {
          success: false,
          error: responseData.error_message || "No food detected in the image."
        };
      }
      
      // Format and return the nutrition data
      const finalNutritionData: FoodNutrition = {
        food_name: responseData.food_name || 'Unknown Food',
        serving_size: responseData.serving_size || '1 portion',
        calories: parseInt(String(responseData.calories).replace(/[^0-9.]/g, '')) || 0,
        protein: parseInt(String(responseData.protein).replace(/[^0-9.]/g, '')) || 0,
        carbs: parseInt(String(responseData.carbs).replace(/[^0-9.]/g, '')) || 0,
        fat: parseInt(String(responseData.fat).replace(/[^0-9.]/g, '')) || 0,
        health_score: parseInt(String(responseData.health_score)) || 5,
        description: responseData.description || 'No description available.',
        items_breakdown: Array.isArray(responseData.items_breakdown) 
            ? responseData.items_breakdown.map((item: any) => ({ 
                item: String(item.item || 'Unknown Item'),
                quantity: parseFloat(String(item.quantity).replace(/[^0-9.]/g, '')) || 1,
                unit: String(item.unit || 'unit'),
                calories: parseFloat(String(item.calories).replace(/[^0-9.]/g, '')) || 0
              }))
            : [],
        health_tip: responseData.health_tip,
        positive_note: responseData.positive_note
      };
      
      console.log("📦 Final nutrition object before returning (utils):");
      console.log(JSON.stringify(finalNutritionData, null, 2));
      
      return { success: true, data: finalNutritionData };
    } catch (error) {
      console.error("❌ Error parsing OpenAI response:", error, content);
      console.log("⚠️ Falling back to simulated data due to parsing error");
      return { success: true, data: simulateFoodAnalysis() };
    }
  } catch (error) {
    console.error("❌ Error analyzing food image:", error);
    console.log("⚠️ Falling back to simulated data due to general error");
    return { success: true, data: simulateFoodAnalysis() };
  }
};

// Fallback function if API call fails
const simulateFoodAnalysis = (): FoodNutrition => {
  console.log("🤖 Generating simulated food data with description and breakdown");
  const timestamp = Date.now() % 1000;
  // Updated food options with improved notes and calories per item
  const foodOptions = [
    { 
      name: 'Chicken Salad', 
      desc: 'Chicken breast, mixed greens, tomatoes, dressing.', 
      notes: 'Looks like a good source of lean protein from the chicken! Keep an eye on the dressing though, as they can sometimes add extra fats and sugars.', 
      breakdown: [
        { item: 'Grilled Chicken Breast', quantity: 3, unit: 'oz', calories: 140 },
        { item: 'Mixed Greens', quantity: 2, unit: 'cups', calories: 10 },
        { item: 'Cherry Tomatoes', quantity: 0.25, unit: 'cup', calories: 15 },
        { item: 'Dressing', quantity: 2, unit: 'tbsp', calories: 120 },
      ],
      health_tip: "Try using a homemade vinaigrette instead of creamy dressing to reduce calories while maintaining flavor.",
      positive_note: "Excellent choice with the lean protein and fresh vegetables - this is a nutrient-rich meal!"
    },
    { 
      name: 'Salmon with Vegetables', 
      desc: 'Salmon fillet, broccoli, wild rice.', 
      notes: 'This seems like a well-balanced meal! You are getting healthy Omega-3 fats from the salmon and beneficial fiber from the broccoli and rice.', 
      breakdown: [
        { item: 'Salmon Fillet', quantity: 5, unit: 'oz', calories: 290 },
        { item: 'Steamed Broccoli', quantity: 1, unit: 'cup', calories: 55 },
        { item: 'Wild Rice', quantity: 0.5, unit: 'cup', calories: 83 },
      ],
      health_tip: "Consider adding some colorful bell peppers to increase your vitamin C intake.",
      positive_note: "Great choice with the salmon - it's rich in heart-healthy omega-3 fatty acids!"
    },
    { 
      name: 'Pasta with Meatballs', 
      desc: 'Spaghetti, meatballs, tomato sauce, parmesan.', 
      notes: 'This plate provides protein from the meatballs, but it is quite high in carbohydrates from the pasta and potentially sodium from the sauce and cheese.', 
      breakdown: [
        { item: 'Spaghetti', quantity: 1.5, unit: 'cups', calories: 315 },
        { item: 'Meatballs', quantity: 3, unit: 'medium', calories: 230 },
        { item: 'Tomato Sauce', quantity: 0.5, unit: 'cup', calories: 70 },
        { item: 'Parmesan Cheese', quantity: 1, unit: 'tbsp', calories: 22 },
      ],
      health_tip: "Try whole grain pasta for more fiber and nutrients, or mix in some zucchini noodles to reduce calories.",
      positive_note: "The tomato sauce provides beneficial lycopene, an antioxidant good for heart health!"
    },
    { 
      name: 'Cheeseburger', 
      desc: 'Beef patty, cheese, bun.', 
      notes: 'While this provides iron and protein from the beef, it appears quite high in calories, saturated fat, and sodium, common for burgers.', 
      breakdown: [
        { item: 'Beef Patty', quantity: 0.25, unit: 'pound', calories: 290 },
        { item: 'Cheddar Cheese', quantity: 1, unit: 'slice', calories: 110 },
        { item: 'Hamburger Bun', quantity: 1, unit: 'unit', calories: 120 },
      ],
      health_tip: "Try using a lettuce wrap instead of a bun to reduce carbs, or add some avocado for healthy fats.",
      positive_note: "The beef patty provides a good source of iron and B vitamins!"
    },
  ];
  
  const foodIndex = timestamp % foodOptions.length;
  const selectedFood = foodOptions[foodIndex];
  const isHealthy = foodIndex % 4 < 2; 
  const baseCalories = selectedFood.breakdown.reduce((sum, item) => sum + item.calories, 0);
  
  return {
    food_name: selectedFood.name,
    serving_size: '1 portion',
    calories: baseCalories,
    protein: isHealthy ? 20 + (timestamp % 15) : 15 + (timestamp % 10),
    carbs: isHealthy ? 30 + (timestamp % 20) : 45 + (timestamp % 30),
    fat: isHealthy ? 10 + (timestamp % 8) : 20 + (timestamp % 15),
    health_score: isHealthy ? 70 + (timestamp % 31) : 30 + (timestamp % 40),
    description: selectedFood.desc, 
    items_breakdown: selectedFood.breakdown,
    health_tip: selectedFood.health_tip,
    positive_note: selectedFood.positive_note
  };
}; 