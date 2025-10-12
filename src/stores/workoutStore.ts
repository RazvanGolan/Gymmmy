import { create } from 'zustand';
import { Workout, WorkoutSet, CalendarWorkout } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface WorkoutState {
  workouts: Workout[];
  currentWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;
}

interface WorkoutActions {
  // Workout CRUD
  createWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  getWorkout: (id: string) => Workout | undefined;
  getWorkoutsByDate: (date: string) => Workout[];
  getWorkoutsByDateRange: (startDate: string, endDate: string) => Workout[];

  // Current workout session
  startWorkout: (workout: Workout) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  updateCurrentWorkout: (updates: Partial<Workout>) => void;
  addSetToCurrentWorkout: (exerciseId: string, set: Omit<WorkoutSet, 'id'>) => void;
  updateSetInCurrentWorkout: (setId: string, updates: Partial<WorkoutSet>) => void;
  removeSetFromCurrentWorkout: (setId: string) => void;

  // Calendar helpers
  getCalendarData: (year: number, month: number) => CalendarWorkout[];
  getWorkoutStreak: () => number;

  // Utility
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkoutStore = create<WorkoutState & WorkoutActions>()((set, get) => ({
      // State
      workouts: [],
      currentWorkout: null,
      isLoading: false,
      error: null,

      // Workout CRUD
      createWorkout: (workoutData) => {
        const newWorkout: Workout = {
          ...workoutData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set(state => ({
          workouts: [...state.workouts, newWorkout],
        }));

        return newWorkout.id;
      },

      updateWorkout: (id, updates) => {
        set(state => ({
          workouts: state.workouts.map(workout =>
            workout.id === id
              ? { ...workout, ...updates, updatedAt: new Date().toISOString() }
              : workout
          ),
        }));
      },

      deleteWorkout: (id) => {
        set(state => ({
          workouts: state.workouts.filter(workout => workout.id !== id),
        }));
      },

      getWorkout: (id) => {
        return get().workouts.find(workout => workout.id === id);
      },

      getWorkoutsByDate: (date) => {
        return get().workouts.filter(workout => workout.date === date);
      },

      getWorkoutsByDateRange: (startDate, endDate) => {
        return get().workouts.filter(workout => 
          workout.date >= startDate && workout.date <= endDate
        );
      },

      // Current workout session
      startWorkout: (workout) => {
        set({ currentWorkout: workout });
      },

      finishWorkout: () => {
        const { currentWorkout } = get();
        if (currentWorkout) {
          // Update the workout as completed
          get().updateWorkout(currentWorkout.id, {
            completed: true,
            endTime: new Date().toISOString(),
          });
          
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

      // Calendar helpers
      getCalendarData: (year, month) => {
        const { workouts } = get();
        const startDate = startOfMonth(new Date(year, month - 1));
        const endDate = endOfMonth(new Date(year, month - 1));
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return days.map(day => {
          const dateString = format(day, 'yyyy-MM-dd');
          const dayWorkouts = workouts.filter(w => w.date === dateString);
          const hasWorkout = dayWorkouts.length > 0;
          const completedWorkout = dayWorkouts.find(w => w.completed);

          return {
            date: dateString,
            hasWorkout,
            workoutId: completedWorkout?.id,
            workoutName: completedWorkout?.name,
            duration: completedWorkout?.duration,
            completed: !!completedWorkout,
          };
        });
      },

      getWorkoutStreak: () => {
        const { workouts } = get();
        const completedWorkouts = workouts
          .filter(w => w.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (completedWorkouts.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        
        // Check if we worked out today or yesterday
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        
        const todayWorkout = completedWorkouts.find(w => w.date === today);
        const yesterdayWorkout = completedWorkouts.find(w => w.date === yesterday);

        if (!todayWorkout && !yesterdayWorkout) {
          return 0; // Streak broken
        }

        // Start counting from today or yesterday
        let checkDate = todayWorkout ? today : yesterday;
        
        for (const workout of completedWorkouts) {
          if (workout.date === checkDate) {
            streak++;
            // Move to previous day
            const date = new Date(checkDate);
            date.setDate(date.getDate() - 1);
            checkDate = format(date, 'yyyy-MM-dd');
          } else {
            break;
          }
        }

        return streak;
      },

      // Utility
      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
}));