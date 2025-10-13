export interface Exercise {
  id: string;
  name: string;
  category: string;
}

// Default exercise database
export const defaultExercises: Exercise[] = [
  // Chest
  { id: 'chest-1', name: 'Bench Press', category: 'Chest' },
  { id: 'chest-2', name: 'Incline Bench Press', category: 'Chest' },
  { id: 'chest-3', name: 'Decline Bench Press', category: 'Chest' },
  { id: 'chest-4', name: 'Dumbbell Press', category: 'Chest' },
  { id: 'chest-5', name: 'Incline Dumbbell Press', category: 'Chest' },
  { id: 'chest-6', name: 'Decline Dumbbell Press', category: 'Chest' },
  { id: 'chest-7', name: 'Dumbbell Flyes', category: 'Chest' },
  { id: 'chest-8', name: 'Incline Dumbbell Flyes', category: 'Chest' },
  { id: 'chest-9', name: 'Cable Flyes', category: 'Chest' },
  { id: 'chest-10', name: 'Cable Flyes Low to High', category: 'Chest' },
  { id: 'chest-11', name: 'Push Ups', category: 'Chest' },
  { id: 'chest-12', name: 'Incline Push Ups', category: 'Chest' },
  { id: 'chest-13', name: 'Decline Push Ups', category: 'Chest' },
  { id: 'chest-14', name: 'Chest Dips', category: 'Chest' },
  { id: 'chest-15', name: 'Cable Crossover', category: 'Chest' },
  { id: 'chest-16', name: 'Pec Deck', category: 'Chest' },

  // Back
  { id: 'back-1', name: 'Deadlifts', category: 'Back' },
  { id: 'back-2', name: 'Romanian Deadlifts', category: 'Back' },
  { id: 'back-3', name: 'Sumo Deadlifts', category: 'Back' },
  { id: 'back-4', name: 'Pull Ups', category: 'Back' },
  { id: 'back-5', name: 'Chin Ups', category: 'Back' },
  { id: 'back-6', name: 'Wide Grip Pull Ups', category: 'Back' },
  { id: 'back-7', name: 'Lat Pulldowns', category: 'Back' },
  { id: 'back-8', name: 'Close Grip Lat Pulldowns', category: 'Back' },
  { id: 'back-9', name: 'Wide Grip Lat Pulldowns', category: 'Back' },
  { id: 'back-10', name: 'Barbell Rows', category: 'Back' },
  { id: 'back-11', name: 'T-Bar Rows', category: 'Back' },
  { id: 'back-12', name: 'Dumbbell Rows', category: 'Back' },
  { id: 'back-13', name: 'Cable Rows', category: 'Back' },
  { id: 'back-14', name: 'Face Pulls', category: 'Back' },
  { id: 'back-15', name: 'Reverse Flyes', category: 'Back' },
  { id: 'back-16', name: 'Shrugs', category: 'Back' },
  { id: 'back-17', name: 'Machine Rows', category: 'Back' },
  { id: 'back-18', name: 'Machine High Rows', category: 'Back' },

  // Shoulders
  { id: 'shoulders-1', name: 'Overhead Press', category: 'Shoulders' },
  { id: 'shoulders-2', name: 'Military Press', category: 'Shoulders' },
  { id: 'shoulders-3', name: 'Dumbbell Shoulder Press', category: 'Shoulders' },
  { id: 'shoulders-4', name: 'Arnold Press', category: 'Shoulders' },
  { id: 'shoulders-5', name: 'Lateral Raises', category: 'Shoulders' },
  { id: 'shoulders-6', name: 'Front Raises', category: 'Shoulders' },
  { id: 'shoulders-7', name: 'Rear Delt Flyes', category: 'Shoulders' },
  { id: 'shoulders-8', name: 'Upright Rows', category: 'Shoulders' },
  { id: 'shoulders-9', name: 'Pike Push Ups', category: 'Shoulders' },
  { id: 'shoulders-10', name: 'Handstand Push Ups', category: 'Shoulders' },
  { id: 'shoulders-11', name: 'Cable Lateral Raises', category: 'Shoulders' },
  { id: 'shoulders-12', name: 'Machine Shoulder Press', category: 'Shoulders' },

  // Arms
  { id: 'arms-1', name: 'Bicep Curls', category: 'Arms' },
  { id: 'arms-2', name: 'Hammer Curls', category: 'Arms' },
  { id: 'arms-3', name: 'Preacher Curls', category: 'Arms' },
  { id: 'arms-4', name: 'Concentration Curls', category: 'Arms' },
  { id: 'arms-5', name: 'Cable Curls', category: 'Arms' },
  { id: 'arms-6', name: '21s', category: 'Arms' },
  { id: 'arms-7', name: 'Straight Bar Curls', category: 'Arms' },
  { id: 'arms-8', name: 'EZ Bar Curls', category: 'Arms' },
  { id: 'arms-9', name: 'Tricep Dips', category: 'Arms' },
  { id: 'arms-10', name: 'Close Grip Bench Press', category: 'Arms' },
  { id: 'arms-11', name: 'Tricep Pushdowns', category: 'Arms' },
  { id: 'arms-12', name: 'Overhead Tricep Extension', category: 'Arms' },
  { id: 'arms-13', name: 'Skull Crushers', category: 'Arms' },
  { id: 'arms-14', name: 'Diamond Push Ups', category: 'Arms' },
  { id: 'arms-15', name: 'French Press', category: 'Arms' },
  { id: 'arms-16', name: 'Cable Tricep Extensions', category: 'Arms' },

  // Legs
  { id: 'legs-1', name: 'Squats', category: 'Legs' },
  { id: 'legs-2', name: 'Front Squats', category: 'Legs' },
  { id: 'legs-3', name: 'Goblet Squats', category: 'Legs' },
  { id: 'legs-4', name: 'Bulgarian Split Squats', category: 'Legs' },
  { id: 'legs-5', name: 'Lunges', category: 'Legs' },
  { id: 'legs-6', name: 'Walking Lunges', category: 'Legs' },
  { id: 'legs-7', name: 'Leg Press', category: 'Legs' },
  { id: 'legs-8', name: 'Leg Extensions', category: 'Legs' },
  { id: 'legs-9', name: 'Leg Curls', category: 'Legs' },
  { id: 'legs-10', name: 'Calf Raises', category: 'Legs' },
  { id: 'legs-11', name: 'Seated Calf Raises', category: 'Legs' },
  { id: 'legs-12', name: 'Hip Thrusts', category: 'Legs' },
  { id: 'legs-13', name: 'Glute Bridges', category: 'Legs' },
  { id: 'legs-14', name: 'Step Ups', category: 'Legs' },
  { id: 'legs-15', name: 'Wall Sits', category: 'Legs' },
  { id: 'legs-16', name: 'Pistol Squats', category: 'Legs' },

  // Core
  { id: 'core-1', name: 'Plank', category: 'Core' },
  { id: 'core-2', name: 'Side Plank', category: 'Core' },
  { id: 'core-3', name: 'Crunches', category: 'Core' },
  { id: 'core-4', name: 'Bicycle Crunches', category: 'Core' },
  { id: 'core-5', name: 'Russian Twists', category: 'Core' },
  { id: 'core-6', name: 'Mountain Climbers', category: 'Core' },
  { id: 'core-7', name: 'Leg Raises', category: 'Core' },
  { id: 'core-8', name: 'Hanging Leg Raises', category: 'Core' },
  { id: 'core-9', name: 'Dead Bug', category: 'Core' },
  { id: 'core-10', name: 'Bird Dog', category: 'Core' },
  { id: 'core-11', name: 'Ab Wheel Rollouts', category: 'Core' },
  { id: 'core-12', name: 'Hollow Body Hold', category: 'Core' },
  { id: 'core-13', name: 'V-Ups', category: 'Core' },
  { id: 'core-14', name: 'Cable Crunches', category: 'Core' },

  // Neck
  { id: 'neck-1', name: 'Neck Flexion', category: 'Neck' },
  { id: 'neck-2', name: 'Neck Extension', category: 'Neck' },
  { id: 'neck-3', name: 'Lateral Neck Flexion', category: 'Neck' },
  { id: 'neck-4', name: 'Neck Circles', category: 'Neck' },
  { id: 'neck-5', name: 'Isometric Neck Exercises', category: 'Neck' },
];

export const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Neck'];

// TODO: Add these in the DB
let customExercises: Exercise[] = [];

export const exerciseService = {
  getAllExercises(): Exercise[] {
    return [...defaultExercises, ...customExercises];
  },

  getExercisesByCategory(category: string): Exercise[] {
    const allExercises = this.getAllExercises();
    if (category === 'All') {
      return allExercises;
    }
    return allExercises.filter(exercise => exercise.category === category);
  },

  searchExercises(query: string, category: string = 'All'): Exercise[] {
    const exercises = this.getExercisesByCategory(category);
    if (!query.trim()) {
      return exercises;
    }
    return exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  addCustomExercise(name: string, category: string): Exercise {
    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category
    };
    customExercises.push(newExercise);
    return newExercise;
  },

  getExerciseById(id: string): Exercise | undefined {
    return this.getAllExercises().find(exercise => exercise.id === id);
  },

  exerciseExists(name: string): boolean {
    return this.getAllExercises().some(
      exercise => exercise.name.toLowerCase() === name.toLowerCase()
    );
  }
};