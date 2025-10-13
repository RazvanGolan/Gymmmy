import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data
const mockStats = {
  totalWorkouts: 45,
  totalDuration: 2340, // minutes
  totalSets: 623,
  totalReps: 4981,
  totalWeight: 18750, // kg
  currentStreak: 7,
  longestStreak: 12,
  averageWorkoutDuration: 52,
  thisWeek: {
    workouts: 4,
    duration: 210,
    sets: 52,
    volume: 3200,
  },
  lastWeek: {
    workouts: 3,
    duration: 155,
    sets: 38,
    volume: 2850,
  },
  favoriteExercises: [
    { name: 'Bench Press', count: 15 },
    { name: 'Squat', count: 12 },
    { name: 'Deadlift', count: 10 },
    { name: 'Pull-ups', count: 8 },
  ],
};

const StatsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const PeriodButton = ({ period, label }: { period: typeof selectedPeriod, label: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedPeriod(period)}
      className={`px-4 py-2 rounded-lg ${
        selectedPeriod === period 
          ? 'bg-slate-600' 
          : 'bg-gray-200'
      }`}
    >
      <Text className={`font-medium ${
        selectedPeriod === period 
          ? 'text-white' 
          : 'text-gray-700'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-gray-800 p-4 border-b border-gray-700">
          <Text className="text-2xl font-bold text-gray-100 mb-2">
            Your Statistics
          </Text>
          <Text className="text-gray-600">
            Track your fitness journey progress
          </Text>
        </View>

        {/* Period Selection */}
        <View className="flex-row justify-center gap-5 py-4 bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <PeriodButton period="week" label="This Week" />
          <PeriodButton period="month" label="This Month" />
          <PeriodButton period="year" label="All Time" />
        </View>

        {/* Overall Stats */}
        <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Overall Statistics
            </Text>
          </View>
          <View className="p-4">
            <View className="flex-row flex-wrap justify-between">
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-blue-600">
                    {mockStats.totalWorkouts}
                  </Text>
                  <Text className="text-sm text-gray-600">Total Workouts</Text>
                </View>
              </View>
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-teal-400">
                    {formatDuration(mockStats.totalDuration)}
                  </Text>
                  <Text className="text-sm text-gray-600">Total Time</Text>
                </View>
              </View>
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-indigo-400">
                    {mockStats.totalSets}
                  </Text>
                  <Text className="text-sm text-gray-600">Total Sets</Text>
                </View>
              </View>
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-amber-400">
                    {mockStats.totalReps.toLocaleString()}
                  </Text>
                  <Text className="text-sm text-gray-600">Total Reps</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Streak Stats */}
        <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Workout Streaks
            </Text>
          </View>
          <View className="p-4">
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-3xl font-bold text-red-500">
                  🔥
                </Text>
                <Text className="text-2xl font-bold text-gray-900 mt-1">
                  {mockStats.currentStreak}
                </Text>
                <Text className="text-sm text-gray-600">Current Streak</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-yellow-500">
                  🏆
                </Text>
                <Text className="text-2xl font-bold text-gray-900 mt-1">
                  {mockStats.longestStreak}
                </Text>
                <Text className="text-sm text-gray-600">Longest Streak</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-blue-500">
                  ⏱️
                </Text>
                <Text className="text-2xl font-bold text-gray-900 mt-1">
                  {mockStats.averageWorkoutDuration}
                </Text>
                <Text className="text-sm text-gray-600">Avg Duration</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Comparison */}
        <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Weekly Progress
            </Text>
          </View>
          <View className="p-4">
            <View className="flex-row justify-between mb-4">
              <Text className="text-sm text-gray-600 font-medium">This Week</Text>
              <Text className="text-sm text-gray-600 font-medium">Last Week</Text>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Workouts</Text>
                <View className="flex-row space-x-8">
                  <Text className="text-lg font-semibold text-green-600">
                    {mockStats.thisWeek.workouts}
                  </Text>
                  <Text className="text-lg font-semibold text-gray-400">
                    {mockStats.lastWeek.workouts}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Duration</Text>
                <View className="flex-row space-x-8">
                  <Text className="text-lg font-semibold text-green-600">
                    {formatDuration(mockStats.thisWeek.duration)}
                  </Text>
                  <Text className="text-lg font-semibold text-gray-400">
                    {formatDuration(mockStats.lastWeek.duration)}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Sets</Text>
                <View className="flex-row space-x-8">
                  <Text className="text-lg font-semibold text-green-600">
                    {mockStats.thisWeek.sets}
                  </Text>
                  <Text className="text-lg font-semibold text-gray-400">
                    {mockStats.lastWeek.sets}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Volume</Text>
                <View className="flex-row space-x-8">
                  <Text className="text-lg font-semibold text-green-600">
                    {mockStats.thisWeek.volume}kg
                  </Text>
                  <Text className="text-lg font-semibold text-gray-400">
                    {mockStats.lastWeek.volume}kg
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Favorite Exercises */}
        <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Most Performed Exercises
            </Text>
          </View>
          <View className="p-4">
            {mockStats.favoriteExercises.map((exercise, index) => (
              <View key={index} className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center mr-3">
                    <Text className="text-white text-xs font-bold">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="text-gray-900 font-medium">
                    {exercise.name}
                  </Text>
                </View>
                <Text className="text-gray-600">
                  {exercise.count} times
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Chart Placeholder */}
        <View className="bg-white mx-4 mt-4 mb-8 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Progress Over Time
            </Text>
          </View>
          <View className="p-4">
            <View className="h-48 bg-gray-100 rounded-lg items-center justify-center">
              <Text className="text-gray-500 text-lg">📊</Text>
              <Text className="text-gray-500 mt-2">Charts coming soon!</Text>
              <Text className="text-sm text-gray-400 text-center mt-1">
                Workout frequency, volume, and strength progression charts
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatsScreen;