import { OPENAI_API_KEY } from '../utils/openai';
import { FoodNutrition } from '../../types';
import { imageToBase64 } from '../utils/openai';

interface FoodSpecification {
  title?: string;
  description?: string;
  servingSize?: string;
  additionalContext?: string;
}

interface AnalysisConfidence {
  overall: number;
  items: {
    name: string;
    confidence: number;
    needsContext?: boolean;
  }[];
  needsMoreContext: boolean;
  missingInfo?: string[];
}

// Store the previous response to avoid redundant calls for the same image
// In a real app, consider a more robust caching mechanism
let previousBase64: string | null = null;
let previousResponse: FoodNutrition | null = null;
let previousConfidence: AnalysisConfidence | null = null;

const API_URL = 'https://api.openai.com/v1/chat/completions';

// CURRENT COMPLEX PROMPT - We'll keep it defined
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
- health_score: An estimated healthiness score from 1 (least healthy) to 100 (most healthy).
- nutrition_notes: Brief notes highlighting key nutritional aspects (e.g., "Good source of protein", "High in saturated fat"). Maximum 1-2 short sentences.
- description: A short description identifying distinct food items and their estimated quantities (e.g., "Plate contains approx. 2 scrambled eggs, 1 cup steamed broccoli, and 1 slice whole wheat toast."). Be concise.
- items_breakdown: Array of objects, where each object represents a distinct food item on the plate and contains:
  - item: Name of the food item (string).
  - quantity: Estimated quantity (number, e.g., 1, 0.5, 100).
  - unit: Unit for the quantity (e.g., "piece", "slice", "cup", "grams") (string).
  - calories: Estimated calories for this specific item (integer).
- health_tip: A concise, actionable health tip related to the meal (string, optional, max 1-2 sentences).
- positive_note: A brief positive encouragement or observation about the meal (string, optional, max 1-2 sentences).
- confidence: { 
    overall: A number between 0-1 indicating overall confidence in the analysis,
    items: Array of identified items with their name and confidence scores (number between 0-1), 
    needsMoreContext: Boolean indicating if more context would help improve accuracy (true if confidence.overall < 0.75 or any item confidence < 0.6),
    missingInfo: Array of strings listing specific information that would help improve the analysis (e.g., ["specific type of oil used", "exact weight of chicken"])
  }

