import { useCallback } from 'react';
import { Exercise } from '../types';
import { databaseService } from '../services/database';
import { useExercisesData } from './useExercisesData';

export const useExerciseActions = () => {
  const { 
    addExercise, 
    setExercises, 
    setLoading, 
    setError 
  } = useExercisesData();

  const addCustomExercise = useCallback(async (
    exerciseData: Omit<Exercise, 'id'>
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await databaseService.addCustomExercise(exerciseData);
      
      if (result.success && result.data) {
        addExercise(result.data);
        setLoading(false);
        return result.data.id;
      } else {
        setError(result.error || 'Failed to add exercise');
        setLoading(false);
        return null;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add exercise');
      setLoading(false);
      return null;
    }
  }, [addExercise, setLoading, setError]);

  const loadExercises = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await databaseService.getExercises();
      
      if (result.success && result.data) {
        setExercises(result.data);
        setLoading(false);
      } else {
        setError(result.error || 'Failed to load exercises');
        setLoading(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load exercises');
      setLoading(false);
    }
  }, [setExercises, setLoading, setError]);

  return {
    addExercise: addCustomExercise,
    loadExercises,
  };
};