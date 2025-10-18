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
import { useTheme } from '../contexts/ThemeContext';

type WorkoutSessionRouteProp = RouteProp<RootStackParamList, 'WorkoutSession'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const WorkoutSessionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WorkoutSessionRouteProp>();
  const { date, templateId, workoutId } = route.params;
  const { createWorkout, updateWorkout } = useWorkoutActions();
  const { getWorkout, workouts } = useWorkoutsData();
  const { getTemplate } = useTemplatesData();
  const { incrementTemplateUsage } = useTemplateActions();
  const { isDark } = useTheme();

  const [workoutName, setWorkoutName] = useState('Workout Session');
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [startTime] = useState(new Date().toISOString());
  const [lastWorkoutData, setLastWorkoutData] = useState<{ [exerciseId: string]: WorkoutSet[] }>({});

  const getLastWorkoutDataForExercises = (exerciseIds: string[]) => {
    const lastData: { [exerciseId: string]: WorkoutSet[] } = {};
    
    const completedWorkouts = workouts
      .filter(w => w.completed && w.id !== workoutId)
      .sort((a, b) => {
        const timeA = a.endTime ? new Date(a.endTime).getTime() : new Date(a.date).getTime();
        const timeB = b.endTime ? new Date(b.endTime).getTime() : new Date(b.date).getTime();
        return timeB - timeA;
      });

    exerciseIds.forEach(exerciseId => {
      for (const workout of completedWorkouts) {
        const exerciseSets = workout.sets.filter(set => set.exerciseId === exerciseId);
        if (exerciseSets.length > 0) {
          lastData[exerciseId] = exerciseSets;
          break;
        }
      }
    });

    return lastData;
  };

  useEffect(() => {
    // If editing existing workout, load the data
    if (workoutId) {
      const existingWorkout = getWorkout(workoutId);
      if (existingWorkout) {
        setWorkoutName(existingWorkout.name || 'Workout Session');
        setWorkoutNotes(existingWorkout.notes || '');
        setWorkoutSets(existingWorkout.sets);
        
        const exerciseIds = [...new Set(existingWorkout.sets.map(set => set.exerciseId))];
        const lastData = getLastWorkoutDataForExercises(exerciseIds);
        setLastWorkoutData(lastData);
      }
    } else if (templateId) {
      const template = getTemplate(templateId);
      if (template) {
        setWorkoutName(template.name);
        
        // Convert template exercises to workout sets
        const templateSets: WorkoutSet[] = [];
        const exerciseIds: string[] = [];
        
        template.exercises.forEach(exercise => {
          exerciseIds.push(exercise.exerciseId);
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
        
        const lastData = getLastWorkoutDataForExercises(exerciseIds);
        setLastWorkoutData(lastData);
      }
    }
  }, [workoutId, templateId, getWorkout, getTemplate, workouts]);

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
        
        const lastData = getLastWorkoutDataForExercises([selectedExercise.id]);
        setLastWorkoutData(prev => ({ ...prev, ...lastData }));
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
    <GestureHandlerRootView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      <KeyboardAvoidingView 
        className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView 
            showsVerticalScrollIndicator={true}
            onStartShouldSetResponder={() => true}
          >
        {/* Workout Header */}
        <View className={`p-4 border-b ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'}`}>
          <TextInput
            value={workoutName}
            onChangeText={setWorkoutName}
            className={`text-xl font-bold mb-2 bg-transparent ${isDark ? 'text-dark-text' : 'text-light-text'}`}
            placeholder="Workout Name"
          />
          <Text className={`${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
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
              <View className={`rounded-lg p-4 mb-4 shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
              <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                {exercise.exerciseName}
              </Text>
              
              {/* Sets Header */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="w-16 items-center">
                  <Text className={`text-xs font-medium ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>Set</Text>
                </View>
                <View className="w-20 items-center">
                  <Text className={`text-xs font-medium ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>Last</Text>
                </View>
                <View className="w-16 items-center">
                  <Text className={`text-xs font-medium ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>Reps</Text>
                </View>
                <View className="w-20 items-center">
                  <Text className={`text-xs font-medium ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>Weight (kg)</Text>
                </View>
              </View>

              {/* Sets */}
              {exercise.sets.map((set: WorkoutSet, setIndex: number) => {
                const lastSets = lastWorkoutData[exercise.exerciseId] || [];
                const lastSet = lastSets[setIndex];
                const lastSetDisplay = lastSet ? `${lastSet.reps}x${lastSet.weight}` : '-';
                
                return (
                  <Swipeable
                    key={set.id}
                    renderRightActions={() => renderDeleteAction(() => removeSet(set.id))}
                  >
                    <View className={`flex-row items-center justify-between mb-3 ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
                      <View className="w-16 items-center justify-center">
                        <Text className={`text-center font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                          {setIndex + 1}
                        </Text>
                      </View>
                      <View className="w-20 items-center justify-center">
                        <Text className={`text-center text-xs ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                          {lastSetDisplay}
                        </Text>
                      </View>
                      <TextInput
                        value={set.reps.toString()}
                        onChangeText={(value) => updateSetValue(set.id, 'reps', value)}
                        className={`w-16 px-2 py-1 border rounded text-center ${isDark ? 'border-dark-border bg-dark-surface-secondary text-dark-text' : 'border-light-border bg-light-surface-secondary text-light-text'}`}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <TextInput
                        value={set.weight?.toString() || '0'}
                        onChangeText={(value) => updateSetValue(set.id, 'weight', value)}
                        className={`w-20 px-2 py-1 border rounded text-center ${isDark ? 'border-dark-border bg-dark-surface-secondary text-dark-text' : 'border-light-border bg-light-surface-secondary text-light-text'}`}
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
                className={`mt-4 rounded-lg py-2 ${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'}`}
              >
                <Text className={`text-center font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  + Add Set
                </Text>
              </TouchableOpacity>
              </View>
            </Swipeable>
          ))}

          {/* Add Exercise Button */}
          <TouchableOpacity
            onPress={addExercise}
            className="bg-primary rounded-lg py-3 mb-4"
          >
            <Text className={`text-center font-medium ${isDark ? 'text-gray-900' : 'text-white'}`}>
              + Add Exercise
            </Text>
          </TouchableOpacity>

          {/* Workout Notes */}
          <View className={`rounded-lg p-4 mb-4 shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
            <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Notes
            </Text>
            <TextInput
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
              placeholder="Add any notes about this workout..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              className={`border rounded-lg p-3 ${isDark ? 'border-dark-border text-dark-text bg-dark-surface-secondary' : 'border-light-border text-light-text bg-light-surface-secondary'}`}
            />
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action Buttons */}
      <View className={`${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'} border-t p-4`}>
        <View className="flex-row justify-between gap-5">
          <TouchableOpacity
            onPress={discardWorkout}
            className={`flex-1 rounded-lg py-3 ${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'}`}
          >
            <Text className={`text-center font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Delete Workout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={finishWorkout}
            className="flex-1 bg-primary rounded-lg py-3"
          >
            <Text className={`text-center font-medium ${isDark ? 'text-gray-900' : 'text-white'}`}>
              Finish Workout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

export default WorkoutSessionScreen;