import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Types for Supabase
export interface Database {
  public: {
    Tables: {
        users: {
        Row: {
          id: string;
          email: string;
          name: string;
          weight?: number;
          preferences?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          weight?: number;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          weight?: number;
          preferences?: any;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          category: string;
          description?: string;
          instructions?: string[];
          muscle_groups: string[];
          equipment?: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description?: string;
          instructions?: string[];
          muscle_groups: string[];
          equipment?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string;
          instructions?: string[];
          muscle_groups?: string[];
          equipment?: string[];
        };
      };
      workout_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description?: string;
          category?: string;
          estimated_duration?: number;
          exercises: any[];
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          category?: string;
          estimated_duration?: number;
          exercises: any[];
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          category?: string;
          estimated_duration?: number;
          exercises?: any[];
          usage_count?: number;
          updated_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          name?: string;
          date: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          sets: any[];
          template_id?: string;
          notes?: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          date: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          sets: any[];
          template_id?: string;
          notes?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          sets?: any[];
          template_id?: string;
          notes?: string;
          completed?: boolean;
          updated_at?: string;
        };
      };
      progress_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          type: 'weight' | 'body_measurement' | 'fitness_test' | 'photo';
          weight?: number;
          body_fat_percentage?: number;
          muscle_mass?: number;
          measurements?: any;
          notes?: string;
          photos?: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          type: 'weight' | 'body_measurement' | 'fitness_test' | 'photo';
          weight?: number;
          body_fat_percentage?: number;
          muscle_mass?: number;
          measurements?: any;
          notes?: string;
          photos?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          type?: 'weight' | 'body_measurement' | 'fitness_test' | 'photo';
          weight?: number;
          body_fat_percentage?: number;
          muscle_mass?: number;
          measurements?: any;
          notes?: string;
          photos?: string[];
        };
      };
    };
  };
}