import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type WorkoutSessionRouteProp = RouteProp<RootStackParamList, 'WorkoutSession'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ExerciseSet {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
}

interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

const WorkoutSessionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WorkoutSessionRouteProp>();
  const { date, templateId, workoutId } = route.params;

  const [workoutName, setWorkoutName] = useState('Workout Session');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    {
      id: '1',
      name: 'Bench Press',
      sets: [
        { id: '1-1', reps: '8', weight: '80', completed: false },
        { id: '1-2', reps: '8', weight: '80', completed: false },
        { id: '1-3', reps: '8', weight: '80', completed: false },
      ],
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      sets: [
        { id: '2-1', reps: '10', weight: '25', completed: false },
        { id: '2-2', reps: '10', weight: '25', completed: false },
        { id: '2-3', reps: '10', weight: '25', completed: false },
      ],
    },
  ]);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState('');

  const toggleSetCompleted = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(exercise => 
      exercise.id === exerciseId 
        ? {
            ...exercise,
            sets: exercise.sets.map(set => 
              set.id === setId 
                ? { ...set, completed: !set.completed }
                : set
            )
          }
        : exercise
    ));
  };

  const updateSetValue = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    setExercises(exercises.map(exercise => 
      exercise.id === exerciseId 
        ? {
            ...exercise,
            sets: exercise.sets.map(set => 
              set.id === setId 
                ? { ...set, [field]: value }
                : set
            )
          }
        : exercise
    ));
  };

  const addSet = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = {
      id: `${exerciseId}-${exercise.sets.length + 1}`,
      reps: lastSet?.reps || '8',
      weight: lastSet?.weight || '0',
      completed: false,
    };

    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, newSet] }
        : ex
    ));
  };

  const addExercise = () => {
    // TODO: Navigate to exercise selection screen
    Alert.alert('Add Exercise', 'Exercise selection coming soon!');
  };

  const startWorkout = () => {
    setWorkoutStarted(true);
  };

  const finishWorkout = () => {
    const completedSets = exercises.reduce((total, exercise) => 
      total + exercise.sets.filter(set => set.completed).length, 0
    );

    if (completedSets === 0) {
      Alert.alert('No Sets Completed', 'Please complete at least one set before finishing.');
      return;
    }

    Alert.alert(
      'Finish Workout',
      `You completed ${completedSets} sets. Save this workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: () => {
          // TODO: Save workout to database
          console.log('Workout saved');
          navigation.goBack();
        }},
      ]
    );
  };

  const discardWorkout = () => {
    Alert.alert(
      'Discard Workout',
      'Are you sure you want to discard this workout? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Workout Header */}
        <View className="bg-white p-4 border-b border-gray-200">
          <TextInput
            value={workoutName}
            onChangeText={setWorkoutName}
            className="text-xl font-bold text-gray-900 mb-2"
            placeholder="Workout Name"
          />
          <Text className="text-gray-600">
            {new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          {workoutStarted && (
            <View className="mt-2 bg-green-100 rounded-lg p-2">
              <Text className="text-green-800 text-sm font-medium">
                Workout in progress...
              </Text>
            </View>
          )}
        </View>

        {/* Exercises */}
        <View className="p-4">
          {exercises.map((exercise, exerciseIndex) => (
            <View key={exercise.id} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                {exercise.name}
              </Text>
              
              {/* Sets Header */}
              <View className="flex-row items-center mb-2">
                <Text className="w-12 text-xs text-gray-500 text-center">Set</Text>
                <Text className="flex-1 text-xs text-gray-500 text-center">Reps</Text>
                <Text className="flex-1 text-xs text-gray-500 text-center">Weight (kg)</Text>
                <Text className="w-12 text-xs text-gray-500 text-center">✓</Text>
              </View>

              {/* Sets */}
              {exercise.sets.map((set, setIndex) => (
                <View key={set.id} className="flex-row items-center mb-2">
                  <Text className="w-12 text-center text-gray-700 font-medium">
                    {setIndex + 1}
                  </Text>
                  <TextInput
                    value={set.reps}
                    onChangeText={(value) => updateSetValue(exercise.id, set.id, 'reps', value)}
                    className="flex-1 mx-2 p-2 border border-gray-300 rounded text-center"
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <TextInput
                    value={set.weight}
                    onChangeText={(value) => updateSetValue(exercise.id, set.id, 'weight', value)}
                    className="flex-1 mx-2 p-2 border border-gray-300 rounded text-center"
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <TouchableOpacity
                    onPress={() => toggleSetCompleted(exercise.id, set.id)}
                    className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                      set.completed 
                        ? 'bg-green-600 border-green-600' 
                        : 'border-gray-300'
                    }`}
                  >
                    {set.completed && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Set Button */}
              <TouchableOpacity
                onPress={() => addSet(exercise.id)}
                className="mt-2 bg-gray-100 rounded-lg py-2"
              >
                <Text className="text-gray-700 text-center font-medium">
                  + Add Set
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Exercise Button */}
          <TouchableOpacity
            onPress={addExercise}
            className="bg-blue-600 rounded-lg py-3 mb-4"
          >
            <Text className="text-white text-center font-medium">
              + Add Exercise
            </Text>
          </TouchableOpacity>

          {/* Workout Notes */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Notes
            </Text>
            <TextInput
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
              placeholder="Add any notes about this workout..."
              multiline
              numberOfLines={3}
              className="border border-gray-300 rounded-lg p-3 text-gray-700"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View className="bg-white border-t border-gray-200 p-4">
        {!workoutStarted ? (
          <TouchableOpacity
            onPress={startWorkout}
            className="bg-green-600 rounded-lg py-4"
          >
            <Text className="text-white text-center font-bold text-lg">
              Start Workout
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={discardWorkout}
              className="flex-1 bg-gray-200 rounded-lg py-3"
            >
              <Text className="text-gray-700 text-center font-medium">
                Discard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={finishWorkout}
              className="flex-1 bg-blue-600 rounded-lg py-3"
            >
              <Text className="text-white text-center font-medium">
                Finish Workout
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default WorkoutSessionScreen;