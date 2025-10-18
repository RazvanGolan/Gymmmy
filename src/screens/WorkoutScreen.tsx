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

type NavigationProp = StackNavigationProp<RootStackParamList>;

const WorkoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { workouts } = useWorkoutsData();
  const { deleteWorkout, loadWorkouts } = useWorkoutActions();
  const { templates } = useTemplatesData();
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

  const renderWorkout = ({ item }: { item: typeof workouts[0] }) => (
    <View className="bg-gray-800 rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-100">
            {item.name || 'Workout'}
          </Text>
          <Text className="text-gray-300 text-sm">
            {format(parseISO(item.date), 'EEEE, MMMM d, yyyy')}
          </Text>
          <View className="flex-row mt-2">
            <Text className="text-xs text-gray-400 mr-4">
              {item.sets?.length || 0} sets
            </Text>
            <Text className="text-xs text-gray-400 mr-4">
              {new Set(item.sets?.map(set => set.exerciseId)).size || 0} exercises
            </Text>
            {item.duration && (
              <Text className="text-xs text-gray-400 mr-4">
                {item.duration}min
              </Text>
            )}
            <View className={`px-2 py-1 rounded ${
              item.completed ? 'bg-teal-800' : 'bg-amber-800'
            }`}>
              <Text className={`text-xs font-medium ${
                item.completed ? 'text-teal-200' : 'text-amber-200'
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
        <Text className="text-gray-300 text-sm mb-3">
          {item.notes}
        </Text>
      )}

      <View className="flex-row">
        <TouchableOpacity
          onPress={() => handleEditWorkout(item.id)}
          className="flex-1 bg-gray-600 rounded-lg py-2 mr-2"
        >
          <Text className="text-gray-200 text-center font-medium">
            {item.completed ? 'View' : 'Continue'}
          </Text>
        </TouchableOpacity>
        {!item.completed && (
          <TouchableOpacity
            onPress={() => handleEditWorkout(item.id)}
            className="flex-1 bg-slate-600 rounded-lg py-2 ml-2"
          >
            <Text className="text-white text-center font-medium">
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
          ? 'bg-slate-600' 
          : 'bg-gray-700'
      }`}
    >
      <Text className={`font-medium ${
        selectedFilter === filter 
          ? 'text-white' 
          : 'text-gray-300'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-300 text-lg">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View className="bg-gray-800 px-4 py-6 border-b border-gray-700">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-gray-100">
              Workouts
            </Text>
            <TouchableOpacity
              onPress={() => handleStartWorkout()}
              className="bg-slate-600 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-medium">New Workout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Start Templates */}
        {recentTemplates.length > 0 && (
          <View className="bg-gray-800 mx-4 mt-4 rounded-lg shadow-sm">
            <View className="p-4 border-b border-gray-700">
              <Text className="text-lg font-semibold text-gray-100">
                Quick Start
              </Text>
              <Text className="text-sm text-gray-300">
                Start a workout from your most used templates
              </Text>
            </View>
            <View className="p-4">
              <View className="flex-row flex-wrap">
                {recentTemplates.map(template => (
                  <TouchableOpacity
                    key={template.id}
                    onPress={() => handleStartWorkout(template.id)}
                    className="bg-slate-700 rounded-lg px-3 py-2 mr-2 mb-2"
                  >
                    <Text className="text-slate-200 font-medium">
                      {template.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Filter Options */}
        <View className="flex-row justify-center gap-4 py-4 bg-gray-800 mx-4 mt-4 rounded-lg shadow-sm">
          <FilterButton filter="all" label="All" />
          <FilterButton filter="completed" label="Completed" />
          <FilterButton filter="incomplete" label="In Progress" />
        </View>

        {/* Workouts List */}
        <View className="px-4 mt-4">
          {filteredWorkouts.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-8 shadow-sm items-center">
              <Text className="text-gray-300 text-lg mb-2">
                {selectedFilter === 'all' ? 'No workouts yet' :
                 selectedFilter === 'completed' ? 'No completed workouts' :
                 'No workouts in progress'}
              </Text>
              <Text className="text-sm text-gray-400 text-center mb-4">
                {selectedFilter === 'all' ? 'Start your first workout to begin tracking your progress' :
                 selectedFilter === 'completed' ? 'Complete a workout to see it here' :
                 'Start a new workout to see it in progress'}
              </Text>
              <TouchableOpacity
                onPress={() => handleStartWorkout()}
                className="bg-slate-600 rounded-lg px-6 py-3"
              >
                <Text className="text-white font-medium">
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

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutScreen;