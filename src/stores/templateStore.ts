import { create } from 'zustand';
import { WorkoutTemplate, TemplateExercise, Exercise } from '../types';

interface TemplateState {
  templates: WorkoutTemplate[];
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
}

interface TemplateActions {
  // Template CRUD
  createTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => string;
  updateTemplate: (id: string, updates: Partial<WorkoutTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => WorkoutTemplate | undefined;
  incrementTemplateUsage: (id: string) => void;

  // Exercise management
  addExercise: (exercise: Omit<Exercise, 'id'>) => string;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  getExercise: (id: string) => Exercise | undefined;
  searchExercises: (query: string) => Exercise[];
  getExercisesByCategory: (category: string) => Exercise[];

  // Utility
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  loadDefaultExercises: () => void;
}

// Default exercises database
const DEFAULT_EXERCISES: Omit<Exercise, 'id'>[] = [
  // Chest
  { name: 'Bench Press', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], equipment: ['Barbell', 'Bench'] },
  { name: 'Incline Bench Press', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], equipment: ['Barbell', 'Incline Bench'] },
  { name: 'Dumbbell Press', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], equipment: ['Dumbbells', 'Bench'] },
  { name: 'Push-ups', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], equipment: ['Bodyweight'] },
  { name: 'Dips', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], equipment: ['Dip Station'] },

  // Back
  { name: 'Pull-ups', category: 'Back', muscleGroups: ['Back', 'Biceps'], equipment: ['Pull-up Bar'] },
  { name: 'Barbell Rows', category: 'Back', muscleGroups: ['Back', 'Biceps'], equipment: ['Barbell'] },
  { name: 'Deadlift', category: 'Back', muscleGroups: ['Back', 'Glutes', 'Hamstrings'], equipment: ['Barbell'] },
  { name: 'Lat Pulldown', category: 'Back', muscleGroups: ['Back', 'Biceps'], equipment: ['Cable Machine'] },
  { name: 'T-Bar Row', category: 'Back', muscleGroups: ['Back', 'Biceps'], equipment: ['T-Bar'] },

  // Legs
  { name: 'Squat', category: 'Legs', muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'], equipment: ['Barbell', 'Squat Rack'] },
  { name: 'Romanian Deadlift', category: 'Legs', muscleGroups: ['Hamstrings', 'Glutes'], equipment: ['Barbell'] },
  { name: 'Leg Press', category: 'Legs', muscleGroups: ['Quadriceps', 'Glutes'], equipment: ['Leg Press Machine'] },
  { name: 'Walking Lunges', category: 'Legs', muscleGroups: ['Quadriceps', 'Glutes'], equipment: ['Dumbbells'] },
  { name: 'Calf Raises', category: 'Legs', muscleGroups: ['Calves'], equipment: ['Dumbbells'] },

  // Shoulders
  { name: 'Overhead Press', category: 'Shoulders', muscleGroups: ['Shoulders', 'Triceps'], equipment: ['Barbell'] },
  { name: 'Lateral Raises', category: 'Shoulders', muscleGroups: ['Shoulders'], equipment: ['Dumbbells'] },
  { name: 'Rear Delt Flyes', category: 'Shoulders', muscleGroups: ['Shoulders'], equipment: ['Dumbbells'] },
  { name: 'Arnold Press', category: 'Shoulders', muscleGroups: ['Shoulders', 'Triceps'], equipment: ['Dumbbells'] },

  // Arms
  { name: 'Bicep Curls', category: 'Arms', muscleGroups: ['Biceps'], equipment: ['Dumbbells'] },
  { name: 'Tricep Extensions', category: 'Arms', muscleGroups: ['Triceps'], equipment: ['Dumbbells'] },
  { name: 'Hammer Curls', category: 'Arms', muscleGroups: ['Biceps', 'Forearms'], equipment: ['Dumbbells'] },
  { name: 'Close-Grip Bench Press', category: 'Arms', muscleGroups: ['Triceps', 'Chest'], equipment: ['Barbell', 'Bench'] },

  // Core
  { name: 'Plank', category: 'Core', muscleGroups: ['Core'], equipment: ['Bodyweight'] },
  { name: 'Crunches', category: 'Core', muscleGroups: ['Core'], equipment: ['Bodyweight'] },
  { name: 'Russian Twists', category: 'Core', muscleGroups: ['Core'], equipment: ['Bodyweight'] },
  { name: 'Dead Bug', category: 'Core', muscleGroups: ['Core'], equipment: ['Bodyweight'] },
];

export const useTemplateStore = create<TemplateState & TemplateActions>()((set, get) => ({
      // State
      templates: [],
      exercises: [],
      isLoading: false,
      error: null,

      // Template CRUD
      createTemplate: (templateData) => {
        const newTemplate: WorkoutTemplate = {
          ...templateData,
          id: Date.now().toString(),
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set(state => ({
          templates: [...state.templates, newTemplate],
        }));

        return newTemplate.id;
      },

      updateTemplate: (id, updates) => {
        set(state => ({
          templates: state.templates.map(template =>
            template.id === id
              ? { ...template, ...updates, updatedAt: new Date().toISOString() }
              : template
          ),
        }));
      },

      deleteTemplate: (id) => {
        set(state => ({
          templates: state.templates.filter(template => template.id !== id),
        }));
      },

      getTemplate: (id) => {
        return get().templates.find(template => template.id === id);
      },

      incrementTemplateUsage: (id) => {
        set(state => ({
          templates: state.templates.map(template =>
            template.id === id
              ? { 
                  ...template, 
                  usageCount: template.usageCount + 1,
                  updatedAt: new Date().toISOString(),
                }
              : template
          ),
        }));
      },

      // Exercise management
      addExercise: (exerciseData) => {
        const newExercise: Exercise = {
          ...exerciseData,
          id: Date.now().toString(),
        };

        set(state => ({
          exercises: [...state.exercises, newExercise],
        }));

        return newExercise.id;
      },

      updateExercise: (id, updates) => {
        set(state => ({
          exercises: state.exercises.map(exercise =>
            exercise.id === id
              ? { ...exercise, ...updates }
              : exercise
          ),
        }));
      },

      deleteExercise: (id) => {
        set(state => ({
          exercises: state.exercises.filter(exercise => exercise.id !== id),
        }));
      },

      getExercise: (id) => {
        return get().exercises.find(exercise => exercise.id === id);
      },

      searchExercises: (query) => {
        const { exercises } = get();
        const lowercaseQuery = query.toLowerCase();

        return exercises.filter(exercise =>
          exercise.name.toLowerCase().includes(lowercaseQuery) ||
          exercise.category.toLowerCase().includes(lowercaseQuery) ||
          exercise.muscleGroups.some(muscle => 
            muscle.toLowerCase().includes(lowercaseQuery)
          )
        );
      },

      getExercisesByCategory: (category) => {
        return get().exercises.filter(exercise => 
          exercise.category.toLowerCase() === category.toLowerCase()
        );
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      loadDefaultExercises: () => {
        const { exercises } = get();
        
        // Only load if no exercises exist
        if (exercises.length === 0) {
          const defaultExercises: Exercise[] = DEFAULT_EXERCISES.map((exercise, index) => ({
            ...exercise,
            id: (index + 1).toString(),
          }));

          set({ exercises: defaultExercises });
        }
      },
}));