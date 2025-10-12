// Common types for the Gymmy app

export interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
  instructions?: string[];
  muscleGroups: string[];
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  restTime?: number;
  completed: boolean;
}

export interface Workout {
  id: string;
  name: string;
  date: Date;
  duration: number; // in minutes
  sets: WorkoutSet[];
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  weight?: number;
  height?: number;
  age?: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface ProgressEntry {
  id: string;
  date: Date;
  weight?: number;
  bodyFatPercentage?: number;
  notes?: string;
}