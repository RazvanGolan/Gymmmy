import { useCallback } from 'react';
import { Workout } from '../types';
import { databaseService } from '../services/database';
import { useWorkoutsData } from './useWorkoutsData';
import { useCurrentWorkout } from './useCurrentWorkout';

export const useWorkoutActions = () => {
  const { 
    addWorkout, 
    updateWorkout: updateWorkoutInStore, 
    removeWorkout, 
    setWorkouts, 
    setLoading, 
    setError 
  } = useWorkoutsData();

  const { finishWorkout: finishCurrentWorkout } = useCurrentWorkout();

  const createWorkout = useCallback(async (
    workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await databaseService.createWorkout(workoutData);
      
      if (result.success && result.data) {
        addWorkout(result.data);
        setLoading(false);
        return result.data.id;
      } else {
        setError(result.error || 'Failed to create workout');
        setLoading(false);
        return null;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create workout');
      setLoading(false);
      return null;
    }
  }, [addWorkout, setLoading, setError]);

  const updateWorkout = useCallback(async (
    id: string, 
    updates: Partial<Workout>
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await databaseService.updateWorkout(id, updates);
      
      if (result.success && result.data) {
        updateWorkoutInStore(id, result.data);
        setLoading(false);
      } else {
        setError(result.error || 'Failed to update workout');
        setLoading(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update workout');
      setLoading(false);
    }
  }, [updateWorkoutInStore, setLoading, setError]);

  const deleteWorkout = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await databaseService.deleteWorkout(id);
      
      if (result.success) {
        removeWorkout(id);
        setLoading(false);
      } else {
        setError(result.error || 'Failed to delete workout');
        setLoading(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete workout');
      setLoading(false);
    }
  }, [removeWorkout, setLoading, setError]);

  const loadWorkouts = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await databaseService.getWorkouts();
      
      if (result.success && result.data) {
        setWorkouts(result.data);
        setLoading(false);
      } else {
        setError(result.error || 'Failed to load workouts');
        setLoading(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load workouts');
      setLoading(false);
    }
  }, [setWorkouts, setLoading, setError]);

  const finishWorkout = useCallback(async (): Promise<void> => {
    const { currentWorkout } = useCurrentWorkout.getState();
    if (currentWorkout) {
      await updateWorkout(currentWorkout.id, {
        completed: true,
        endTime: new Date().toISOString(),
      });
      finishCurrentWorkout();
    }
  }, [updateWorkout, finishCurrentWorkout]);

  return {
    createWorkout,
    updateWorkout,
    deleteWorkout,
    loadWorkouts,
    finishWorkout,
  };
};