import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProgressScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Your Progress
        </Text>
        
        <View className="bg-white p-6 rounded-xl shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Weekly Summary
          </Text>
          <Text className="text-gray-600">
            Track your weekly workout frequency, calories burned, and personal records.
          </Text>
        </View>

        <View className="bg-white p-6 rounded-xl shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Strength Progress
          </Text>
          <Text className="text-gray-600">
            Monitor your strength gains across different exercises and muscle groups.
          </Text>
        </View>

        <View className="bg-white p-6 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Body Composition
          </Text>
          <Text className="text-gray-600">
            Track changes in weight, body fat percentage, and muscle mass over time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgressScreen;