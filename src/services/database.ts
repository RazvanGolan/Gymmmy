import * as SQLite from 'expo-sqlite';
import { Workout, WorkoutTemplate, Exercise, ProgressEntry, ApiResponse } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    
    try {
      this.db = await SQLite.openDatabaseAsync('gymmy.db');
      await this.createTables();
      await this.seedDefaultExercises();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        instructions TEXT,
        muscle_groups TEXT NOT NULL,
        equipment TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workout_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        exercises TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        usage_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        name TEXT,
        date TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        duration INTEGER,
        sets TEXT NOT NULL,
        template_id TEXT,
        notes TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS progress_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('weight', 'body_measurement', 'fitness_test', 'photo')),
        weight REAL,
        body_fat_percentage REAL,
        muscle_mass REAL,
        measurements TEXT,
        notes TEXT,
        photos TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        target_weight REAL,
        notifications_enabled INTEGER DEFAULT 1,
        dark_mode_enabled INTEGER DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts (date);
      CREATE INDEX IF NOT EXISTS idx_progress_date ON progress_entries (date);
      CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises (category);
    `);
  }

  private async seedDefaultExercises(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if exercises already exist
    const count = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM exercises');
    if (count?.count && count.count > 0) return;

    const defaultExercises = [
      // Chest
      { id: 'chest-1', name: 'Bench Press', category: 'Chest', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
      { id: 'chest-2', name: 'Incline Bench Press', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'] },
      { id: 'chest-3', name: 'Dumbbell Press', category: 'Chest', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
      { id: 'chest-4', name: 'Push Ups', category: 'Chest', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
      { id: 'chest-5', name: 'Dumbbell Flyes', category: 'Chest', muscleGroups: ['Chest'] },
      { id: 'chest-6', name: 'Cable Crossover', category: 'Chest', muscleGroups: ['Chest'] },

      // Back
      { id: 'back-1', name: 'Deadlifts', category: 'Back', muscleGroups: ['Back', 'Glutes', 'Hamstrings'] },
      { id: 'back-2', name: 'Pull Ups', category: 'Back', muscleGroups: ['Back', 'Biceps'] },
      { id: 'back-3', name: 'Lat Pulldowns', category: 'Back', muscleGroups: ['Back', 'Biceps'] },
      { id: 'back-4', name: 'Barbell Rows', category: 'Back', muscleGroups: ['Back', 'Biceps'] },
      { id: 'back-5', name: 'Cable Rows', category: 'Back', muscleGroups: ['Back', 'Biceps'] },

      // Shoulders
      { id: 'shoulders-1', name: 'Overhead Press', category: 'Shoulders', muscleGroups: ['Shoulders', 'Triceps'] },
      { id: 'shoulders-2', name: 'Lateral Raises', category: 'Shoulders', muscleGroups: ['Shoulders'] },
      { id: 'shoulders-3', name: 'Front Raises', category: 'Shoulders', muscleGroups: ['Shoulders'] },
      { id: 'shoulders-4', name: 'Rear Delt Flyes', category: 'Shoulders', muscleGroups: ['Shoulders'] },

      // Arms
      { id: 'arms-1', name: 'Bicep Curls', category: 'Arms', muscleGroups: ['Biceps'] },
      { id: 'arms-2', name: 'Hammer Curls', category: 'Arms', muscleGroups: ['Biceps', 'Forearms'] },
      { id: 'arms-3', name: 'Tricep Dips', category: 'Arms', muscleGroups: ['Triceps'] },
      { id: 'arms-4', name: 'Tricep Pushdowns', category: 'Arms', muscleGroups: ['Triceps'] },

      // Legs
      { id: 'legs-1', name: 'Squats', category: 'Legs', muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'] },
      { id: 'legs-2', name: 'Lunges', category: 'Legs', muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'] },
      { id: 'legs-3', name: 'Leg Press', category: 'Legs', muscleGroups: ['Quadriceps', 'Glutes'] },
      { id: 'legs-4', name: 'Calf Raises', category: 'Legs', muscleGroups: ['Calves'] },

      // Core
      { id: 'core-1', name: 'Plank', category: 'Core', muscleGroups: ['Core'] },
      { id: 'core-2', name: 'Crunches', category: 'Core', muscleGroups: ['Core'] },
      { id: 'core-3', name: 'Russian Twists', category: 'Core', muscleGroups: ['Core'] },
      { id: 'core-4', name: 'Mountain Climbers', category: 'Core', muscleGroups: ['Core'] },
    ];

    for (const exercise of defaultExercises) {
      await this.db.runAsync(
        'INSERT OR IGNORE INTO exercises (id, name, category, muscle_groups) VALUES (?, ?, ?, ?)',
        [exercise.id, exercise.name, exercise.category, JSON.stringify(exercise.muscleGroups)]
      );
    }
  }

  // Workout operations
  async getWorkouts(startDate?: string, endDate?: string): Promise<ApiResponse<Workout[]>> {
    try {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      let sql = 'SELECT * FROM workouts WHERE 1=1';
      const params: any[] = [];

      if (startDate && endDate) {
        sql += ' AND date >= ? AND date <= ?';
        params.push(startDate, endDate);
      }

      sql += ' ORDER BY date DESC';

      const rows = await this.db.getAllAsync<any>(sql, params);

      const workouts: Workout[] = rows ? rows.map(row => ({
        id: row.id,
        name: row.name,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        duration: row.duration,
        sets: row.sets ? JSON.parse(row.sets) : [],
        templateId: row.template_id,
        notes: row.notes,
        completed: Boolean(row.completed),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })) : [];

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
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      const id = `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await this.db.runAsync(
        'INSERT INTO workouts (id, name, date, start_time, end_time, duration, sets, template_id, notes, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          workout.name || null,
          workout.date,
          workout.startTime || null,
          workout.endTime || null,
          workout.duration ?? null,
          JSON.stringify(workout.sets),
          workout.templateId || null,
          workout.notes || null,
          workout.completed ? 1 : 0,
          now,
          now
        ]
      );

      const row = await this.db.getFirstAsync<any>(
        'SELECT * FROM workouts WHERE id = ?',
        [id]
      );

      if (!row) throw new Error('Failed to retrieve created workout');

      return {
        success: true,
        data: {
          id: row.id,
          name: row.name,
          date: row.date,
          startTime: row.start_time,
          endTime: row.end_time,
          duration: row.duration,
          sets: row.sets ? JSON.parse(row.sets) : [],
          templateId: row.template_id,
          notes: row.notes,
          completed: Boolean(row.completed),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
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
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      const updatedAt = new Date().toISOString();

      await this.db.runAsync(
        'UPDATE workouts SET name = ?, date = ?, start_time = ?, end_time = ?, duration = ?, sets = ?, template_id = ?, notes = ?, completed = ?, updated_at = ? WHERE id = ?',
        [
          updates.name || null,
          updates.date || null,
          updates.startTime || null,
          updates.endTime || null,
          updates.duration ?? null,
          updates.sets ? JSON.stringify(updates.sets) : null,
          updates.templateId || null,
          updates.notes || null,
          updates.completed !== undefined ? (updates.completed ? 1 : 0) : null,
          updatedAt,
          id
        ]
      );

      const row = await this.db.getFirstAsync<any>(
        'SELECT * FROM workouts WHERE id = ?',
        [id]
      );

      if (!row) {
        return {
          success: false,
          error: 'Workout not found',
        };
      }

      return {
        success: true,
        data: {
          id: row.id,
          name: row.name,
          date: row.date,
          startTime: row.start_time,
          endTime: row.end_time,
          duration: row.duration,
          sets: row.sets ? JSON.parse(row.sets) : [],
          templateId: row.template_id,
          notes: row.notes,
          completed: Boolean(row.completed),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
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
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      await this.db.runAsync('DELETE FROM workouts WHERE id = ?', [id]);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete workout',
      };
    }
  }

  // Template operations
  async getTemplates(): Promise<ApiResponse<WorkoutTemplate[]>> {
    try {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      const rows = await this.db.getAllAsync<any>(
        'SELECT * FROM workout_templates ORDER BY updated_at DESC'
      );

      const templates: WorkoutTemplate[] = rows ? rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        exercises: JSON.parse(row.exercises),
        usageCount: row.usage_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })) : [];

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
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await this.db.runAsync(
        'INSERT INTO workout_templates (id, name, description, exercises, created_at, updated_at, usage_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          template.name,
          template.description || null,
          JSON.stringify(template.exercises),
          now,
          now,
          0
        ]
      );

      const row = await this.db.getFirstAsync<any>(
        'SELECT * FROM workout_templates WHERE id = ?',
        [id]
      );

      if (!row) throw new Error('Failed to retrieve created template');

      return {
        success: true,
        data: {
          id: row.id,
          name: row.name,
          description: row.description,
          exercises: JSON.parse(row.exercises),
          usageCount: row.usage_count,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
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
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      const updatedAt = new Date().toISOString();

      await this.db.runAsync(
        'UPDATE workout_templates SET name = ?, description = ?, exercises = ?, usage_count = ?, updated_at = ? WHERE id = ?',
        [
          updates.name || null,
          updates.description || null,
          updates.exercises ? JSON.stringify(updates.exercises) : null,
          updates.usageCount || null,
          updatedAt,
          id
        ]
      );

      const row = await this.db.getFirstAsync<any>(
        'SELECT * FROM workout_templates WHERE id = ?',
        [id]
      );

      if (!row) {
        return {
          success: false,
          error: 'Template not found',
        };
      }

      return {
        success: true,
        data: {
          id: row.id,
          name: row.name,
          description: row.description,
          exercises: JSON.parse(row.exercises),
          usageCount: row.usage_count,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
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
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      await this.db.runAsync('DELETE FROM workout_templates WHERE id = ?', [id]);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template',
      };
    }
  }

  async incrementTemplateUsage(id: string): Promise<ApiResponse<void>> {
    try {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      await this.db.runAsync(
        'UPDATE workout_templates SET usage_count = usage_count + 1, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), id]
      );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to increment template usage',
      };
    }
  }

  // Exercise operations
  async getExercises(): Promise<ApiResponse<Exercise[]>> {
    try {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      const rows = await this.db.getAllAsync<any>(
        'SELECT * FROM exercises ORDER BY name'
      );

      const exercises: Exercise[] = rows ? rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description,
        instructions: row.instructions ? JSON.parse(row.instructions) : undefined,
        muscleGroups: JSON.parse(row.muscle_groups),
        equipment: row.equipment ? JSON.parse(row.equipment) : undefined,
      })) : [];

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
  async getProgressEntries(): Promise<ApiResponse<ProgressEntry[]>> {
    try {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      const rows = await this.db.getAllAsync<any>(
        'SELECT * FROM progress_entries ORDER BY date DESC'
      );

      const entries: ProgressEntry[] = rows ? rows.map(row => ({
        id: row.id,
        date: row.date,
        type: row.type,
        weight: row.weight,
        bodyFatPercentage: row.body_fat_percentage,
        muscleMass: row.muscle_mass,
        measurements: row.measurements ? JSON.parse(row.measurements) : undefined,
        notes: row.notes,
        photos: row.photos ? JSON.parse(row.photos) : undefined,
        createdAt: row.created_at,
      })) : [];

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
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      const id = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const result = await this.db.runAsync(
        'INSERT INTO progress_entries (id, date, type, weight, body_fat_percentage, muscle_mass, measurements, notes, photos, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          entry.date,
          entry.type,
          entry.weight || null,
          entry.bodyFatPercentage || null,
          entry.muscleMass || null,
          entry.measurements ? JSON.stringify(entry.measurements) : null,
          entry.notes || null,
          entry.photos ? JSON.stringify(entry.photos) : null,
          now,
        ]
      );

      const row = await this.db.getFirstAsync<any>(
        'SELECT * FROM progress_entries WHERE id = ?',
        [id]
      );

      if (!row) throw new Error('Failed to retrieve created progress entry');

      return {
        success: true,
        data: {
          id: row.id,
          date: row.date,
          type: row.type,
          weight: row.weight,
          bodyFatPercentage: row.body_fat_percentage,
          muscleMass: row.muscle_mass,
          measurements: row.measurements ? JSON.parse(row.measurements) : null,
          notes: row.notes,
          photos: row.photos ? JSON.parse(row.photos) : [],
          createdAt: row.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create progress entry',
      };
    }
  }

  // Additional utility method to add custom exercises
  async addCustomExercise(exercise: Omit<Exercise, 'id'>): Promise<ApiResponse<Exercise>> {
    try {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await this.db.runAsync(
        'INSERT INTO exercises (id, name, category, description, instructions, muscle_groups, equipment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          exercise.name,
          exercise.category,
          exercise.description || null,
          exercise.instructions ? JSON.stringify(exercise.instructions) : null,
          JSON.stringify(exercise.muscleGroups),
          exercise.equipment ? JSON.stringify(exercise.equipment) : null,
          now
        ]
      );

      return {
        success: true,
        data: {
          id,
          name: exercise.name,
          category: exercise.category,
          description: exercise.description,
          instructions: exercise.instructions,
          muscleGroups: exercise.muscleGroups,
          equipment: exercise.equipment,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add custom exercise',
      };
    }
  }

  // Debug and maintenance methods
  async debugResetDatabase(): Promise<void> {
    try {
      if (!this.db) {
        // Force initialize a new database
        this.db = await SQLite.openDatabaseAsync('gymmy.db');
      }

      console.log('=== RESETTING DATABASE ===');
      
      // Drop all tables
      await this.db.execAsync(`
        DROP TABLE IF EXISTS workout_templates;
        DROP TABLE IF EXISTS workouts;
        DROP TABLE IF EXISTS exercises;
        DROP TABLE IF EXISTS progress_entries;
        DROP TABLE IF EXISTS user_settings;
      `);
      
      console.log('Dropped all tables');
      
      // Recreate tables with correct schema
      await this.createTables();
      await this.seedDefaultExercises();
      
      console.log('Database reset complete with correct schema');
    } catch (error) {
      console.error('Database reset failed:', error);
      throw error;
    }
  }

  async debugPrintSchema(): Promise<void> {
    try {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      console.log('=== DATABASE SCHEMA DEBUG ===');
      
      const tables = ['workout_templates', 'workouts', 'exercises', 'progress_entries', 'user_settings'];
      
      for (const tableName of tables) {
        try {
          const schema = await this.db.getAllAsync(`PRAGMA table_info(${tableName})`);
          console.log(`\n--- ${tableName.toUpperCase()} SCHEMA ---`);
          schema.forEach((col: any) => {
            console.log(`${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
          });
        } catch (error) {
          console.log(`Table ${tableName} does not exist or error: ${error}`);
        }
      }
      
      console.log('=== END SCHEMA DEBUG ===');
    } catch (error) {
      console.error('Schema debug failed:', error);
    }
  }

  // User Settings operations
  async getUserSettings(): Promise<ApiResponse<any>> {
    try {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      let row = await this.db.getFirstAsync<any>(
        'SELECT * FROM user_settings WHERE id = ?',
        ['default']
      );

      if (!row) {
        const now = new Date().toISOString();
        await this.db.runAsync(
          'INSERT INTO user_settings (id, target_weight, notifications_enabled, dark_mode_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          ['default', null, 1, 1, now, now]
        );
        
        row = await this.db.getFirstAsync<any>(
          'SELECT * FROM user_settings WHERE id = ?',
          ['default']
        );
      }

      return {
        success: true,
        data: {
          id: row!.id,
          targetWeight: row!.target_weight,
          notificationsEnabled: Boolean(row!.notifications_enabled),
          darkModeEnabled: Boolean(row!.dark_mode_enabled),
          createdAt: row!.created_at,
          updatedAt: row!.updated_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user settings',
      };
    }
  }

  async updateUserSettings(updates: {
    targetWeight?: number | null;
    notificationsEnabled?: boolean;
    darkModeEnabled?: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');

      const updatedAt = new Date().toISOString();

      await this.getUserSettings();

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.targetWeight !== undefined) {
        updateFields.push('target_weight = ?');
        updateValues.push(updates.targetWeight);
      }
      if (updates.notificationsEnabled !== undefined) {
        updateFields.push('notifications_enabled = ?');
        updateValues.push(updates.notificationsEnabled ? 1 : 0);
      }
      if (updates.darkModeEnabled !== undefined) {
        updateFields.push('dark_mode_enabled = ?');
        updateValues.push(updates.darkModeEnabled ? 1 : 0);
      }

      updateFields.push('updated_at = ?');
      updateValues.push(updatedAt);
      updateValues.push('default'); // WHERE id = ?

      await this.db.runAsync(
        `UPDATE user_settings SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      return await this.getUserSettings();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user settings',
      };
    }
  }
}

export const databaseService = new DatabaseService();