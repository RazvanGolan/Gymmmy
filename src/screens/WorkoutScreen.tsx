import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorkoutScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Workout Session
        </Text>
        <View className="bg-white p-6 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Ready to Start Your Workout?
          </Text>
          <Text className="text-gray-600">
            This screen will contain your workout tracking interface, exercise lists, timer, and progress tracking.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WorkoutScreen;