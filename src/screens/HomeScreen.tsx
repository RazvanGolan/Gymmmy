import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import WelcomeCard from '../components/WelcomeCard';
import QuickActions from '../components/QuickActions';

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header />
      <ScrollView className="flex-1 px-4">
        <WelcomeCard />
        <QuickActions />
        
        {/* Placeholder for more content */}
        <View className="mt-6 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Recent Workouts
          </Text>
          <Text className="text-gray-600">
            Your recent workouts will appear here once you start tracking them.
          </Text>
        </View>
        
        <View className="mt-4 p-4 bg-white rounded-lg shadow-sm mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Progress Overview
          </Text>
          <Text className="text-gray-600">
            Track your fitness progress with detailed analytics and insights.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;