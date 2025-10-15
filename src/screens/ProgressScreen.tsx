import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, parseISO, subDays, subWeeks, subMonths } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useWorkoutStore } from '../stores/workoutStore';
import { useTemplateStore } from '../stores/templateStore';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Mock progress data
const mockProgressData = [
  { date: '2024-10-01', weight: 75.2, bodyFat: 15.5 },
  { date: '2024-10-05', weight: 75.0, bodyFat: 15.3 },
  { date: '2024-10-08', weight: 74.8, bodyFat: 15.1 },
  { date: '2024-10-12', weight: 74.9, bodyFat: 15.0 },
];

const mockExerciseProgress = [
  { 
    exercise: 'Bench Press', 
    history: [
      { date: '2024-09-15', weight: 70, reps: 8 },
      { date: '2024-09-25', weight: 72.5, reps: 8 },
      { date: '2024-10-05', weight: 75, reps: 8 },
      { date: '2024-10-12', weight: 77.5, reps: 8 },
    ]
  },
  { 
    exercise: 'Squat', 
    history: [
      { date: '2024-09-15', weight: 90, reps: 8 },
      { date: '2024-09-25', weight: 95, reps: 8 },
      { date: '2024-10-05', weight: 100, reps: 8 },
      { date: '2024-10-12', weight: 105, reps: 8 },
    ]
  },
  { 
    exercise: 'Deadlift', 
    history: [
      { date: '2024-09-15', weight: 110, reps: 5 },
      { date: '2024-09-25', weight: 115, reps: 5 },
      { date: '2024-10-05', weight: 120, reps: 5 },
      { date: '2024-10-12', weight: 125, reps: 5 },
    ]
  },
];

const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { workouts } = useWorkoutStore();
  const { exercises } = useTemplateStore();
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'body' | 'strength'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | '3months'>('month');
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  const handleViewExerciseHistory = (exerciseName: string) => {
    const exercise = exercises.find(ex => ex.name === exerciseName);
    if (exercise) {
      navigation.navigate('ExerciseHistory', {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
      });
    }
  };

  const handleAddWeight = () => {
    if (!newWeight.trim()) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }
    
    // TODO: Add weight entry to database
    Alert.alert('Success', 'Weight entry added!');
    setNewWeight('');
    setShowAddWeight(false);
  };

  // Calculate stats
  const completedWorkouts = workouts.filter(w => w.completed);
  const thisWeekWorkouts = completedWorkouts.filter(w => {
    const workoutDate = new Date(w.date);
    const weekAgo = subDays(new Date(), 7);
    return workoutDate >= weekAgo;
  }).length;

  const thisMonthWorkouts = completedWorkouts.filter(w => {
    const workoutDate = new Date(w.date);
    const monthAgo = subMonths(new Date(), 1);
    return workoutDate >= monthAgo;
  }).length;

  const currentStreak = useWorkoutStore.getState().getWorkoutStreak();

  const TabButton = ({ tab, label }: { tab: typeof selectedTab, label: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedTab(tab)}
      className={`flex-1 py-3 ${
        selectedTab === tab 
          ? 'border-b-2 border-gray-600' 
          : 'border-b border-gray-200'
      }`}
    >
      <Text className={`text-center font-medium ${
        selectedTab === tab 
          ? 'text-slate-400' 
          : 'text-gray-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const PeriodButton = ({ period, label }: { period: typeof selectedPeriod, label: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedPeriod(period)}
      className={`px-3 py-2 rounded-lg ${
        selectedPeriod === period 
          ? 'bg-gray-600' 
          : 'bg-gray-200'
      }`}
    >
      <Text className={`text-sm font-medium ${
        selectedPeriod === period 
          ? 'text-white' 
          : 'text-gray-700'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View className="p-4">
      {/* Quick Stats */}
      <View className="bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
        <Text className="text-lg font-semibold text-gray-100 mb-4">
          Quick Stats
        </Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-100">
              {completedWorkouts.length}
            </Text>
            <Text className="text-sm text-gray-600">Total Workouts</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-100">
              {currentStreak}
            </Text>
            <Text className="text-sm text-gray-600">Day Streak</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-100">
              {thisWeekWorkouts}
            </Text>
            <Text className="text-sm text-gray-600">This Week</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-100">
              {thisMonthWorkouts}
            </Text>
            <Text className="text-sm text-gray-600">This Month</Text>
          </View>
        </View>
      </View>

      {/* Recent Progress */}
      <View className="bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
        <Text className="text-lg font-semibold text-gray-100 mb-4">
          Recent Progress
        </Text>
        
        {mockProgressData.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-2">Latest Weight</Text>
            <Text className="text-2xl font-bold text-gray-100">
              {mockProgressData[mockProgressData.length - 1].weight}kg
            </Text>
            <Text className="text-sm text-gray-500">
              {format(parseISO(mockProgressData[mockProgressData.length - 1].date), 'MMM d, yyyy')}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          onPress={() => setShowAddWeight(true)}
          className="bg-gray-600 rounded-lg py-3"
        >
          <Text className="text-white text-center font-medium">
            Log Weight
          </Text>
        </TouchableOpacity>
      </View>

      {/* Charts Placeholder */}
      <View className="bg-gray-800 rounded-lg p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-100 mb-4">
          Progress Charts
        </Text>
        <View className="h-48 bg-gray-700 rounded-lg items-center justify-center">
          <Text className="text-gray-500 text-lg">📊</Text>
          <Text className="text-gray-500 mt-2">Charts coming soon!</Text>
          <Text className="text-sm text-gray-400 text-center mt-1">
            Weight, strength, and body composition trends
          </Text>
        </View>
      </View>
    </View>
  );

  const renderBodyProgress = () => (
    <View className="p-4">
      {/* Weight History */}
      <View className="bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-100">
            Weight History
          </Text>
          <TouchableOpacity 
            onPress={() => setShowAddWeight(true)}
            className="bg-gray-600 rounded-lg px-3 py-2"
          >
            <Text className="text-gray-100 text-sm font-medium">Add Entry</Text>
          </TouchableOpacity>
        </View>

        {mockProgressData.map((entry, index) => (
          <View key={entry.date} className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
            <View>
              <Text className="font-medium text-gray-300">
                {entry.weight}kg
              </Text>
              <Text className="text-sm text-gray-500">
                {format(parseISO(entry.date), 'MMM d, yyyy')}
              </Text>
            </View>
            {index > 0 && (
              <View className="items-end">
                <Text className={`text-sm font-medium ${
                  entry.weight > mockProgressData[index - 1].weight 
                    ? 'text-red-600' 
                    : entry.weight < mockProgressData[index - 1].weight
                    ? 'text-green-600'
                    : 'text-gray-600'
                }`}>
                  {entry.weight > mockProgressData[index - 1].weight ? '+' : ''}
                  {(entry.weight - mockProgressData[index - 1].weight).toFixed(1)}kg
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Body Measurements */}
      <View className="bg-gray-800 rounded-lg p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-100 mb-4">
          Body Measurements
        </Text>
        <View className="items-center py-8">
          <Text className="text-gray-500 mb-2">No measurements yet</Text>
          <TouchableOpacity className="bg-gray-100 rounded-lg px-4 py-2">
            <Text className="text-gray-700 font-medium">Add Measurements</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStrengthProgress = () => (
    <View className="p-4">
      {/* Exercise Progress */}
      <View className="bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
        <Text className="text-lg font-semibold text-gray-100 mb-4">
          Strength Progress
        </Text>
        
        {mockExerciseProgress.map((exercise) => {
          const latest = exercise.history[exercise.history.length - 1];
          const previous = exercise.history[exercise.history.length - 2];
          const improvement = previous ? latest.weight - previous.weight : 0;

          return (
            <TouchableOpacity
              key={exercise.exercise}
              onPress={() => handleViewExerciseHistory(exercise.exercise)}
              className="mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-medium text-gray-300 mb-1">
                    {exercise.exercise}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Latest: {latest.weight}kg × {latest.reps}
                  </Text>
                  {improvement !== 0 && (
                    <Text className={`text-sm font-medium ${
                      improvement > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {improvement > 0 ? '+' : ''}{improvement}kg from last session
                    </Text>
                  )}
                </View>
                <Text className="text-gray-600 text-sm font-medium">
                  View History →
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Personal Records */}
      <View className="bg-gray-800 rounded-lg p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-100 mb-4">
          Personal Records
        </Text>
        <View className="items-center py-8">
          <Text className="text-gray-500 mb-2">No personal records yet</Text>
          <Text className="text-sm text-gray-400 text-center">
            Complete workouts to track your personal bests
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-gray-800 border-b border-gray-700">
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-gray-100">
            Progress
          </Text>
          <Text className="text-gray-300">
            Track your fitness journey
          </Text>
        </View>

        {/* Tabs */}
        <View className="flex-row">
          <TabButton tab="overview" label="Overview" />
          <TabButton tab="body" label="Body" />
          <TabButton tab="strength" label="Strength" />
        </View>
      </View>

      <ScrollView className="flex-1">
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'body' && renderBodyProgress()}
        {selectedTab === 'strength' && renderStrengthProgress()}
      </ScrollView>

      {/* Add Weight Modal */}
      {showAddWeight && (
        <View className="absolute inset-0 items-center justify-center">
          <View className="bg-gray-300 rounded-lg p-6 mx-4 w-full max-w-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Log Weight
            </Text>
            <TextInput
              value={newWeight}
              onChangeText={setNewWeight}
              placeholder="Enter weight (kg)"
              keyboardType="numeric"
              className="border border-gray-400 rounded-lg p-3 mb-4"
            />
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setShowAddWeight(false)}
                className="flex-1 bg-gray-200 rounded-lg py-3"
              >
                <Text className="text-gray-700 text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddWeight}
                className="flex-1 bg-gray-600 rounded-lg py-3"
              >
                <Text className="text-white text-center font-medium">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProgressScreen;