export interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
  instructions?: string[];
  muscleGroups: string[];
  equipment?: string[];
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  reps: number;
  weight?: number;
  duration?: number; // in seconds
  completed: boolean;
  notes?: string;
}

export interface Workout {
  id: string;
  name?: string;
  date: string; // ISO date string for easier serialization
  startTime?: string; // ISO datetime string
  endTime?: string; // ISO datetime string
  duration?: number; // in minutes
  sets: WorkoutSet[];
  templateId?: string; // If created from a template
  notes?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface TemplateExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps?: number; 
  weight?: number; 
  duration?: number; // in seconds
  notes?: string;
  order: number; // Display order in template
}

export interface ProgressEntry {
  id: string;
  date: string; // ISO date string
  type: 'weight' | 'body_measurement' | 'fitness_test' | 'photo';
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  measurements?: BodyMeasurements;
  notes?: string;
  photos?: string[]; // URLs to progress photos
  createdAt: string;
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  bicep?: number;
  thigh?: number;
  neck?: number;
}

export interface ExerciseHistory {
  exerciseId: string;
  exerciseName: string;
  history: ExerciseHistoryEntry[];
}

export interface ExerciseHistoryEntry {
  date: string;
  sets: WorkoutSet[];
  personalRecord?: {
    type: 'weight' | 'reps' | 'duration' | 'volume';
    value: number;
    isNewRecord: boolean;
  };
}

export interface UserStats {
  totalWorkouts: number;
  totalDuration: number; // in minutes
  totalSets: number;
  totalReps: number;
}

export interface UserSettings {
  id: string;
  targetWeight?: number;
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyStats {
  weekStart: string; // ISO date string
  workouts: number;
  duration: number;
  sets: number;
  volume: number; 
}

export interface CalendarWorkout {
  date: string;
  hasWorkout: boolean;
  workoutId?: string;
  workoutName?: string;
  duration?: number;
  completed: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const EXERCISE_CATEGORIES = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Cardio',
  'Olympic',
  'Powerlifting',
  'Bodyweight',
  'Stretching',
] as const;

export type ExerciseCategory = typeof EXERCISE_CATEGORIES[number];

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Core',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Neck',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];