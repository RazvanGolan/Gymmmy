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
import { useTheme } from '../contexts/ThemeContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;


const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { workouts, getWorkoutStreak } = useWorkoutsData();
  const { exercises } = useExercisesData();
  const { isDark } = useTheme();
  
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
        <View className={`h-48 rounded-lg items-center justify-center ${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'}`}>
          <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'} text-lg`}>📊</Text>
          <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'} mt-2`}>No weight data yet</Text>
          <Text className={`text-sm text-center mt-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
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
      <View className={`h-48 rounded-lg p-4 ${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'}`}>
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
                    className="bg-primary rounded-t-sm w-3"
                    style={{ height: `${height}%`, minHeight: 8 }}
                  />
                  <Text className={`text-xs mt-1 transform -rotate-45 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                    {format(parseISO(entry.date), 'MM/dd')}
                  </Text>
                </View>
              );
            })}
          </View>
          
          {/* Y-axis labels */}
          <View className="absolute left-0 top-0 bottom-0 w-12 justify-between">
            <Text className={`text-xs ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>{displayMax.toFixed(0)}kg</Text>
            <Text className={`text-xs ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>{((displayMax + displayMin) / 2).toFixed(0)}kg</Text>
            <Text className={`text-xs ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>{displayMin.toFixed(0)}kg</Text>
          </View>
        </View>
        
        {/* Legend */}
        <View className="flex-row justify-center mt-2 space-x-4">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-primary rounded mr-1" />
            <Text className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Weight</Text>
          </View>
          {targetWeight && (
            <View className="flex-row items-center">
              <View className="w-3 h-0.5 bg-yellow-400 mr-1" />
              <Text className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Target</Text>
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
          ? 'border-b-2 border-primary' 
          : (isDark ? 'border-b border-dark-border' : 'border-b border-light-border')
      }`}
    >
      <Text className={`text-center font-medium ${
        selectedTab === tab 
          ? (isDark ? 'text-dark-text' : 'text-light-text') 
          : (isDark ? 'text-dark-text-muted' : 'text-light-text-muted')
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View className="p-4">
      {/* Quick Stats */}
      <View className={`rounded-lg p-4 shadow-sm mb-4 ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
        <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Quick Stats
        </Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              {completedWorkouts.length}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Total Workouts</Text>
          </View>
          <View className="items-center">
            <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              {currentStreak}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Day Streak</Text>
          </View>
          <View className="items-center">
            <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              {thisWeekWorkouts}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>This Week</Text>
          </View>
          <View className="items-center">
            <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              {thisMonthWorkouts}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>This Month</Text>
          </View>
        </View>
      </View>

      {/* Recent Progress */}
      <View className={`rounded-lg p-4 shadow-sm mb-4 ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
        <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Recent Progress
        </Text>
        
        {progressEntries.filter(entry => entry.type === 'weight' && entry.weight).length > 0 && (
          <View className="mb-4">
            <Text className={`text-sm mb-2 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Latest Weight</Text>
            <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              {progressEntries.filter(entry => entry.type === 'weight' && entry.weight)[0]?.weight}kg
            </Text>
            <Text className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              {format(parseISO(progressEntries.filter(entry => entry.type === 'weight' && entry.weight)[0]?.date || ''), 'MMM d, yyyy')}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          onPress={() => setShowAddWeight(true)}
          disabled={isLoading}
          className={`rounded-lg py-3 ${
            isLoading ? (isDark ? 'bg-dark-border-secondary' : 'bg-light-border-secondary') : 'bg-primary'
          }`}
        >
          <Text className={`text-center font-medium ${isDark ? 'text-gray-900' : 'text-white'}`}>
            {isLoading ? 'Loading...' : 'Log Weight'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Charts */}
      <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
        <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Weight Progress
        </Text>
        {renderProgressChart()}
      </View>
    </View>
  );

  const renderBodyProgress = () => (
    <View className="p-4">
      {/* Weight History */}
      <View className={`rounded-lg p-4 shadow-sm mb-4 ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Weight History
          </Text>
          <TouchableOpacity 
            onPress={() => setShowAddWeight(true)}
            className="bg-primary rounded-lg px-3 py-2"
          >
            <Text className={`text-sm font-medium ${isDark ? 'text-gray-900' : 'text-white'}`}>Add Entry</Text>
          </TouchableOpacity>
        </View>

        {progressEntries.filter(entry => entry.type === 'weight' && entry.weight).length > 0 ? (
          progressEntries
            .filter(entry => entry.type === 'weight' && entry.weight)
            .map((entry, index, filteredEntries) => (
              <View key={entry.id} className={`flex-row justify-between items-center py-3 border-b last:border-b-0 ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                <View>
                  <Text className={`font-medium ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                    {entry.weight}kg
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
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
                        : (isDark ? 'text-dark-text-muted' : 'text-light-text-muted')
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
            <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'} mb-2`}>No weight entries yet</Text>
            <Text className={`text-sm text-center ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              Start tracking your weight to see progress
            </Text>
          </View>
        )}
      </View>

      {/* Body Measurements */}
      <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
        <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Body Measurements
        </Text>
        <View className="items-center py-8">
          <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'} mb-2`}>No measurements yet</Text>
          <TouchableOpacity className={`rounded-lg px-4 py-2 bg-primary`}>
            <Text className={`${isDark ? 'text-gray-900' : 'text-white'} font-medium`}>Add Measurements</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStrengthProgress = () => (
    <View className="p-4">
      {/* Exercise Progress */}
      <View className={`rounded-lg p-4 shadow-sm mb-4 ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
        <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Strength Progress
        </Text>
        
        <View className="items-center py-8">
          <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'} mb-2`}>Strength tracking coming soon</Text>
          <Text className={`text-sm text-center ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Complete workouts to see your strength progress
          </Text>
        </View>
      </View>

      {/* Personal Records */}
      <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
        <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Personal Records
        </Text>
        <View className="items-center py-8">
          <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'} mb-2`}>No personal records yet</Text>
          <Text className={`text-sm text-center ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Complete workouts to track your personal bests
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`} edges={['top']}>
      {/* Header */}
      <View className={`${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'} border-b`}>
        <View className="px-4 py-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Progress
          </Text>
          <Text className={`${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
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
          <View className={`rounded-lg p-6 mx-4 w-full max-w-sm ${isDark ? 'bg-dark-surface' : 'bg-light-background'}`}>
            <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Log Weight
            </Text>
            <TextInput
              value={newWeight}
              onChangeText={setNewWeight}
              placeholder="Enter weight (kg)"
              keyboardType="numeric"
              className={`border rounded-lg p-3 mb-4 ${isDark ? 'border-dark-border text-dark-text bg-dark-surface-secondary' : 'border-light-border text-light-text bg-light-surface-secondary'}`}
            />
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setShowAddWeight(false)}
                className={`flex-1 rounded-lg py-3 ${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'}`}
              >
                <Text className={`text-center font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddWeight}
                disabled={isLoading}
                className={`flex-1 rounded-lg py-3 ${
                  isLoading ? (isDark ? 'bg-dark-border-secondary' : 'bg-light-border-secondary') : 'bg-primary'
                }`}
              >
                <Text className={`text-center font-medium ${isDark ? 'text-gray-900' : 'text-white'}`}>
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
          <View className={`rounded-lg p-6 mx-4 w-full max-w-sm ${isDark ? 'bg-dark-surface' : 'bg-light-background'}`}>
            <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Add Body Measurements
            </Text>
            <ScrollView className="max-h-80">
              {Object.entries(newMeasurements).map(([key, value]) => (
                <View key={key} className="mb-3">
                  <Text className={`${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'} text-sm mb-1`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} (cm)
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={(text) => setNewMeasurements(prev => ({ ...prev, [key]: text }))}
                    placeholder={`Enter ${key} measurement`}
                    keyboardType="numeric"
                    className={`border rounded-lg p-3 ${isDark ? 'border-dark-border text-dark-text bg-dark-surface-secondary' : 'border-light-border text-light-text bg-light-surface-secondary'}`}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              ))}
            </ScrollView>
            <View className="flex-row gap-4 mt-4">
              <TouchableOpacity
                onPress={() => setShowAddMeasurements(false)}
                className={`flex-1 rounded-lg py-3 ${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'}`}
              >
                <Text className={`text-center font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddMeasurements}
                disabled={isLoading}
                className={`flex-1 rounded-lg py-3 ${
                  isLoading ? (isDark ? 'bg-dark-border-secondary' : 'bg-light-border-secondary') : 'bg-primary'
                }`}
              >
                <Text className={`text-center font-medium ${isDark ? 'text-gray-900' : 'text-white'}`}>
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