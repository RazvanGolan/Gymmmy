import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, parseISO, startOfWeek, addWeeks, eachDayOfInterval, endOfWeek } from 'date-fns';
import { RootStackParamList, RootTabParamList } from '../navigation/AppNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useWorkoutStore } from '../stores/workoutStore';
import { useTemplateStore } from '../stores/templateStore';

type NavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { workouts, getWorkoutStreak, getCalendarData } = useWorkoutStore();
  const { templates, loadDefaultExercises } = useTemplateStore();
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    // Load default exercises on app start
    loadDefaultExercises();
  }, [loadDefaultExercises]);

  const streak = getWorkoutStreak();
  
  const twoWeekStart = currentWeekStart;
  const twoWeekEnd = endOfWeek(addWeeks(currentWeekStart, 1), { weekStartsOn: 1 });
  const twoWeekDays = eachDayOfInterval({ start: twoWeekStart, end: twoWeekEnd });
  
  const calendarData = twoWeekDays.map(day => {
    const dateString = format(day, 'yyyy-MM-dd');
    const dayWorkouts = workouts.filter(w => w.date === dateString);
    const hasWorkout = dayWorkouts.length > 0;
    const completedWorkout = dayWorkouts.find(w => w.completed);

    return {
      date: dateString,
      hasWorkout,
      workoutId: completedWorkout?.id,
      workoutName: completedWorkout?.name,
      duration: completedWorkout?.duration,
      completed: !!completedWorkout,
    };
  });
  
  const markedDates = calendarData.reduce((acc, day) => {
    if (day.hasWorkout && day.completed) {
      acc[day.date] = {
        marked: true,
        dotColor: '#f59e0b', 
        selectedDotColor: '#ffffff',
      };
    }
    return acc;
  }, {} as { [date: string]: any });

  if (selectedDate) {
    if (!markedDates[selectedDate]) {
      markedDates[selectedDate] = {};
    }
    markedDates[selectedDate].selected = true;
    markedDates[selectedDate].selectedColor = '#3b82f6';
  }

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(selectedDate === day.dateString ? null : day.dateString);
  };

  const handleStartWorkout = (templateId?: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    navigation.navigate('WorkoutSession', { 
      date: selectedDate || today,
      templateId,
    });
  };

  const handleViewStats = () => {
    navigation.navigate('Stats');
  };

  const handleWorkoutClick = (workoutId: string) => {
    (navigation as any).navigate('Workout');
  };

  const selectedDateWorkouts = selectedDate ? workouts.filter(w => w.date === selectedDate) : [];
  const recentWorkouts = workouts
    .filter(w => w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const totalWorkouts = workouts.filter(w => w.completed).length;
  const thisWeekWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo && w.completed;
  }).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-6 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Welcome back!
              </Text>
              <Text className="text-gray-600 mt-1">
                Ready for your next workout?
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleViewStats}
              className="bg-blue-600 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-medium">Stats</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View className="flex-row justify-between mt-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {totalWorkouts}
              </Text>
              <Text className="text-sm text-gray-600">Total Workouts</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {streak}
              </Text>
              <Text className="text-sm text-gray-600">Day Streak</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-600">
                {thisWeekWorkouts}
              </Text>
              <Text className="text-sm text-gray-600">This Week</Text>
            </View>
          </View>
        </View>

        {/* Calendar - 2 Week View */}
        <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-semibold text-gray-900">
                  Workout Calendar
                </Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}
                  className="p-2 mr-3 bg-gray-100 rounded-lg"
                >
                  <Text className="text-gray-600 font-size-500 font-bold">&lt;</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  <Text className="text-gray-600 font-bold">&gt;</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View className="p-4">
            {/* Week days header */}
            <View className="flex-row justify-between mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <Text key={day} className="text-xs font-medium text-gray-500 text-center w-10">
                  {day}
                </Text>
              ))}
            </View>
            
            {/* First week */}
            <View className="flex-row justify-between mb-4">
              {twoWeekDays.slice(0, 7).map(day => {
                const dateString = format(day, 'yyyy-MM-dd');
                const dayData = calendarData.find(d => d.date === dateString);
                const isSelected = selectedDate === dateString;
                const isToday = dateString === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <TouchableOpacity
                    key={dateString}
                    onPress={() => handleDateSelect({ dateString } as DateData)}
                    className={`w-10 h-10 rounded-lg items-center justify-center ${
                      isSelected ? 'bg-blue-600' : isToday ? 'bg-blue-100' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-base font-medium ${
                      isSelected ? 'text-white' : isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </Text>
                    {dayData?.completed && (
                      <View className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-0.5" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Second week */}
            <View className="flex-row justify-between">
              {twoWeekDays.slice(7, 14).map(day => {
                const dateString = format(day, 'yyyy-MM-dd');
                const dayData = calendarData.find(d => d.date === dateString);
                const isSelected = selectedDate === dateString;
                const isToday = dateString === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <TouchableOpacity
                    key={dateString}
                    onPress={() => handleDateSelect({ dateString } as DateData)}
                    className={`w-10 h-10 rounded-lg items-center justify-center ${
                      isSelected ? 'bg-blue-600' : isToday ? 'bg-blue-100' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-base font-medium ${
                      isSelected ? 'text-white' : isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </Text>
                    {dayData?.completed && (
                      <View className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-0.5" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Selected Date Actions - Only show when date is selected */}
        {selectedDate && (
          <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-900">
                {format(parseISO(selectedDate), 'EEEE, MMMM d')}
              </Text>
            </View>
            
            {selectedDateWorkouts.length > 0 ? (
              <View className="p-4">
                {selectedDateWorkouts.map(workout => (
                  <TouchableOpacity
                    key={workout.id}
                    onPress={() => handleWorkoutClick(workout.id)}
                    className="mb-3 last:mb-0 p-3 bg-gray-50 rounded-lg"
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">
                          {workout.name || 'Workout'}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {workout.sets.length} exercises • {workout.duration || 'Not finished'}
                          {workout.duration && ' min'}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className={`px-2 py-1 rounded mr-2 ${
                          workout.completed ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          <Text className={`text-xs font-medium ${
                            workout.completed ? 'text-green-800' : 'text-yellow-800'
                          }`}>
                            {workout.completed ? 'Completed' : 'In Progress'}
                          </Text>
                        </View>
                        <Text className="text-gray-400 text-sm">›</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="p-4">
                <Text className="text-gray-600 text-center mb-4">
                  No workout for this day
                </Text>
                <View className="space-y-2">
                  <TouchableOpacity
                    onPress={() => handleStartWorkout()}
                    className="bg-blue-600 rounded-lg py-3"
                  >
                    <Text className="text-white text-center font-medium">
                      Start Workout
                    </Text>
                  </TouchableOpacity>
                  
                  {templates.length > 0 && (
                    <View>
                      <Text className="text-sm text-gray-600 text-center my-2">
                        Or choose a template:
                      </Text>
                      {templates.slice(0, 2).map(template => (
                        <TouchableOpacity
                          key={template.id}
                          onPress={() => handleStartWorkout(template.id)}
                          className="bg-gray-100 rounded-lg py-2 px-3 mb-2"
                        >
                          <Text className="text-gray-800 text-center font-medium">
                            {template.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-900">
                Recent Workouts
              </Text>
            </View>
            <View className="p-4">
              {recentWorkouts.map(workout => (
                <View key={workout.id} className="flex-row justify-between items-center mb-3 last:mb-0">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {workout.name || 'Workout'}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {format(parseISO(workout.date), 'MMM d')} • {workout.sets.length} exercises
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">
                    {workout.duration}min
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;