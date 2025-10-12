import React from 'react';
import { View, Text } from 'react-native';

const WelcomeCard: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View className="mt-4 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
      <Text className="text-white text-lg font-medium mb-1">
        Welcome back!
      </Text>
      <Text className="text-blue-100 text-sm mb-4">
        {currentDate}
      </Text>
      <Text className="text-white text-base">
        Ready to crush your fitness goals today? 💪
      </Text>
    </View>
  );
};

export default WelcomeCard;