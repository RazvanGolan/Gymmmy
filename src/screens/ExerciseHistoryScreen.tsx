import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type ExerciseHistoryRouteProp = RouteProp<RootStackParamList, 'ExerciseHistory'>;

interface HistoryEntry {
  date: string;
  sets: {
    reps: number;
    weight: number;
    volume: number; // reps * weight
  }[];
  personalRecord?: {
    type: 'weight' | 'reps' | 'volume';
    value: number;
    isNew: boolean;
  };
}

// Mock data
const mockHistory: HistoryEntry[] = [
  {
    date: '2024-10-10',
    sets: [
      { reps: 8, weight: 80, volume: 640 },
      { reps: 8, weight: 80, volume: 640 },
      { reps: 6, weight: 80, volume: 480 },
    ],
    personalRecord: { type: 'weight', value: 80, isNew: true },
  },
  {
    date: '2024-10-08',
    sets: [
      { reps: 8, weight: 75, volume: 600 },
      { reps: 8, weight: 75, volume: 600 },
      { reps: 8, weight: 75, volume: 600 },
    ],
  },
  {
    date: '2024-10-05',
    sets: [
      { reps: 10, weight: 70, volume: 700 },
      { reps: 10, weight: 70, volume: 700 },
      { reps: 8, weight: 70, volume: 560 },
    ],
  },
  {
    date: '2024-10-03',
    sets: [
      { reps: 10, weight: 70, volume: 700 },
      { reps: 9, weight: 70, volume: 630 },
      { reps: 8, weight: 70, volume: 560 },
    ],
  },
];

const ExerciseHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ExerciseHistoryRouteProp>();
  const { exerciseId, exerciseName } = route.params;

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  const totalSessions = mockHistory.length;
  const totalSets = mockHistory.reduce((sum, entry) => sum + entry.sets.length, 0);
  const totalVolume = mockHistory.reduce((sum, entry) => 
    sum + entry.sets.reduce((entrySum, set) => entrySum + set.volume, 0), 0
  );
  const maxWeight = Math.max(...mockHistory.flatMap(entry => entry.sets.map(set => set.weight)));
  const averageVolume = Math.round(totalVolume / totalSessions);

  const renderHistoryEntry = ({ item }: { item: HistoryEntry }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          {new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </Text>
        {item.personalRecord && (
          <View className="bg-yellow-100 px-2 py-1 rounded">
            <Text className="text-yellow-800 text-xs font-medium">
              PR: {item.personalRecord.value}{item.personalRecord.type === 'weight' ? 'kg' : item.personalRecord.type === 'reps' ? ' reps' : 'kg total'}
            </Text>
          </View>
        )}
      </View>

      {/* Sets Table Header */}
      <View className="flex-row items-center mb-2 pb-2 border-b border-gray-100">
        <Text className="w-12 text-xs text-gray-500 text-center">Set</Text>
        <Text className="flex-1 text-xs text-gray-500 text-center">Reps</Text>
        <Text className="flex-1 text-xs text-gray-500 text-center">Weight</Text>
        <Text className="flex-1 text-xs text-gray-500 text-center">Volume</Text>
      </View>

      {/* Sets */}
      {item.sets.map((set, index) => (
        <View key={index} className="flex-row items-center mb-1">
          <Text className="w-12 text-center text-gray-600">{index + 1}</Text>
          <Text className="flex-1 text-center text-gray-900">{set.reps}</Text>
          <Text className="flex-1 text-center text-gray-900">{set.weight}kg</Text>
          <Text className="flex-1 text-center text-gray-600">{set.volume}</Text>
        </View>
      ))}

      {/* Session Summary */}
      <View className="mt-3 pt-3 border-t border-gray-100">
        <Text className="text-sm text-gray-600">
          Total Volume: {item.sets.reduce((sum, set) => sum + set.volume, 0)}kg • {item.sets.length} sets
        </Text>
      </View>
    </View>
  );

  const PeriodButton = ({ period, label }: { period: typeof selectedPeriod, label: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedPeriod(period)}
      className={`px-4 py-2 rounded-lg ${
        selectedPeriod === period 
          ? 'bg-blue-600' 
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Exercise Header */}
        <View className="bg-white p-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {exerciseName}
          </Text>
          <Text className="text-gray-600">
            Track your progress over time
          </Text>
        </View>

        {/* Period Selection */}
        <View className="flex-row justify-center space-x-2 py-4 bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <PeriodButton period="week" label="Week" />
          <PeriodButton period="month" label="Month" />
          <PeriodButton period="all" label="All Time" />
        </View>

        {/* Statistics */}
        <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Statistics
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {totalSessions}
              </Text>
              <Text className="text-sm text-gray-600">Sessions</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {totalSets}
              </Text>
              <Text className="text-sm text-gray-600">Total Sets</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-600">
                {maxWeight}
              </Text>
              <Text className="text-sm text-gray-600">Max Weight</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">
                {averageVolume}
              </Text>
              <Text className="text-sm text-gray-600">Avg Volume</Text>
            </View>
          </View>
        </View>

        {/* Progress Chart Placeholder */}
        <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Progress Chart
          </Text>
          <View className="h-32 bg-gray-100 rounded-lg items-center justify-center">
            <Text className="text-gray-500">Chart coming soon!</Text>
            <Text className="text-sm text-gray-400 mt-1">
              Weight progression over time
            </Text>
          </View>
        </View>

        {/* History List */}
        <View className="px-4 mt-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Workout History
          </Text>
          <FlatList
            data={mockHistory}
            renderItem={renderHistoryEntry}
            keyExtractor={(item) => item.date}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Empty State */}
        {mockHistory.length === 0 && (
          <View className="bg-white mx-4 mt-4 rounded-lg p-8 shadow-sm items-center">
            <Text className="text-gray-500 text-center mb-2">
              No history yet
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Start doing this exercise to track your progress
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExerciseHistoryScreen;