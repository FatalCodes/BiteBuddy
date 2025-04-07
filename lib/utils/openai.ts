import { encode } from 'base-64';
import { FoodNutrition } from '../../types';

// Environment variables would be better for API keys
export const OPENAI_API_KEY = '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'; // ADD YOUR API KEY HERE (but use environment variables in production)
const API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `
You are a helpful nutrition assistant integrated into a mobile app called BiteBuddy. 
Your goal is to analyze images of food plates and provide estimated nutritional information.

Respond ONLY with a JSON object containing the following fields:
- food_name: A concise name for the overall meal.
- serving_size: An estimated serving size for the entire plate.
- calories, protein, carbs, fat: Estimated total macronutrients (integers).
- health_score: An estimated healthiness score (1-10).
- nutrition_notes: Summarize the key nutritional pros and cons of the meal in a short paragraph (2-3 sentences max), addressing the user directly. Examples: "Your meal provides a good amount of lean protein from the chicken, but the dressing might add significant fat." or "This looks like a well-balanced plate with healthy fats from the salmon and fiber from the broccoli."
- description: A CONCISE overall description of the meal components (e.g., "Scrambled eggs, broccoli, and toast.").
- items_breakdown: An array of objects, where each object represents a distinct food item detected. Each object MUST have the fields: 
    - 'item' (string, e.g., "Scrambled Eggs"), 
    - 'quantity' (number, e.g., 2), 
    - 'unit' (string, e.g., "eggs", "cup").
  If unsure about quantity/unit, use best estimate.

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
export const analyzeFoodImage = async (imageUri: string): Promise<FoodNutrition> => {
  try {
    console.log("🔍 Starting food analysis for:", imageUri.substring(0, 50) + "...");
    
    // For simulator/testing, return fake data if no API key is provided
    if (!OPENAI_API_KEY) {
      console.log("⚠️ No API key provided, using simulated data");
      return simulateFoodAnalysis();
    }

    console.log("🔑 API key found, proceeding with OpenAI analysis");
    
    let base64Image;
    try {
      base64Image = await imageToBase64(imageUri);
    } catch (error) {
      console.error("❌ Error preparing image:", error);
      console.log("⚠️ Falling back to simulated data due to image preparation error");
      return simulateFoodAnalysis();
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
      return simulateFoodAnalysis();
    }

    console.log("✅ Received successful response from OpenAI");
    const data = await response.json();
    
    // Parse the response to extract nutritional information
    const content = data.choices[0]?.message?.content;
    if (!content) {
      console.error("❌ No content in OpenAI response");
      return simulateFoodAnalysis();
    }

    console.log("📋 Raw response:", content);

    // Extract JSON from the response text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ Could not find JSON in the response");
      return simulateFoodAnalysis();
    }

    try {
      const nutritionData = JSON.parse(jsonMatch[0]);
      console.log("✅ Successfully parsed nutrition data:", nutritionData);
      
      // Format and return the nutrition data
      const finalNutritionData: FoodNutrition = {
        food_name: nutritionData.food_name || 'Unknown Food',
        serving_size: nutritionData.serving_size || '1 portion',
        calories: parseInt(String(nutritionData.calories).replace(/[^0-9.]/g, '')) || 0,
        protein: parseInt(String(nutritionData.protein).replace(/[^0-9.]/g, '')) || 0,
        carbs: parseInt(String(nutritionData.carbs).replace(/[^0-9.]/g, '')) || 0,
        fat: parseInt(String(nutritionData.fat).replace(/[^0-9.]/g, '')) || 0,
        health_score: parseInt(String(nutritionData.health_score)) || 5,
        nutrition_notes: nutritionData.nutrition_notes || 'No nutrition summary available.', // Provide fallback
        description: nutritionData.description || 'No description available.', 
        items_breakdown: Array.isArray(nutritionData.items_breakdown) 
            ? nutritionData.items_breakdown.map((item: any) => ({ 
                item: String(item.item || 'Unknown Item'),
                quantity: parseFloat(String(item.quantity).replace(/[^0-9.]/g, '')) || 1, 
                unit: String(item.unit || 'unit'), 
                // Remove pros/cons parsing
              }))
            : [] 
      };
      
      console.log("📦 Final nutrition object before returning (utils):");
      console.log(JSON.stringify(finalNutritionData, null, 2));
      
      return finalNutritionData;
    } catch (error) {
      console.error("❌ Error parsing OpenAI response:", error, content);
      console.log("⚠️ Falling back to simulated data due to parsing error");
      return simulateFoodAnalysis();
    }
  } catch (error) {
    console.error("❌ Error analyzing food image:", error);
    console.log("⚠️ Falling back to simulated data due to general error");
    return simulateFoodAnalysis();
  }
};

// Fallback function if API call fails
const simulateFoodAnalysis = (): FoodNutrition => {
  console.log("🤖 Generating simulated food data with description and breakdown");
  const timestamp = new Date().getTime();
  // Updated food options with improved notes
  const foodOptions = [
    { 
      name: 'Chicken Salad', 
      desc: 'Chicken breast, mixed greens, tomatoes, dressing.', 
      notes: 'Looks like a good source of lean protein from the chicken! Keep an eye on the dressing though, as they can sometimes add extra fats and sugars.', 
      breakdown: [
        { item: 'Grilled Chicken Breast', quantity: 3, unit: 'oz' },
        { item: 'Mixed Greens', quantity: 2, unit: 'cups' },
        { item: 'Cherry Tomatoes', quantity: 0.25, unit: 'cup' },
        { item: 'Dressing', quantity: 2, unit: 'tbsp' },
      ]
    },
    { 
      name: 'Salmon with Vegetables', 
      desc: 'Salmon fillet, broccoli, wild rice.', 
      notes: 'This seems like a well-balanced meal! You are getting healthy Omega-3 fats from the salmon and beneficial fiber from the broccoli and rice.', 
      breakdown: [
        { item: 'Salmon Fillet', quantity: 5, unit: 'oz' },
        { item: 'Steamed Broccoli', quantity: 1, unit: 'cup' },
        { item: 'Wild Rice', quantity: 0.5, unit: 'cup' },
      ]
    },
    { 
      name: 'Pasta with Meatballs', 
      desc: 'Spaghetti, meatballs, tomato sauce, parmesan.', 
      notes: 'This plate provides protein from the meatballs, but it is quite high in carbohydrates from the pasta and potentially sodium from the sauce and cheese.', 
      breakdown: [
        { item: 'Spaghetti', quantity: 1.5, unit: 'cups' },
        { item: 'Meatballs', quantity: 3, unit: 'medium' },
        { item: 'Tomato Sauce', quantity: 0.5, unit: 'cup' },
        { item: 'Parmesan Cheese', quantity: 1, unit: 'tbsp' },
      ]
    },
    { 
      name: 'Cheeseburger', 
      desc: 'Beef patty, cheese, bun.', 
      notes: 'While this provides iron and protein from the beef, it appears quite high in calories, saturated fat, and sodium, common for burgers.', 
      breakdown: [
        { item: 'Beef Patty', quantity: 0.25, unit: 'pound' },
        { item: 'Cheddar Cheese', quantity: 1, unit: 'slice' },
        { item: 'Hamburger Bun', quantity: 1, unit: 'unit' },
      ]
    },
    // Add more simulated options if needed
  ];
  
  const foodIndex = timestamp % foodOptions.length;
  const selectedFood = foodOptions[foodIndex];
  const isHealthy = foodIndex % 4 < 2; 
  const baseCalories = isHealthy ? 300 + (timestamp % 200) : 450 + (timestamp % 350);
  
  return {
    food_name: selectedFood.name,
    serving_size: '1 portion',
    calories: baseCalories,
    protein: isHealthy ? 20 + (timestamp % 15) : 15 + (timestamp % 10),
    carbs: isHealthy ? 30 + (timestamp % 20) : 45 + (timestamp % 30),
    fat: isHealthy ? 10 + (timestamp % 8) : 20 + (timestamp % 15),
    health_score: isHealthy ? 7 + (timestamp % 4) : 3 + (timestamp % 4),
    nutrition_notes: selectedFood.notes, 
    description: selectedFood.desc, 
    items_breakdown: selectedFood.breakdown // Ensure breakdown exists
  };
}; 