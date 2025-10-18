import { databaseService } from './database';

export interface Exercise {
  id: string;
  name: string;
  category: string;
}

export const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Neck'];

export const exerciseService = {
  async getAllExercises(): Promise<Exercise[]> {
    try {
      const result = await databaseService.getExercises();
      if (result.success && result.data) {
        return result.data.map(exercise => ({
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get exercises:', error);
      return [];
    }
  },

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    const allExercises = await this.getAllExercises();
    if (category === 'All') {
      return allExercises;
    }
    return allExercises.filter(exercise => exercise.category === category);
  },

  async searchExercises(query: string, category: string = 'All'): Promise<Exercise[]> {
    const exercises = await this.getExercisesByCategory(category);
    if (!query.trim()) {
      return exercises;
    }
    return exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  async addCustomExercise(name: string, category: string): Promise<Exercise | null> {
    try {
      const result = await databaseService.addCustomExercise({
        name: name.trim(),
        category,
        muscleGroups: [category], // Default to category as muscle group
      });
      
      if (result.success && result.data) {
        return {
          id: result.data.id,
          name: result.data.name,
          category: result.data.category,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to add custom exercise:', error);
      return null;
    }
  },

  async getExerciseById(id: string): Promise<Exercise | undefined> {
    const allExercises = await this.getAllExercises();
    return allExercises.find(exercise => exercise.id === id);
  },

  async exerciseExists(name: string): Promise<boolean> {
    const allExercises = await this.getAllExercises();
    return allExercises.some(
      exercise => exercise.name.toLowerCase() === name.toLowerCase()
    );
  }
};