If user provides specifications, use them to enhance the analysis accuracy for all fields, including the item breakdown.
Provide only the JSON object in your response, nothing else. Ensure all numerical values are integers (except confidence scores and item quantity if fractional).
`;

// TEMPORARY MINIMAL TEST PROMPT
const TEST_SYSTEM_PROMPT = `
You are a helpful nutrition assistant.
Respond ONLY with a JSON object containing the following fields:
- food_name: A concise name for the overall meal.
- calories: Estimated total calories (integer).
`;

// Define a custom error for API refusal
export class OpenAIAPIRefusalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIAPIRefusalError";
  }
}

// Define a custom error for when AI detects no food or returns an error message
export class OpenAINoFoodDetectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAINoFoodDetectedError";
  }
}

export async function analyzeFoodImage(
  base64Image: string, 
  specifications?: FoodSpecification
): Promise<{ nutrition: FoodNutrition; confidence: AnalysisConfidence }> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not found. Using simulated data.');
    return simulateAnalysis(base64Image, specifications);
  }

  if (!specifications && base64Image === previousBase64 && previousResponse && previousConfidence) {
    console.log("Returning cached analysis result (nutrition and confidence).");
    return { nutrition: previousResponse, confidence: previousConfidence };
  }

  console.log("Sending image to OpenAI for analysis (USING FULL PROMPT)... "); 
  let actualBase64Image = base64Image;
  if (base64Image.startsWith('file://') || base64Image.startsWith('http')) {
    try {
      actualBase64Image = await imageToBase64(base64Image);
    } catch (conversionError: any) {
      console.error("❌ Failed to convert image URI:", conversionError.message);
      throw new Error(`Image conversion failed: ${conversionError.message}`); 
    }
  }

  try {
    const userMessage = specifications ? 
      `Analyze the food in this image with the following specifications provided by the user:
      ${specifications.title ? `Title: ${specifications.title}\n` : ''}
      ${specifications.description ? `Description: ${specifications.description}\n` : ''}
      ${specifications.servingSize ? `Serving Size: ${specifications.servingSize}\n` : ''}
      ${specifications.additionalContext ? `Additional Context: ${specifications.additionalContext}\n` : ''}
      Ensure the items_breakdown reflects these specifications if provided.` :
      "Analyze the food in this image.";

    const payload = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT }, 
        {
          role: "user",
          content: [
            { type: "text", text: userMessage },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${actualBase64Image}`,
                detail: "auto", 
              },
            },
          ],
        },
      ],
      max_tokens: 1024, 
      temperature: 0.3, 
      response_format: { type: "json_object" } 
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI API Error Status:', response.status);
      console.error('OpenAI API Error Body:', errorBody);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}. Check console for details.`);
    }

    const data = await response.json();
    console.log("OpenAI API Response (with FULL_PROMPT):", JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      const messageContent = data.choices[0].message.content;
      const refusalMessage = data.choices[0].message.refusal;

      if (messageContent === null && refusalMessage) {
        console.error("OpenAI API refused the request:", refusalMessage);
        throw new OpenAIAPIRefusalError(refusalMessage);
      }

      if (messageContent) {
        console.log("Raw content string from OpenAI (with FULL_PROMPT):", messageContent);
        let jsonResponse;
        try {
          jsonResponse = JSON.parse(messageContent);
        } catch (e: any) {
          console.error('Failed to parse OpenAI response content as JSON directly:', e.message, "Raw content was:", messageContent);
          throw new Error(`Failed to parse API response JSON: ${e.message}`);
        }

        console.log("Parsed JSON response (with FULL_PROMPT):", JSON.stringify(jsonResponse, null, 2));

        if (jsonResponse.error) {
          console.warn("OpenAI returned an error in JSON content:", jsonResponse.error);
          throw new OpenAINoFoodDetectedError(jsonResponse.error);
        }
        
        const confidence: AnalysisConfidence = jsonResponse.confidence || {
          overall: 0.5, 
          items: (jsonResponse.items_breakdown || [{item: jsonResponse.food_name, confidence: 0.5}]).map((i: any) => ({name: i.item || jsonResponse.food_name, confidence: 0.5})),
          needsMoreContext: true, 
          missingInfo: ['Could not determine all details with high confidence.']
        };

        const { confidence: _, ...nutritionData } = jsonResponse;
        
        if (!nutritionData.food_name || typeof nutritionData.calories !== 'number') {
          console.error('Parsed JSON lacks required fields (food_name, calories) after potential error check.');
          throw new Error('Parsed JSON response is missing required nutrition fields.');
        }
        
        if (!specifications) {
          previousBase64 = base64Image;
          previousResponse = nutritionData as FoodNutrition;
          previousConfidence = confidence; 
        }
              
        return { nutrition: nutritionData as FoodNutrition, confidence };
      } else {
        console.error("OpenAI returned null content without a specific refusal message.");
        throw new Error('OpenAI returned null content unexpectedly.');
      }
    }
    console.error("OpenAI returned invalid response structure (missing choices or message parts).");
    throw new Error('Invalid response structure from OpenAI API (missing choices or message parts).');

  } catch (error: any) {
    if (
      error instanceof OpenAIAPIRefusalError ||
      error instanceof OpenAINoFoodDetectedError ||
      error.message?.startsWith('HTTP error') ||
      error.message?.startsWith('Image conversion failed') ||
      error.message?.startsWith('Failed to parse API response JSON') ||
      error.message?.startsWith('Parsed JSON response is missing required nutrition fields')
    ) {
      console.error('Specific error caught in analyzeFoodImage, re-throwing for FoodCamera:', error.name, error.message);
      throw error; 
    }
    console.error('Unhandled generic error in analyzeFoodImage, falling back to simulation:', error.message);
    return simulateAnalysis(base64Image, specifications);
  }
}

// Enhanced simulation function
function simulateAnalysis(
  base64Image: string, 
  specifications?: FoodSpecification
): { nutrition: FoodNutrition; confidence: AnalysisConfidence } {
  console.log("Simulating AI analysis with specifications:", specifications);
  
  let hash = 0;
  for (let i = 0; i < base64Image.length; i += 1000) {
    hash = (hash << 5) - hash + base64Image.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const foods = [
    { 
      name: specifications?.title || 'Scrambled Eggs & Avocado Toast',
      desc: specifications?.description || 'Approx. 2 scrambled eggs, 1/2 avocado on 1 slice toast.',
      confidenceValue: 0.95,
      items_data: [
        { item: 'Scrambled Eggs', quantity: 2, unit: 'large', calories: 180, itemConfidence: 0.9 },
        { item: 'Avocado', quantity: 0.5, unit: 'medium', calories: 160, itemConfidence: 0.92 },
        { item: 'Toast', quantity: 1, unit: 'slice', calories: 80, itemConfidence: 0.85 },
      ],
      health_tip_data: 'Add some spinach to your eggs for extra vitamins!',
      positive_note_data: 'Great choice for a protein-packed start!'
    },
    {
      name: specifications?.title || 'Chicken Salad Sandwich',
      desc: specifications?.description || 'Approx. 4oz chicken salad in 2 slices white bread.',
      confidenceValue: 0.88,
      items_data: [
        { item: 'Chicken Salad', quantity: 4, unit: 'oz', calories: 200, itemConfidence: 0.85 },
        { item: 'White Bread', quantity: 2, unit: 'slices', calories: 140, itemConfidence: 0.8 },
      ],
      health_tip_data: 'Opt for whole wheat bread for more fiber.',
      positive_note_data: 'Quick and easy meal!'
    }
  ];

  const notes = [
    'Good source of protein and healthy fats.',
    'Moderate calories, contains processed carbs.',
  ];
  
  const index = hash % foods.length;
  const simulatedFood = foods[index];

  const nutrition: FoodNutrition = {
    food_name: simulatedFood.name,
    serving_size: specifications?.servingSize || '1 plate',
    calories: simulatedFood.items_data.reduce((sum, item) => sum + item.calories, 0),
    protein: 15 + (hash % 25),
    carbs: 20 + (hash % 50),
    fat: 10 + (hash % 30),
    health_score: 40 + (hash % 60),
    nutrition_notes: notes[index % notes.length],
    description: simulatedFood.desc,
    items_breakdown: simulatedFood.items_data,
    health_tip: simulatedFood.health_tip_data,
    positive_note: simulatedFood.positive_note_data,
  };

  const confidence: AnalysisConfidence = {
    overall: simulatedFood.confidenceValue,
    items: simulatedFood.items_data.map(i => ({ name: i.item, confidence: i.itemConfidence })),
    needsMoreContext: !specifications,
    missingInfo: specifications ? [] : ['Specific cooking method']
  };

  console.log("Simulated result:", { nutrition, confidence });
  return { nutrition, confidence };
} 