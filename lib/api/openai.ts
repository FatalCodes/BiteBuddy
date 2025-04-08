import { OPENAI_API_KEY } from '../utils/openai';
import { FoodNutrition } from '../../types';

// Store the previous response to avoid redundant calls for the same image
// In a real app, consider a more robust caching mechanism
let previousBase64: string | null = null;
let previousResponse: FoodNutrition | null = null;

const API_URL = 'https://api.openai.com/v1/chat/completions';

// --- Updated Prompt --- 
const SYSTEM_PROMPT = `
You are a helpful nutrition assistant integrated into a mobile app called BiteBuddy. 
Your goal is to analyze images of food plates and provide estimated nutritional information 
and a brief description with quantities. 

Respond ONLY with a JSON object containing the following fields:
- food_name: A concise name for the overall meal (e.g., "Scrambled Eggs with Broccoli").
- serving_size: An estimated serving size for the entire plate (e.g., "1 plate", "approx. 300g").
- calories: Estimated total calories (integer).
- protein: Estimated total protein in grams (integer).
- carbs: Estimated total carbohydrates in grams (integer).
- fat: Estimated total fat in grams (integer).
- health_score: An estimated healthiness score from 1 (least healthy) to 10 (most healthy).
- nutrition_notes: Brief notes highlighting key nutritional aspects (e.g., "Good source of protein", "High in saturated fat"). Maximum 1-2 short sentences.
- description: A short description identifying distinct food items and their estimated quantities (e.g., "Plate contains approx. 2 scrambled eggs, 1 cup steamed broccoli, and 1 slice whole wheat toast."). Be concise.

Provide only the JSON object in your response, nothing else. Ensure all numerical values are integers.
`;

export async function analyzeFoodImage(base64Image: string): Promise<FoodNutrition> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not found. Using simulated data.');
    return simulateAnalysis(base64Image);
  }

  // Basic caching check
  if (base64Image === previousBase64 && previousResponse) {
    console.log("Returning cached analysis result.");
    return previousResponse;
  }

  console.log("Sending image to OpenAI for analysis...");

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview", // Use gpt-4-vision-preview which is more widely available
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze the food in this image."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 400, // Adjust as needed
        temperature: 0.3, // Lower temperature for more factual responses
        response_format: { type: "json_object" } // Request JSON output
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI API Error Status:', response.status);
      console.error('OpenAI API Error Body:', errorBody);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}. Check console for details.`);
    }

    const data = await response.json();
    console.log("OpenAI API Response:", JSON.stringify(data, null, 2));

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response structure from OpenAI API.');
    }

    // Log the exact content string before parsing
    console.log("Raw content string from OpenAI:", data.choices[0].message.content);
    
    try {
      const jsonResponse = JSON.parse(data.choices[0].message.content);
      
      // Log the parsed JSON structure
      console.log("Parsed JSON response:", JSON.stringify(jsonResponse, null, 2));
      
      // Basic validation of the response structure
      if (!jsonResponse.food_name || typeof jsonResponse.calories !== 'number') {
        throw new Error('Parsed JSON response is missing required fields or has incorrect types.');
      }
      
      // Check specifically for description field
      if (!jsonResponse.description) {
        console.warn("WARNING: Description field missing from OpenAI response. Adding placeholder.");
        jsonResponse.description = "No detailed description available from AI.";
      } else {
        console.log("Description found:", jsonResponse.description);
      }
      
      // Cache the result
      previousBase64 = base64Image;
      previousResponse = jsonResponse as FoodNutrition;
      
      console.log("Final FoodNutrition object:", JSON.stringify(previousResponse, null, 2));
      
      return previousResponse;
    } catch (parseError) {
      console.error('Error parsing OpenAI response as JSON:', parseError);
      throw new Error('Failed to parse response from OpenAI as JSON.');
    }

  } catch (error) {
    console.error('Error analyzing food image with OpenAI:', error);
    console.warn('Falling back to simulated data due to OpenAI error.');
    return simulateAnalysis(base64Image);
  }
}

// Simulate AI analysis for testing or when API key is missing
function simulateAnalysis(base64Image: string): FoodNutrition {
  console.log("Simulating AI analysis... Will include a quantified description.");
  // Simple hash function for variety based on image data
  let hash = 0;
  for (let i = 0; i < base64Image.length; i += 1000) { // Sample the base64 string
    hash = (hash << 5) - hash + base64Image.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  hash = Math.abs(hash);

  const foods = [
    { name: 'Scrambled Eggs & Avocado Toast', desc: 'Approx. 2 scrambled eggs, 1/2 avocado on 1 slice toast.' },
    { name: 'Chicken Salad Sandwich', desc: 'Approx. 4oz chicken salad in 2 slices white bread.'}, 
    { name: 'Pasta with Tomato Sauce', desc: 'Approx. 2 cups pasta with 1 cup tomato sauce.' },
    { name: 'Grilled Salmon with Asparagus', desc: 'Approx. 5oz grilled salmon fillet with 1 cup asparagus spears.' },
  ];
  const notes = [
    'Good source of protein and healthy fats.', 
    'Moderate calories, contains processed carbs.',
    'High in carbohydrates, moderate protein.',
    'Excellent source of Omega-3s and vitamins.'
  ];
  
  const index = hash % foods.length;
  const simulatedFood = foods[index];

  // Create the response object
  const result: FoodNutrition = {
    food_name: simulatedFood.name,
    serving_size: '1 plate',
    calories: 300 + (hash % 300), // 300-600 kcal
    protein: 15 + (hash % 25),    // 15-40g
    carbs: 20 + (hash % 50),      // 20-70g
    fat: 10 + (hash % 30),        // 10-40g
    health_score: 40 + (hash % 60), // 40-99 score on a 0-100 scale
    nutrition_notes: notes[index],
    description: simulatedFood.desc, // Ensure description is set
  };

  console.log("Simulated result with description:", JSON.stringify(result, null, 2));
  return result;
} 