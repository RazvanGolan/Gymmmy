import React from 'react';
import { View, Text } from 'react-native';

const Header: React.FC = () => {
  return (
    <View className="px-4 py-3 bg-white border-b border-gray-200">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Gymmy</Text>
          <Text className="text-sm text-gray-600">Your fitness companion</Text>
        </View>
        <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
          <Text className="text-white font-semibold text-lg">G</Text>
        </View>
      </View>
    </View>
  );
};

export default Header;