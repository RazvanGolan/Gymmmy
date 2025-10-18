import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutsData } from '../hooks/useWorkoutsData';
import { useTemplatesData } from '../hooks/useTemplatesData';
import { format, subDays, subWeeks, subMonths, isWithinInterval } from 'date-fns';
import { Workout } from '../types';

const StatsScreen: React.FC = () => {
  const { workouts, getWorkoutStreak } = useWorkoutsData();
  const { templates } = useTemplatesData();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    totalSets: 0,
    totalReps: 0,
    totalWeight: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageWorkoutDuration: 0,
    thisWeek: { workouts: 0, duration: 0, sets: 0, volume: 0 },
    lastWeek: { workouts: 0, duration: 0, sets: 0, volume: 0 },
    favoriteExercises: [] as { name: string; count: number }[]
  });

  useEffect(() => {
    calculateStats();
  }, [workouts]);

  const calculateStats = () => {
    const completedWorkouts = workouts.filter(w => w.completed);
    
    // Calculate basic stats
    const totalWorkouts = completedWorkouts.length;
    const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalSets = completedWorkouts.reduce((sum, w) => sum + w.sets.length, 0);
    const totalReps = completedWorkouts.reduce((sum, w) => 
      sum + w.sets.reduce((setSum, set) => setSum + set.reps, 0), 0
    );
    const totalWeight = completedWorkouts.reduce((sum, w) => 
      sum + w.sets.reduce((setSum, set) => setSum + (set.weight || 0) * set.reps, 0), 0
    );
    
    const averageWorkoutDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
    const currentStreak = getWorkoutStreak();
    
    // Calculate weekly stats
    const now = new Date();
    const weekStart = subDays(now, 7);
    const lastWeekStart = subDays(now, 14);
    
    const thisWeekWorkouts = completedWorkouts.filter(w => 
      isWithinInterval(new Date(w.date), { start: weekStart, end: now })
    );
    const lastWeekWorkouts = completedWorkouts.filter(w => 
      isWithinInterval(new Date(w.date), { start: lastWeekStart, end: weekStart })
    );
    
    const thisWeekStats = {
      workouts: thisWeekWorkouts.length,
      duration: thisWeekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      sets: thisWeekWorkouts.reduce((sum, w) => sum + w.sets.length, 0),
      volume: Math.round(thisWeekWorkouts.reduce((sum, w) => 
        sum + w.sets.reduce((setSum, set) => setSum + (set.weight || 0) * set.reps, 0), 0
      ))
    };
    
    const lastWeekStats = {
      workouts: lastWeekWorkouts.length,
      duration: lastWeekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      sets: lastWeekWorkouts.reduce((sum, w) => sum + w.sets.length, 0),
      volume: Math.round(lastWeekWorkouts.reduce((sum, w) => 
        sum + w.sets.reduce((setSum, set) => setSum + (set.weight || 0) * set.reps, 0), 0
      ))
    };
    
    // Calculate favorite exercises
    const exerciseCount: { [key: string]: number } = {};
    completedWorkouts.forEach(workout => {
      workout.sets.forEach(set => {
        exerciseCount[set.exerciseName] = (exerciseCount[set.exerciseName] || 0) + 1;
      });
    });
    
    const favoriteExercises = Object.entries(exerciseCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));
    
    // Calculate longest streak (simplified - just use current for now)
    const longestStreak = currentStreak; // Could be enhanced to track historical streaks
    
    setStats({
      totalWorkouts,
      totalDuration,
      totalSets,
      totalReps,
      totalWeight: Math.round(totalWeight),
      currentStreak,
      longestStreak,
      averageWorkoutDuration,
      thisWeek: thisWeekStats,
      lastWeek: lastWeekStats,
      favoriteExercises
    });
  };

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
          : 'bg-gray-700'
      }`}
    >
      <Text className={`font-medium ${
        selectedPeriod === period 
          ? 'text-white' 
          : 'text-gray-300'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-gray-800 p-4 border-b border-gray-700">
          <Text className="text-2xl font-bold text-gray-100 mb-2">
            Your Statistics
          </Text>
          <Text className="text-gray-300">
            Track your fitness journey progress
          </Text>
        </View>

        {/* Period Selection */}
        <View className="flex-row justify-center gap-5 py-4 bg-gray-800 mx-4 mt-4 rounded-lg shadow-sm">
          <PeriodButton period="week" label="This Week" />
          <PeriodButton period="month" label="This Month" />
          <PeriodButton period="year" label="All Time" />
        </View>

        {/* Overall Stats */}
        <View className="bg-gray-800 mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-700">
            <Text className="text-lg font-semibold text-gray-100">
              Overall Statistics
            </Text>
          </View>
          <View className="p-4">
            <View className="flex-row flex-wrap justify-between">
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-100">
                    {stats.totalWorkouts}
                  </Text>
                  <Text className="text-sm text-gray-300">Total Workouts</Text>
                </View>
              </View>
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-100">
                    {formatDuration(stats.totalDuration)}
                  </Text>
                  <Text className="text-sm text-gray-300">Total Time</Text>
                </View>
              </View>
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-100">
                    {stats.totalSets}
                  </Text>
                  <Text className="text-sm text-gray-300">Total Sets</Text>
                </View>
              </View>
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-100">
                    {stats.totalReps.toLocaleString()}
                  </Text>
                  <Text className="text-sm text-gray-300">Total Reps</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Streak Stats */}
        <View className="bg-gray-800 mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-700">
            <Text className="text-lg font-semibold text-gray-100">
              Workout Streaks
            </Text>
          </View>
          <View className="p-4">
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-3xl font-bold text-red-500">
                  🔥
                </Text>
                <Text className="text-2xl font-bold text-gray-100 mt-1">
                  {stats.currentStreak}
                </Text>
                <Text className="text-sm text-gray-300">Current Streak</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-yellow-500">
                  🏆
                </Text>
                <Text className="text-2xl font-bold text-gray-100 mt-1">
                  {stats.longestStreak}
                </Text>
                <Text className="text-sm text-gray-300">Longest Streak</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-slate-500">
                  ⏱️
                </Text>
                <Text className="text-2xl font-bold text-gray-100 mt-1">
                  {stats.averageWorkoutDuration}m
                </Text>
                <Text className="text-sm text-gray-300">Avg Duration</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Comparison */}
        <View className="bg-gray-800 mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-700">
            <Text className="text-lg font-semibold text-gray-100">
              Weekly Progress
            </Text>
          </View>
          <View className="p-4">
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Text className="text-gray-200 flex-1">Workouts</Text>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-green-600">
                    {stats.thisWeek.workouts}
                  </Text>
                </View>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-gray-400">
                    {stats.lastWeek.workouts}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Text className="text-gray-200 flex-1">Duration</Text>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-green-600">
                    {formatDuration(stats.thisWeek.duration)}
                  </Text>
                </View>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-gray-400">
                    {formatDuration(stats.lastWeek.duration)}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Text className="text-gray-200 flex-1">Sets</Text>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-green-600">
                    {stats.thisWeek.sets}
                  </Text>
                </View>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-gray-400">
                    {stats.lastWeek.sets}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Text className="text-gray-200 flex-1">Volume</Text>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-green-600">
                    {stats.thisWeek.volume}kg
                  </Text>
                </View>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-gray-400">
                    {stats.lastWeek.volume}kg
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Legend */}
            <View className="flex-row justify-center gap-6 mt-4 pt-3 border-t border-gray-700">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-600 rounded mr-2" />
                <Text className="text-sm text-gray-300">This Week</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-gray-400 rounded mr-2" />
                <Text className="text-sm text-gray-300">Last Week</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Favorite Exercises */}
        <View className="bg-gray-800 mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-700">
            <Text className="text-lg font-semibold text-gray-100">
              Most Performed Exercises
            </Text>
          </View>
          <View className="p-4">
            {stats.favoriteExercises.length > 0 ? (
              stats.favoriteExercises.map((exercise, index) => (
                <View key={index} className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-slate-600 rounded-full items-center justify-center mr-3">
                      <Text className="text-white text-xs font-bold">
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="text-gray-100 font-medium">
                      {exercise.name}
                    </Text>
                  </View>
                  <Text className="text-gray-300">
                    {exercise.count} times
                  </Text>
                </View>
              ))
            ) : (
              <View className="items-center py-8">
                <Text className="text-gray-500 mb-2">No exercise data yet</Text>
                <Text className="text-sm text-gray-400 text-center">
                  Complete workouts to see your most performed exercises
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StatsScreen;