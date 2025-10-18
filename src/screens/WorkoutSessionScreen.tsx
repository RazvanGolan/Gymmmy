import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useWorkoutActions } from '../hooks/useWorkoutActions';
import { useWorkoutsData } from '../hooks/useWorkoutsData';
import { useTemplatesData } from '../hooks/useTemplatesData';
import { useTemplateActions } from '../hooks/useTemplateActions';
import { Workout, WorkoutSet, TemplateExercise } from '../types';

type WorkoutSessionRouteProp = RouteProp<RootStackParamList, 'WorkoutSession'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const WorkoutSessionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WorkoutSessionRouteProp>();
  const { date, templateId, workoutId } = route.params;
  const { createWorkout, updateWorkout } = useWorkoutActions();
  const { getWorkout } = useWorkoutsData();
  const { getTemplate } = useTemplatesData();
  const { incrementTemplateUsage } = useTemplateActions();

  const [workoutName, setWorkoutName] = useState('Workout Session');
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [startTime] = useState(new Date().toISOString());

  useEffect(() => {
    // If editing existing workout, load the data
    if (workoutId) {
      const existingWorkout = getWorkout(workoutId);
      if (existingWorkout) {
        setWorkoutName(existingWorkout.name || 'Workout Session');
        setWorkoutNotes(existingWorkout.notes || '');
        setWorkoutSets(existingWorkout.sets);
      }
    } else if (templateId) {
      const template = getTemplate(templateId);
      if (template) {
        setWorkoutName(template.name);
        
        // Convert template exercises to workout sets
        const templateSets: WorkoutSet[] = [];
        template.exercises.forEach(exercise => {
          for (let i = 0; i < exercise.sets; i++) {
            templateSets.push({
              id: `${exercise.exerciseId}-${i + 1}`,
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exerciseName,
              reps: exercise.reps || 8,
              weight: exercise.weight || 0,
              completed: false,
              notes: exercise.notes || '',
            });
          }
        });
        
        setWorkoutSets(templateSets);
      }
    }
  }, [workoutId, templateId, getWorkout, getTemplate]);

  const updateSetValue = (setId: string, field: 'reps' | 'weight', value: string) => {
    setWorkoutSets(workoutSets.map(set => 
      set.id === setId 
        ? { 
            ...set, 
            [field]: field === 'reps' ? parseInt(value) || 0 : parseFloat(value) || 0
          }
        : set
    ));
  };

  const addSet = (exerciseId: string) => {
    const exerciseSets = workoutSets.filter(set => set.exerciseId === exerciseId);
    const lastSet = exerciseSets[exerciseSets.length - 1];
    const exerciseName = lastSet?.exerciseName || 'Unknown Exercise';
    
    const newSet: WorkoutSet = {
      id: `${exerciseId}-${exerciseSets.length + 1}`,
      exerciseId,
      exerciseName,
      reps: lastSet?.reps || 8,
      weight: lastSet?.weight || 0,
      completed: false,
      notes: '',
    };

    setWorkoutSets([...workoutSets, newSet]);
  };

  const addExercise = () => {
    navigation.navigate('AddExercise', {
      onSelectExercise: (selectedExercise: { id: string; name: string }) => {
        const newSet: WorkoutSet = {
          id: `${selectedExercise.id}-1`,
          exerciseId: selectedExercise.id,
          exerciseName: selectedExercise.name,
          reps: 8,
          weight: 0,
          completed: false,
          notes: '',
        };
        setWorkoutSets([...workoutSets, newSet]);
      }
    });
  };

  const removeSet = (setId: string) => {
    setWorkoutSets(workoutSets.filter(set => set.id !== setId));
  };

  const removeExercise = (exerciseId: string) => {
    setWorkoutSets(workoutSets.filter(set => set.exerciseId !== exerciseId));
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

  const finishWorkout = async () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: async () => {
          try {
            const endTime = new Date().toISOString();
            const startTimeDate = new Date(startTime);
            const endTimeDate = new Date(endTime);
            const durationInMinutes = (endTimeDate.getTime() - startTimeDate.getTime()) / (1000 * 60);
            const duration = Math.max(1, Math.round(durationInMinutes));

            const workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'> = {
              name: workoutName,
              date: date,
              startTime: startTime,
              endTime: endTime,
              duration: duration,
              sets: workoutSets,
              templateId: templateId,
              notes: workoutNotes,
              completed: true,
            };

            if (workoutId) {
              await updateWorkout(workoutId, workoutData);
            } else {
              await createWorkout(workoutData);
              if (templateId) {
                await incrementTemplateUsage(templateId);
              }
            }

            console.log('Workout saved successfully');
            navigation.goBack();
          } catch (error) {
            console.error('Failed to save workout:', error);
            Alert.alert('Error', 'Failed to save workout. Please try again.');
          }
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

  const getGroupedExercises = () => {
    const grouped: { [exerciseId: string]: { exerciseId: string; exerciseName: string; sets: WorkoutSet[] } } = {};
    
    workoutSets.forEach(set => {
      if (!grouped[set.exerciseId]) {
        grouped[set.exerciseId] = {
          exerciseId: set.exerciseId,
          exerciseName: set.exerciseName,
          sets: []
        };
      }
      grouped[set.exerciseId].sets.push(set);
    });
    
    return Object.values(grouped);
  };

  const groupedExercises = getGroupedExercises();

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
          {groupedExercises.map((exercise: { exerciseId: string; exerciseName: string; sets: WorkoutSet[] }, exerciseIndex: number) => (
            <Swipeable
              key={exercise.exerciseId}
              renderRightActions={() => renderDeleteAction(() => removeExercise(exercise.exerciseId))}
            >
              <View className="bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-100 mb-3">
                {exercise.exerciseName}
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
              {exercise.sets.map((set: WorkoutSet, setIndex: number) => {                
                return (
                  <Swipeable
                    key={set.id}
                    renderRightActions={() => renderDeleteAction(() => removeSet(set.id))}
                  >
                    <View className="flex-row items-center justify-between mb-3 bg-gray-800">
                      <View className="w-16 items-center justify-center">
                        <Text className="text-center text-gray-200 font-medium">
                          {setIndex + 1}
                        </Text>
                      </View>
                      <View className="w-20 items-center justify-center">
                        <Text className="text-center text-gray-400 text-xs">
                          {set.reps}x{set.weight}kg
                        </Text>
                      </View>
                      <TextInput
                        value={set.reps.toString()}
                        onChangeText={(value) => updateSetValue(set.id, 'reps', value)}
                        className="w-16 px-2 py-1 border border-gray-600 rounded text-center bg-gray-700 text-gray-200"
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <TextInput
                        value={set.weight?.toString() || '0'}
                        onChangeText={(value) => updateSetValue(set.id, 'weight', value)}
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
                onPress={() => addSet(exercise.exerciseId)}
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