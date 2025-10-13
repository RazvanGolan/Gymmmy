import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/AppNavigator';

type WorkoutSessionRouteProp = RouteProp<RootStackParamList, 'WorkoutSession'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ExerciseSet {
  id: string;
  last: string;
  reps: string;
  weight: string;
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
        { id: '1-1', last: '8x12kg', reps: '8', weight: '80' },
        { id: '1-2', last: '8x12kg', reps: '8', weight: '80' },
        { id: '1-3', last: '8x12kg', reps: '8', weight: '80' },
      ],
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      sets: [
        { id: '2-1', last: '10x25kg', reps: '10', weight: '25' },
        { id: '2-2', last: '10x25kg', reps: '10', weight: '25' },
        { id: '2-3', last: '10x25kg', reps: '10', weight: '25' },
      ],
    },
    { id: '3', name: 'Push Ups', sets: [{ id: '3-1', last: '15xBW', reps: '15', weight: 'bodyweight' }] },
    {
      id: '4',
      name: 'Dumbbell Flyes',
      sets: [
        { id: '4-1', last: '12x15kg', reps: '12', weight: '15' },
        { id: '4-2', last: '12x15kg', reps: '12', weight: '15' },
        { id: '4-3', last: '12x15kg', reps: '12', weight: '15' },
      ],
    },
  ]);
  const [workoutNotes, setWorkoutNotes] = useState('');

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
    // TODO: Get the last set weight from the database if available
    const newSet: ExerciseSet = {
      id: `${exerciseId}-${exercise.sets.length + 1}`,
      last: lastSet?.last || '8x12kg',
      reps: lastSet?.reps || '8',
      weight: lastSet?.weight || '0',
    };

    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, newSet] }
        : ex
    ));
  };

  const addExercise = () => {
    navigation.navigate('AddExercise', {
      onSelectExercise: (newExercise) => {
        setExercises([...exercises, newExercise]);
      }
    });
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(exercise => 
      exercise.id === exerciseId 
        ? {
            ...exercise,
            sets: exercise.sets.filter(set => set.id !== setId)
          }
        : exercise
    ));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
  };

  const renderDeleteAction = (onDelete: () => void) => {
    return (
      <View className="flex-row">
        <TouchableOpacity
          onPress={onDelete}
          className="bg-red-500 justify-center items-center rounded-lg w-20 mb-4 ml-4"
        >
          <Icon name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };



  const finishWorkout = () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
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
    <GestureHandlerRootView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView 
        className="flex-1 bg-gray-900"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView 
            showsVerticalScrollIndicator={true}
            onStartShouldSetResponder={() => true}
          >
        {/* Workout Header */}
        <View className="bg-gray-800 p-4 border-b border-gray-700">
          <TextInput
            value={workoutName}
            onChangeText={setWorkoutName}
            className="text-xl font-bold text-gray-100 mb-2 bg-transparent"
            placeholder="Workout Name"
          />
          <Text className="text-gray-300">
            {new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>

        </View>

        {/* Exercises */}
        <View className="p-4">
          {exercises.map((exercise, exerciseIndex) => (
            <Swipeable
              key={exercise.id}
              renderRightActions={() => renderDeleteAction(() => removeExercise(exercise.id))}
            >
              <View className="bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-100 mb-3">
                {exercise.name}
              </Text>
              
              {/* Sets Header */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="w-16 items-center">
                  <Text className="text-xs text-gray-400 font-medium">Set</Text>
                </View>
                <View className="w-20 items-center">
                  <Text className="text-xs text-gray-400 font-medium">Last</Text>
                </View>
                <View className="w-16 items-center">
                  <Text className="text-xs text-gray-400 font-medium">Reps</Text>
                </View>
                <View className="w-20 items-center">
                  <Text className="text-xs text-gray-400 font-medium">Weight (kg)</Text>
                </View>
              </View>

              {/* Sets */}
              {exercise.sets.map((set, setIndex) => {                
                return (
                  <Swipeable
                    key={set.id}
                    renderRightActions={() => renderDeleteAction(() => removeSet(exercise.id, set.id))}
                  >
                    <View className="flex-row items-center justify-between mb-3 bg-gray-800">
                      <View className="w-16 items-center justify-center">
                        <Text className="text-center text-gray-200 font-medium">
                          {setIndex + 1}
                        </Text>
                      </View>
                      <View className="w-20 items-center justify-center">
                        <Text className="text-center text-gray-400 text-xs">
                          {set.last}
                        </Text>
                      </View>
                      <TextInput
                        value={set.reps}
                        onChangeText={(value) => updateSetValue(exercise.id, set.id, 'reps', value)}
                        className="w-16 px-2 py-1 border border-gray-600 rounded text-center bg-gray-700 text-gray-200"
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <TextInput
                        value={set.weight}
                        onChangeText={(value) => updateSetValue(exercise.id, set.id, 'weight', value)}
                        className="w-20 px-2 py-1 border border-gray-600 rounded text-center bg-gray-700 text-gray-200"
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    </View>
                  </Swipeable>
                );
              })}

              {/* Add Set Button */}
              <TouchableOpacity
                onPress={() => addSet(exercise.id)}
                className="mt-4 bg-gray-600 rounded-lg py-2"
              >
                <Text className="text-gray-200 text-center font-medium">
                  + Add Set
                </Text>
              </TouchableOpacity>
              </View>
            </Swipeable>
          ))}

          {/* Add Exercise Button */}
          <TouchableOpacity
            onPress={addExercise}
            className="bg-slate-600 rounded-lg py-3 mb-4"
          >
            <Text className="text-white text-center font-medium">
              + Add Exercise
            </Text>
          </TouchableOpacity>

          {/* Workout Notes */}
          <View className="bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-100 mb-2">
              Notes
            </Text>
            <TextInput
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
              placeholder="Add any notes about this workout..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              className="border border-gray-600 rounded-lg p-3 text-gray-200 bg-gray-700"
            />
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action Buttons */}
      <View className="bg-gray-800 border-t border-gray-700 p-4">
        <View className="flex-row justify-between gap-5">
          <TouchableOpacity
            onPress={discardWorkout}
            className="flex-1 bg-gray-600 rounded-lg py-3"
          >
            <Text className="text-white text-center font-medium">
              Delete Workout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={finishWorkout}
            className="flex-1 bg-teal-600 rounded-lg py-3"
          >
            <Text className="text-white text-center font-medium">
              Finish Workout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

export default WorkoutSessionScreen;