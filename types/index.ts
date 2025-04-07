// User related types
export interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
}

// Companion related types
export interface Companion {
  id: string;
  user_id: string;
  name: string;
  health: number;
  happiness: number;
  energy: number;
  created_at: string;
  last_updated: string;
}

// Food related types
export interface FoodLog {
  id: string;
  user_id: string;
  food_name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
  notes?: string;
  created_at: string;
}

export interface FoodNutrition {
  food_name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  health_score?: number;
  nutrition_notes?: string;
  description?: string;
  items_breakdown?: {
    item: string;
    quantity: number;
    unit: string;
  }[];
}

// Auth related types
export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  checkSession: () => Promise<void>;
}

// Navigation related types
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  FoodEntry: undefined;
  FoodCamera: undefined;
  CompanionDetail: undefined;
};

export type TabParamList = {
  Home: undefined;
  FoodLog: undefined;
  Companion: undefined;
  Profile: undefined;
}; 