import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useWorkoutStore } from '../stores/workoutStore';
import { useTemplateStore } from '../stores/templateStore';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const WorkoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { workouts, deleteWorkout } = useWorkoutStore();
  const { templates } = useTemplateStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  const handleStartWorkout = (templateId?: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    navigation.navigate('WorkoutSession', { 
      date: today,
      templateId,
    });
  };

  const handleEditWorkout = (workoutId: string) => {
    const workout = workouts.find(w => w.id === workoutId);
    if (workout) {
      navigation.navigate('WorkoutSession', {
        date: workout.date,
        workoutId: workout.id,
      });
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
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {item.name || 'Workout'}
          </Text>
          <Text className="text-gray-600 text-sm">
            {format(parseISO(item.date), 'EEEE, MMMM d, yyyy')}
          </Text>
          <View className="flex-row mt-2">
            <Text className="text-xs text-gray-500 mr-4">
              {item.sets.length} exercises
            </Text>
            {item.duration && (
              <Text className="text-xs text-gray-500 mr-4">
                {item.duration}min
              </Text>
            )}
            <View className={`px-2 py-1 rounded ${
              item.completed ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <Text className={`text-xs font-medium ${
                item.completed ? 'text-green-800' : 'text-yellow-800'
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
          <Text className="text-red-600 text-sm">Delete</Text>
        </TouchableOpacity>
      </View>

      {item.notes && (
        <Text className="text-gray-600 text-sm mb-3">
          {item.notes}
        </Text>
      )}

      <View className="flex-row">
        <TouchableOpacity
          onPress={() => handleEditWorkout(item.id)}
          className="flex-1 bg-gray-100 rounded-lg py-2 mr-2"
        >
          <Text className="text-gray-700 text-center font-medium">
            {item.completed ? 'View' : 'Continue'}
          </Text>
        </TouchableOpacity>
        {!item.completed && (
          <TouchableOpacity
            onPress={() => handleEditWorkout(item.id)}
            className="flex-1 bg-blue-600 rounded-lg py-2 ml-2"
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
          ? 'bg-blue-600' 
          : 'bg-gray-200'
      }`}
    >
      <Text className={`font-medium ${
        selectedFilter === filter 
          ? 'text-white' 
          : 'text-gray-700'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View className="bg-white px-4 py-6 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-gray-900">
              Workouts
            </Text>
            <TouchableOpacity
              onPress={() => handleStartWorkout()}
              className="bg-blue-600 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-medium">New Workout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Start Templates */}
        {recentTemplates.length > 0 && (
          <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-900">
                Quick Start
              </Text>
              <Text className="text-sm text-gray-600">
                Start a workout from your most used templates
              </Text>
            </View>
            <View className="p-4">
              <View className="flex-row flex-wrap">
                {recentTemplates.map(template => (
                  <TouchableOpacity
                    key={template.id}
                    onPress={() => handleStartWorkout(template.id)}
                    className="bg-blue-100 rounded-lg px-3 py-2 mr-2 mb-2"
                  >
                    <Text className="text-blue-800 font-medium">
                      {template.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Filter Options */}
        <View className="flex-row justify-center gap-4 py-4 bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <FilterButton filter="all" label="All" />
          <FilterButton filter="completed" label="Completed" />
          <FilterButton filter="incomplete" label="In Progress" />
        </View>

        {/* Workouts List */}
        <View className="px-4 mt-4">
          {filteredWorkouts.length === 0 ? (
            <View className="bg-white rounded-lg p-8 shadow-sm items-center">
              <Text className="text-gray-500 text-lg mb-2">
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
                className="bg-blue-600 rounded-lg px-6 py-3"
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