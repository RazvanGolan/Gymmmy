import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface QuickActionProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
}

const QuickActionButton: React.FC<QuickActionProps> = ({ title, description, icon, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 p-4 bg-white rounded-lg shadow-sm border border-gray-100 mr-2 last:mr-0"
    >
      <Text className="text-2xl mb-2">{icon}</Text>
      <Text className="text-base font-semibold text-gray-800 mb-1">{title}</Text>
      <Text className="text-sm text-gray-600">{description}</Text>
    </TouchableOpacity>
  );
};

const QuickActions: React.FC = () => {
  const handleStartWorkout = () => {
    console.log('Start Workout pressed');
  };

  const handleViewProgress = () => {
    console.log('View Progress pressed');
  };

  const handleLogWeight = () => {
    console.log('Log Weight pressed');
  };

  return (
    <View className="mt-6">
      <Text className="text-lg font-semibold text-gray-800 mb-3 px-1">
        Quick Actions
      </Text>
      <View className="flex-row">
        <QuickActionButton
          title="Start Workout"
          description="Begin your training session"
          icon="🏋️"
          onPress={handleStartWorkout}
        />
        <QuickActionButton
          title="View Progress"
          description="Check your stats"
          icon="📊"
          onPress={handleViewProgress}
        />
      </View>
      <View className="flex-row mt-3">
        <QuickActionButton
          title="Log Weight"
          description="Track your body weight"
          icon="⚖️"
          onPress={handleLogWeight}
        />
        <TouchableOpacity className="flex-1 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ml-2 items-center justify-center">
          <Text className="text-gray-500 text-sm">More coming soon...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickActions;