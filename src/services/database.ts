import { supabase } from './supabase';
import { User, Workout, WorkoutTemplate, Exercise, ProgressEntry, ApiResponse } from '../types';

class DatabaseService {
  // User operations
  async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          email: data.email,
          name: data.name,
          weight: data.weight,
          preferences: data.preferences,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user',
      };
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          weight: updates.weight,
          preferences: updates.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          email: data.email,
          name: data.name,
          weight: data.weight,
          preferences: data.preferences,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  }

  // Workout operations
  async getWorkouts(userId: string, startDate?: string, endDate?: string): Promise<ApiResponse<Workout[]>> {
    try {
      let query = supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const workouts: Workout[] = data.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        duration: row.duration,
        sets: row.sets,
        templateId: row.template_id,
        notes: row.notes,
        completed: row.completed,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return {
        success: true,
        data: workouts,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workouts',
      };
    }
  }

  async createWorkout(workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Workout>> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: workout.userId,
          name: workout.name,
          date: workout.date,
          start_time: workout.startTime,
          end_time: workout.endTime,
          duration: workout.duration,
          sets: workout.sets,
          template_id: workout.templateId,
          notes: workout.notes,
          completed: workout.completed,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          date: data.date,
          startTime: data.start_time,
          endTime: data.end_time,
          duration: data.duration,
          sets: data.sets,
          templateId: data.template_id,
          notes: data.notes,
          completed: data.completed,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create workout',
      };
    }
  }

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<ApiResponse<Workout>> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .update({
          name: updates.name,
          date: updates.date,
          start_time: updates.startTime,
          end_time: updates.endTime,
          duration: updates.duration,
          sets: updates.sets,
          template_id: updates.templateId,
          notes: updates.notes,
          completed: updates.completed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          date: data.date,
          startTime: data.start_time,
          endTime: data.end_time,
          duration: data.duration,
          sets: data.sets,
          templateId: data.template_id,
          notes: data.notes,
          completed: data.completed,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update workout',
      };
    }
  }

  async deleteWorkout(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete workout',
      };
    }
  }

  // Template operations
  async getTemplates(userId: string): Promise<ApiResponse<WorkoutTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const templates: WorkoutTemplate[] = data.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        category: row.category,
        estimatedDuration: row.estimated_duration,
        exercises: row.exercises,
        usageCount: row.usage_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return {
        success: true,
        data: templates,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get templates',
      };
    }
  }

  async createTemplate(template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<ApiResponse<WorkoutTemplate>> {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .insert({
          user_id: template.userId,
          name: template.name,
          description: template.description,
          category: template.category,
          estimated_duration: template.estimatedDuration,
          exercises: template.exercises,
          usage_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          description: data.description,
          category: data.category,
          estimatedDuration: data.estimated_duration,
          exercises: data.exercises,
          usageCount: data.usage_count,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template',
      };
    }
  }

  async updateTemplate(id: string, updates: Partial<WorkoutTemplate>): Promise<ApiResponse<WorkoutTemplate>> {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          estimated_duration: updates.estimatedDuration,
          exercises: updates.exercises,
          usage_count: updates.usageCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          description: data.description,
          category: data.category,
          estimatedDuration: data.estimated_duration,
          exercises: data.exercises,
          usageCount: data.usage_count,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template',
      };
    }
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template',
      };
    }
  }

  // Exercise operations
  async getExercises(): Promise<ApiResponse<Exercise[]>> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;

      const exercises: Exercise[] = data.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description,
        instructions: row.instructions,
        muscleGroups: row.muscle_groups,
        equipment: row.equipment,
      }));

      return {
        success: true,
        data: exercises,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get exercises',
      };
    }
  }

  // Progress operations
  async getProgressEntries(userId: string): Promise<ApiResponse<ProgressEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      const entries: ProgressEntry[] = data.map(row => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        type: row.type,
        weight: row.weight,
        bodyFatPercentage: row.body_fat_percentage,
        muscleMass: row.muscle_mass,
        measurements: row.measurements,
        notes: row.notes,
        photos: row.photos,
        createdAt: row.created_at,
      }));

      return {
        success: true,
        data: entries,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get progress entries',
      };
    }
  }

  async createProgressEntry(entry: Omit<ProgressEntry, 'id' | 'createdAt'>): Promise<ApiResponse<ProgressEntry>> {
    try {
      const { data, error } = await supabase
        .from('progress_entries')
        .insert({
          user_id: entry.userId,
          date: entry.date,
          type: entry.type,
          weight: entry.weight,
          body_fat_percentage: entry.bodyFatPercentage,
          muscle_mass: entry.muscleMass,
          measurements: entry.measurements,
          notes: entry.notes,
          photos: entry.photos,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          date: data.date,
          type: data.type,
          weight: data.weight,
          bodyFatPercentage: data.body_fat_percentage,
          muscleMass: data.muscle_mass,
          measurements: data.measurements,
          notes: data.notes,
          photos: data.photos,
          createdAt: data.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create progress entry',
      };
    }
  }
}

export const databaseService = new DatabaseService();