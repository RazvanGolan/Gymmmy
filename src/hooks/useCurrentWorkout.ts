import { create } from 'zustand';
import { Workout, WorkoutSet } from '../types';

interface CurrentWorkoutState {
  currentWorkout: Workout | null;
}

interface CurrentWorkoutActions {
  startWorkout: (workout: Workout) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  updateCurrentWorkout: (updates: Partial<Workout>) => void;
  addSetToCurrentWorkout: (exerciseId: string, set: Omit<WorkoutSet, 'id'>) => void;
  updateSetInCurrentWorkout: (setId: string, updates: Partial<WorkoutSet>) => void;
  removeSetFromCurrentWorkout: (setId: string) => void;
}

export const useCurrentWorkout = create<CurrentWorkoutState & CurrentWorkoutActions>()((set, get) => ({
  // State
  currentWorkout: null,

  // Actions
  startWorkout: (workout) => {
    set({ currentWorkout: workout });
  },

  finishWorkout: () => {
    const { currentWorkout } = get();
    if (currentWorkout) {
      set({ currentWorkout: null });
    }
  },

  cancelWorkout: () => {
    set({ currentWorkout: null });
  },

  updateCurrentWorkout: (updates) => {
    set(state => ({
      currentWorkout: state.currentWorkout
        ? { ...state.currentWorkout, ...updates }
        : null,
    }));
  },

  addSetToCurrentWorkout: (exerciseId, setData) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    const newSet: WorkoutSet = {
      ...setData,
      id: `${exerciseId}-${Date.now()}`,
    };

    set({
      currentWorkout: {
        ...currentWorkout,
        sets: [...currentWorkout.sets, newSet],
      },
    });
  },

  updateSetInCurrentWorkout: (setId, updates) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    set({
      currentWorkout: {
        ...currentWorkout,
        sets: currentWorkout.sets.map(set =>
          set.id === setId ? { ...set, ...updates } : set
        ),
      },
    });
  },

  removeSetFromCurrentWorkout: (setId) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    set({
      currentWorkout: {
        ...currentWorkout,
        sets: currentWorkout.sets.filter(set => set.id !== setId),
      },
    });
  },
}));