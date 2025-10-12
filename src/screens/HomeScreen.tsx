import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useWorkoutStore } from '../stores/workoutStore';
import { useTemplateStore } from '../stores/templateStore';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { workouts, getWorkoutStreak, getCalendarData } = useWorkoutStore();
  const { templates, loadDefaultExercises } = useTemplateStore();
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    // Load default exercises on app start
    loadDefaultExercises();
  }, [loadDefaultExercises]);

  const streak = getWorkoutStreak();
  const calendarData = getCalendarData(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  
  const markedDates = calendarData.reduce((acc, day) => {
    if (day.hasWorkout && day.completed) {
      acc[day.date] = {
        marked: true,
        dotColor: '#10b981',
        selectedDotColor: '#10b981',
      };
    }
    return acc;
  }, {} as { [date: string]: any });

  if (selectedDate && !markedDates[selectedDate]) {
    markedDates[selectedDate] = {};
  }
  if (selectedDate) {
    markedDates[selectedDate].selected = true;
    markedDates[selectedDate].selectedColor = '#3b82f6';
  }

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleStartWorkout = (templateId?: string) => {
    navigation.navigate('WorkoutSession', { 
      date: selectedDate,
      templateId,
    });
  };

  const handleViewStats = () => {
    navigation.navigate('Stats');
  };

  const selectedDateWorkouts = workouts.filter(w => w.date === selectedDate);
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

        {/* Calendar */}
        <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Workout Calendar
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              🟢 Completed • Tap date to add workout
            </Text>
          </View>
          <Calendar
            current={format(currentMonth, 'yyyy-MM-dd')}
            onDayPress={handleDateSelect}
            onMonthChange={(month) => setCurrentMonth(new Date(month.year, month.month - 1))}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#6b7280',
              selectedDayBackgroundColor: '#3b82f6',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#3b82f6',
              dayTextColor: '#1f2937',
              textDisabledColor: '#d1d5db',
              dotColor: '#10b981',
              selectedDotColor: '#ffffff',
              arrowColor: '#3b82f6',
              monthTextColor: '#1f2937',
              indicatorColor: '#3b82f6',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Selected Date Actions */}
        <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              {format(parseISO(selectedDate), 'EEEE, MMMM d')}
            </Text>
          </View>
          
          {selectedDateWorkouts.length > 0 ? (
            <View className="p-4">
              {selectedDateWorkouts.map(workout => (
                <View key={workout.id} className="mb-3 last:mb-0">
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
                    <View className={`px-2 py-1 rounded ${
                      workout.completed ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        workout.completed ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        {workout.completed ? 'Completed' : 'In Progress'}
                      </Text>
                    </View>
                  </View>
                </View>
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
                    Start Free Workout
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