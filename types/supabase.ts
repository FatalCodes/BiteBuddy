export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          created_at?: string;
        };
      };
      companions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          health: number;
          happiness: number;
          energy: number;
          created_at: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          health?: number;
          happiness?: number;
          energy?: number;
          created_at?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          health?: number;
          happiness?: number;
          energy?: number;
          created_at?: string;
          last_updated?: string;
        };
      };
      food_logs: {
        Row: {
          id: string;
          user_id: string;
          food_name: string;
          serving_size: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          image_url?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_name: string;
          serving_size: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          image_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_name?: string;
          serving_size?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          image_url?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 