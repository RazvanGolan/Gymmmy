import { create } from 'zustand';
import { Exercise } from '../types';

interface ExercisesDataState {
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
}

interface ExercisesDataActions {
  setExercises: (exercises: Exercise[]) => void;
  addExercise: (exercise: Exercise) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getExercise: (id: string) => Exercise | undefined;
  searchExercises: (query: string) => Exercise[];
  getExercisesByCategory: (category: string) => Exercise[];
}

export const useExercisesData = create<ExercisesDataState & ExercisesDataActions>()((set, get) => ({
  // State
  exercises: [],
  isLoading: false,
  error: null,

  // Actions
  setExercises: (exercises) => {
    set({ exercises });
  },

  addExercise: (exercise) => {
    set(state => ({
      exercises: [...state.exercises, exercise],
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
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
}));