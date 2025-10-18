import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useWorkoutsData } from '../hooks/useWorkoutsData';
import { useWorkoutActions } from '../hooks/useWorkoutActions';
import { useTemplatesData } from '../hooks/useTemplatesData';
import { useTheme } from '../contexts/ThemeContext';
import { Workout } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const WorkoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { workouts } = useWorkoutsData();
  const { deleteWorkout, loadWorkouts } = useWorkoutActions();
  const { templates } = useTemplatesData();
  const { isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load workouts when component mounts with a small delay to ensure navigation is ready
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await loadWorkouts();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading workouts:', error);
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(loadData, 100);
    return () => clearTimeout(timer);
  }, [loadWorkouts]);

  const handleStartWorkout = (templateId?: string) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      navigation.navigate('WorkoutSession', { 
        date: today,
        templateId,
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleEditWorkout = (workoutId: string) => {
    try {
      const workout = workouts.find(w => w.id === workoutId);
      if (workout) {
        navigation.navigate('WorkoutSession', {
          date: workout.date,
          workoutId: workout.id,
        });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleDeleteWorkout = (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteWorkout(workoutId)
        },
      ]
    );
  };

  const filteredWorkouts = workouts
    .filter(workout => {
      switch (selectedFilter) {
        case 'completed':
          return workout.completed;
        case 'incomplete':
          return !workout.completed;
        default:
          return true;
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentTemplates = templates
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 3);

  const renderWorkout = ({ item }: { item: Workout }) => (
    <View className={`rounded-lg p-4 mb-3 shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            {item.name || 'Workout'}
          </Text>
          <Text className={`${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'} text-sm`}>
            {format(parseISO(item.date), 'EEEE, MMMM d, yyyy')}
          </Text>
          <View className="flex-row mt-2">
            <Text className={`text-xs mr-4 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
              {item.sets?.length || 0} sets
            </Text>
            <Text className={`text-xs mr-4 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
              {new Set(item.sets?.map(set => set.exerciseId)).size || 0} exercises
            </Text>
            {item.duration && (
              <Text className={`text-xs mr-4 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                {item.duration}min
              </Text>
            )}
            <View className={`px-2 py-1 rounded ${
              item.completed 
                ? (isDark ? 'bg-teal-800' : 'bg-teal-100') 
                : (isDark ? 'bg-amber-800' : 'bg-amber-100')
            }`}>
              <Text className={`text-xs font-medium ${
                item.completed 
                  ? (isDark ? 'text-teal-200' : 'text-teal-800') 
                  : (isDark ? 'text-amber-200' : 'text-amber-800')
              }`}>
                {item.completed ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteWorkout(item.id)}
          className="p-2"
        >
          <Text className="text-red-400 text-sm">Delete</Text>
        </TouchableOpacity>
      </View>

      {item.notes && (
        <Text className={`${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'} text-sm mb-3`}>
          {item.notes}
        </Text>
      )}

      <View className="flex-row">
        <TouchableOpacity
          onPress={() => handleEditWorkout(item.id)}
          className="flex-1 rounded-lg py-2 mr-2 bg-primary"
        >
          <Text className={`text-center font-medium ${isDark ? 'text-gray-900' : 'text-white'}`}>
            {item.completed ? 'View' : 'Continue'}
          </Text>
        </TouchableOpacity>
        {!item.completed && (
          <TouchableOpacity
            onPress={() => handleEditWorkout(item.id)}
            className={`flex-1 rounded-lg py-2 ml-2 ${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'}`}
          >
            <Text className={`text-center font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Resume
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const FilterButton = ({ filter, label }: { filter: typeof selectedFilter, label: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedFilter(filter)}
      className={`px-4 py-2 rounded-lg ${
        selectedFilter === filter 
          ? 'bg-primary' 
          : (isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary')
      }`}
    >
      <Text 
        className={`font-medium ${
          selectedFilter === filter 
            ? (isDark ? 'text-gray-900' : 'text-white') 
            : (isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary')
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`} edges={['top']}>
        <View className="flex-1 justify-center items-center">
          <Text className={`text-lg ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`} edges={['top']}>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="pb-4">
        {/* Header */}
        <View className={`px-4 py-6 border-b ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'}`}>
          <View className="flex-row justify-between items-center">
            <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Workouts
            </Text>
            <TouchableOpacity
              onPress={() => handleStartWorkout()}
              className="rounded-lg px-4 py-2 bg-primary"
            >
              <Text className={`font-medium ${isDark ? 'text-gray-900' : 'text-white'}`}>New Workout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Start Templates */}
        {recentTemplates.length > 0 && (
          <View className={`mx-4 mt-4 rounded-lg shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
            <View className={`p-4 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
              <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                Quick Start
              </Text>
              <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                Start a workout from your most used templates
              </Text>
            </View>
            <View className="p-4">
              <View className="flex-row flex-wrap">
                {recentTemplates.map(template => (
                  <TouchableOpacity
                    key={template.id}
                    onPress={() => handleStartWorkout(template.id)}
                    className="rounded-lg px-3 py-2 mr-2 mb-2 bg-primary"
                  >
                    <Text className={`font-medium ${isDark ? 'text-gray-900' : 'text-white'}`}>
                      {template.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Filter Options */}
        <View className={`flex-row justify-center gap-4 py-4 mx-4 mt-4 rounded-lg shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
          <FilterButton filter="all" label="All" />
          <FilterButton filter="completed" label="Completed" />
          <FilterButton filter="incomplete" label="In Progress" />
        </View>

        {/* Workouts List */}
        <View className="px-4 mt-4">
          {filteredWorkouts.length === 0 ? (
            <View className={`rounded-lg p-8 shadow-sm items-center ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
              <Text className={`text-lg mb-2 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                {selectedFilter === 'all' ? 'No workouts yet' :
                 selectedFilter === 'completed' ? 'No completed workouts' :
                 'No workouts in progress'}
              </Text>
              <Text className={`text-sm text-center mb-4 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                {selectedFilter === 'all' ? 'Start your first workout to begin tracking your progress' :
                 selectedFilter === 'completed' ? 'Complete a workout to see it here' :
                 'Start a new workout to see it in progress'}
              </Text>
              <TouchableOpacity
                onPress={() => handleStartWorkout()}
                className="rounded-lg px-6 py-3 bg-primary"
              >
                <Text className={`font-medium ${isDark ? 'text-gray-900' : 'text-white'}`}>
                  Start First Workout
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {filteredWorkouts.map(workout => (
                <View key={workout.id}>
                  {renderWorkout({ item: workout })}
                </View>
              ))}
            </View>
          )}
        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutScreen;