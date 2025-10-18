import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkoutsData } from '../hooks/useWorkoutsData';
import { useTemplatesData } from '../hooks/useTemplatesData';
import { format, subDays, subWeeks, subMonths, isWithinInterval } from 'date-fns';
import { Workout } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const StatsScreen: React.FC = () => {
  const { workouts, getWorkoutStreak } = useWorkoutsData();
  const { templates } = useTemplatesData();
  const { isDark } = useTheme();
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
          ? 'bg-primary' 
          : (isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary')
      }`}
    >
      <Text className={`font-medium ${
        selectedPeriod === period 
          ? (isDark ? 'text-gray-900' : 'text-white') 
          : (isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary')
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className={`p-4 border-b ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'}`}>
          <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Your Statistics
          </Text>
          <Text className={`${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Track your fitness journey progress
          </Text>
        </View>

        {/* Period Selection */}
        <View className={`flex-row justify-center gap-5 py-4 mx-4 mt-4 rounded-lg shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
          <PeriodButton period="week" label="This Week" />
          <PeriodButton period="month" label="This Month" />
          <PeriodButton period="year" label="All Time" />
        </View>

        {/* Overall Stats */}
        <View className={`mx-4 mt-4 rounded-lg shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
          <View className={`p-4 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Overall Statistics
            </Text>
          </View>
          <View className="p-4">
            <View className="flex-row flex-wrap justify-between">
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {stats.totalWorkouts}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Total Workouts</Text>
                </View>
              </View>
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {formatDuration(stats.totalDuration)}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Total Time</Text>
                </View>
              </View>
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {stats.totalSets}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Total Sets</Text>
                </View>
              </View>
              <View className="w-1/2 mb-4">
                <View className="items-center">
                  <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {stats.totalReps.toLocaleString()}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Total Reps</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Streak Stats */}
        <View className={`mx-4 mt-4 rounded-lg shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
          <View className={`p-4 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Workout Streaks
            </Text>
          </View>
          <View className="p-4">
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-3xl font-bold text-red-500">
                  🔥
                </Text>
                <Text className={`text-2xl font-bold mt-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  {stats.currentStreak}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Current Streak</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-yellow-500">
                  🏆
                </Text>
                <Text className={`text-2xl font-bold mt-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  {stats.longestStreak}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Longest Streak</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-slate-500">
                  ⏱️
                </Text>
                <Text className={`text-2xl font-bold mt-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  {stats.averageWorkoutDuration}m
                </Text>
                <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Avg Duration</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Comparison */}
        <View className={`mx-4 mt-4 rounded-lg shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
          <View className={`p-4 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Weekly Progress
            </Text>
          </View>
          <View className="p-4">
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Text className={`${isDark ? 'text-dark-text' : 'text-light-text'} flex-1`}>Workouts</Text>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-green-600">
                    {stats.thisWeek.workouts}
                  </Text>
                </View>
                <View className="w-20 items-center">
                  <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                    {stats.lastWeek.workouts}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Text className={`${isDark ? 'text-dark-text' : 'text-light-text'} flex-1`}>Duration</Text>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-green-600">
                    {formatDuration(stats.thisWeek.duration)}
                  </Text>
                </View>
                <View className="w-20 items-center">
                  <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                    {formatDuration(stats.lastWeek.duration)}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Text className={`${isDark ? 'text-dark-text' : 'text-light-text'} flex-1`}>Sets</Text>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-green-600">
                    {stats.thisWeek.sets}
                  </Text>
                </View>
                <View className="w-20 items-center">
                  <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                    {stats.lastWeek.sets}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Text className={`${isDark ? 'text-dark-text' : 'text-light-text'} flex-1`}>Volume</Text>
                <View className="w-20 items-center">
                  <Text className="text-lg font-semibold text-green-600">
                    {stats.thisWeek.volume}kg
                  </Text>
                </View>
                <View className="w-20 items-center">
                  <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                    {stats.lastWeek.volume}kg
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Legend */}
            <View className={`flex-row justify-center gap-6 mt-4 pt-3 border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-600 rounded mr-2" />
                <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>This Week</Text>
              </View>
              <View className="flex-row items-center">
                <View className={`w-3 h-3 rounded mr-2 ${isDark ? 'bg-dark-text-muted' : 'bg-light-text-muted'}`} />
                <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Last Week</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Favorite Exercises */}
        <View className={`mx-4 mt-4 rounded-lg shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
          <View className={`p-4 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Most Performed Exercises
            </Text>
          </View>
          <View className="p-4">
            {stats.favoriteExercises.length > 0 ? (
              stats.favoriteExercises.map((exercise, index) => (
                <View key={index} className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'}`}>
                      <Text className={`text-xs font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text className={`${isDark ? 'text-dark-text' : 'text-light-text'} font-medium`}>
                      {exercise.name}
                    </Text>
                  </View>
                  <Text className={`${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                    {exercise.count} times
                  </Text>
                </View>
              ))
            ) : (
              <View className="items-center py-8">
                <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'} mb-2`}>No exercise data yet</Text>
                <Text className={`text-sm text-center ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
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