import { create } from 'zustand';
import { Workout, CalendarWorkout } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface WorkoutsDataState {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
}

interface WorkoutsDataActions {
  setWorkouts: (workouts: Workout[]) => void;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, workout: Workout) => void;
  removeWorkout: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getWorkout: (id: string) => Workout | undefined;
  getWorkoutsByDate: (date: string) => Workout[];
  getWorkoutsByDateRange: (startDate: string, endDate: string) => Workout[];
  getCalendarData: (year: number, month: number) => CalendarWorkout[];
  getWorkoutStreak: () => number;
}

export const useWorkoutsData = create<WorkoutsDataState & WorkoutsDataActions>()((set, get) => ({
  // State
  workouts: [],
  isLoading: false,
  error: null,

  // Actions
  setWorkouts: (workouts) => {
    set({ workouts });
  },

  addWorkout: (workout) => {
    set(state => ({
      workouts: [...state.workouts, workout],
    }));
  },

  updateWorkout: (id, updatedWorkout) => {
    set(state => ({
      workouts: state.workouts.map(workout =>
        workout.id === id ? updatedWorkout : workout
      ),
    }));
  },

  removeWorkout: (id) => {
    set(state => ({
      workouts: state.workouts.filter(workout => workout.id !== id),
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
}));