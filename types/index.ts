// User related types
export interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  goal_weight: number | null;
  gender: string | null;
  activity_level: string | null;
  dietary_preferences: any | null;
  created_at: string;
  updated_at: string;
  has_completed_onboarding: boolean;
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
  health_score?: number;
  nutrition_notes?: string;
  description?: string;
  items_breakdown?: {
    item: string;
    quantity: number;
    unit: string;
    calories: number;
  }[];
  health_tip?: string;
  positive_note?: string;
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
    calories: number;
  }[];
  health_tip?: string;
  positive_note?: string;
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
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: (token: string, fullName?: string | null) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  checkSession: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
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