import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, parseISO, subDays, subWeeks, subMonths } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useWorkoutsData } from '../hooks/useWorkoutsData';
import { useExercisesData } from '../hooks/useExercisesData';
import { databaseService } from '../services/database';
import { ProgressEntry } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;


const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { workouts, getWorkoutStreak } = useWorkoutsData();
  const { exercises } = useExercisesData();
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'body' | 'strength'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | '3months'>('month');
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showAddMeasurements, setShowAddMeasurements] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newMeasurements, setNewMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    bicep: '',
    thigh: '',
    neck: ''
  });
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  
  // Load progress entries on component mount
  React.useEffect(() => {
    loadProgressEntries();
    loadTargetWeight();
  }, []);
  
  const loadProgressEntries = async () => {
    try {
      setIsLoading(true);
      const result = await databaseService.getProgressEntries();
      if (result.success && result.data) {
        setProgressEntries(result.data);
      }
    } catch (error) {
      console.error('Failed to load progress entries:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadTargetWeight = async () => {
    try {
      const result = await databaseService.getUserSettings();
      if (result.success && result.data) {
        setTargetWeight(result.data.targetWeight);
      }
    } catch (error) {
      console.error('Failed to load target weight:', error);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight.trim()) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }
    
    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await databaseService.createProgressEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'weight',
        weight: weightValue,
      });
      
      if (result.success && result.data) {
        setProgressEntries(prev => [result.data!, ...prev]);
        Alert.alert('Success', 'Weight entry added!');
        setNewWeight('');
        setShowAddWeight(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to save weight entry');
      }
    } catch (error) {
      console.error('Failed to save weight entry:', error);
      Alert.alert('Error', 'Failed to save weight entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeasurements = async () => {
    const measurements: any = {};
    let hasValidMeasurement = false;
    
    // Convert string inputs to numbers, only include non-empty values
    Object.entries(newMeasurements).forEach(([key, value]) => {
      if (value.trim()) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
          measurements[key] = numValue;
          hasValidMeasurement = true;
        }
      }
    });
    
    if (!hasValidMeasurement) {
      Alert.alert('Error', 'Please enter at least one valid measurement');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await databaseService.createProgressEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'body_measurement',
        measurements,
      });
      
      if (result.success && result.data) {
        setProgressEntries(prev => [result.data!, ...prev]);
        Alert.alert('Success', 'Measurements added!');
        setNewMeasurements({
          chest: '',
          waist: '',
          hips: '',
          bicep: '',
          thigh: '',
          neck: ''
        });
        setShowAddMeasurements(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to save measurements');
      }
    } catch (error) {
      console.error('Failed to save measurements:', error);
      Alert.alert('Error', 'Failed to save measurements');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressChart = () => {
    const weightEntries = progressEntries
      .filter(entry => entry.type === 'weight' && entry.weight)
      .slice(-10)
      .reverse();
    
    if (weightEntries.length === 0) {
      return (
        <View className="h-48 bg-gray-700 rounded-lg items-center justify-center">
          <Text className="text-gray-500 text-lg">📊</Text>
          <Text className="text-gray-500 mt-2">No weight data yet</Text>
          <Text className="text-sm text-gray-400 text-center mt-1">
            Add weight entries to see your progress chart
          </Text>
        </View>
      );
    }
    
    const weights = weightEntries.map(entry => entry.weight!);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight || 1;
    
    // Include target weight in range calculation if it exists
    const displayMin = targetWeight ? Math.min(minWeight, targetWeight) - 2 : minWeight - 2;
    const displayMax = targetWeight ? Math.max(maxWeight, targetWeight) + 2 : maxWeight + 2;
    const displayRange = displayMax - displayMin;
    
    return (
      <View className="h-48 bg-gray-700 rounded-lg p-4">
        <View className="flex-1 relative">
          {/* Target line */}
          {targetWeight && (
            <View 
              className="absolute left-0 right-0 border-t border-dashed border-yellow-400"
              style={{
                top: `${((displayMax - targetWeight) / displayRange) * 100}%`
              }}
            >
              <Text className="absolute -top-4 right-0 text-xs text-yellow-400">
                Target: {targetWeight}kg
              </Text>
            </View>
          )}
          
          {/* Weight line */}
          <View className="flex-1 flex-row items-end justify-between px-2">
            {weightEntries.map((entry, index) => {
              const height = ((entry.weight! - displayMin) / displayRange) * 100;
              return (
                <View key={entry.id} className="items-center flex-1">
                  <View 
                    className="bg-blue-400 rounded-t-sm w-3"
                    style={{ height: `${height}%`, minHeight: 8 }}
                  />
                  <Text className="text-xs text-gray-400 mt-1 transform -rotate-45">
                    {format(parseISO(entry.date), 'MM/dd')}
                  </Text>
                </View>
              );
            })}
          </View>
          
          {/* Y-axis labels */}
          <View className="absolute left-0 top-0 bottom-0 w-12 justify-between">
            <Text className="text-xs text-gray-400">{displayMax.toFixed(0)}kg</Text>
            <Text className="text-xs text-gray-400">{((displayMax + displayMin) / 2).toFixed(0)}kg</Text>
            <Text className="text-xs text-gray-400">{displayMin.toFixed(0)}kg</Text>
          </View>
        </View>
        
        {/* Legend */}
        <View className="flex-row justify-center mt-2 space-x-4">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-blue-400 rounded mr-1" />
            <Text className="text-xs text-gray-400">Weight</Text>
          </View>
          {targetWeight && (
            <View className="flex-row items-center">
              <View className="w-3 h-0.5 bg-yellow-400 mr-1" />
              <Text className="text-xs text-gray-400">Target</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

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

  const currentStreak = getWorkoutStreak();

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
        
        {progressEntries.filter(entry => entry.type === 'weight' && entry.weight).length > 0 && (
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-2">Latest Weight</Text>
            <Text className="text-2xl font-bold text-gray-100">
              {progressEntries.filter(entry => entry.type === 'weight' && entry.weight)[0]?.weight}kg
            </Text>
            <Text className="text-sm text-gray-500">
              {format(parseISO(progressEntries.filter(entry => entry.type === 'weight' && entry.weight)[0]?.date || ''), 'MMM d, yyyy')}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          onPress={() => setShowAddWeight(true)}
          disabled={isLoading}
          className={`rounded-lg py-3 ${
            isLoading ? 'bg-gray-500' : 'bg-gray-600'
          }`}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Loading...' : 'Log Weight'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Charts */}
      <View className="bg-gray-800 rounded-lg p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-100 mb-4">
          Weight Progress
        </Text>
        {renderProgressChart()}
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

        {progressEntries.filter(entry => entry.type === 'weight' && entry.weight).length > 0 ? (
          progressEntries
            .filter(entry => entry.type === 'weight' && entry.weight)
            .map((entry, index, filteredEntries) => (
              <View key={entry.id} className="flex-row justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
                <View>
                  <Text className="font-medium text-gray-300">
                    {entry.weight}kg
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {format(parseISO(entry.date), 'MMM d, yyyy')}
                  </Text>
                </View>
                {index < filteredEntries.length - 1 && (
                  <View className="items-end">
                    <Text className={`text-sm font-medium ${
                      entry.weight! > filteredEntries[index + 1].weight! 
                        ? 'text-red-600' 
                        : entry.weight! < filteredEntries[index + 1].weight!
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}>
                      {entry.weight! > filteredEntries[index + 1].weight! ? '+' : ''}
                      {(entry.weight! - filteredEntries[index + 1].weight!).toFixed(1)}kg
                    </Text>
                  </View>
                )}
              </View>
            ))
        ) : (
          <View className="items-center py-8">
            <Text className="text-gray-500 mb-2">No weight entries yet</Text>
            <Text className="text-sm text-gray-400 text-center">
              Start tracking your weight to see progress
            </Text>
          </View>
        )}
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
        
        <View className="items-center py-8">
          <Text className="text-gray-500 mb-2">Strength tracking coming soon</Text>
          <Text className="text-sm text-gray-400 text-center">
            Complete workouts to see your strength progress
          </Text>
        </View>
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
                disabled={isLoading}
                className={`flex-1 rounded-lg py-3 ${
                  isLoading ? 'bg-gray-500' : 'bg-gray-600'
                }`}
              >
                <Text className="text-white text-center font-medium">
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* Add Measurements Modal */}
      {showAddMeasurements && (
        <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center">
          <View className="bg-gray-800 rounded-lg p-6 mx-4 w-full max-w-sm">
            <Text className="text-lg font-semibold text-gray-100 mb-4">
              Add Body Measurements
            </Text>
            <ScrollView className="max-h-80">
              {Object.entries(newMeasurements).map(([key, value]) => (
                <View key={key} className="mb-3">
                  <Text className="text-gray-300 text-sm mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)} (cm)
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={(text) => setNewMeasurements(prev => ({ ...prev, [key]: text }))}
                    placeholder={`Enter ${key} measurement`}
                    keyboardType="numeric"
                    className="border border-gray-600 rounded-lg p-3 text-gray-200 bg-gray-700"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              ))}
            </ScrollView>
            <View className="flex-row gap-4 mt-4">
              <TouchableOpacity
                onPress={() => setShowAddMeasurements(false)}
                className="flex-1 bg-gray-600 rounded-lg py-3"
              >
                <Text className="text-gray-200 text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddMeasurements}
                disabled={isLoading}
                className={`flex-1 rounded-lg py-3 ${
                  isLoading ? 'bg-gray-500' : 'bg-slate-600'
                }`}
              >
                <Text className="text-white text-center font-medium">
                  {isLoading ? 'Saving...' : 'Save'}
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