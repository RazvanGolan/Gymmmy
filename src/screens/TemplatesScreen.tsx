import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// Mock data - will be replaced with real data from state management
const mockTemplates = [
  {
    id: '1',
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps workout',
    exercises: 6,
    estimatedDuration: 60,
    usageCount: 12,
  },
  {
    id: '2',
    name: 'Pull Day',
    description: 'Back and biceps focused routine',
    exercises: 5,
    estimatedDuration: 55,
    usageCount: 8,
  },
  {
    id: '3',
    name: 'Leg Day',
    description: 'Complete lower body workout',
    exercises: 7,
    estimatedDuration: 70,
    usageCount: 10,
  },
];

type NavigationProp = StackNavigationProp<RootStackParamList>;

const TemplatesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreateTemplate = () => {
    navigation.navigate('CreateTemplate', {});
  };

  const handleEditTemplate = (templateId: string) => {
    navigation.navigate('CreateTemplate', { templateId });
  };

  const handleUseTemplate = (templateId: string) => {
    const today = new Date().toISOString().split('T')[0];
    navigation.navigate('WorkoutSession', { 
      date: today, 
      templateId 
    });
  };

  const renderTemplate = ({ item }: { item: typeof mockTemplates[0] }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {item.name}
          </Text>
          <Text className="text-gray-600 text-sm mb-2">
            {item.description}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500 mr-4">
              {item.exercises} exercises
            </Text>
            <Text className="text-xs text-gray-500 mr-4">
              ~{item.estimatedDuration} min
            </Text>
            <Text className="text-xs text-gray-500">
              Used {item.usageCount} times
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleEditTemplate(item.id)}
          className="p-2"
        >
          <Text className="text-blue-600 text-sm">Edit</Text>
        </TouchableOpacity>
      </View>
      
      <View className="flex-row mt-3 pt-3 border-t border-gray-100">
        <TouchableOpacity
          onPress={() => handleUseTemplate(item.id)}
          className="flex-1 bg-blue-600 rounded-lg py-3 mr-2"
        >
          <Text className="text-white text-center font-medium">
            Start Workout
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleEditTemplate(item.id)}
          className="flex-1 bg-gray-100 rounded-lg py-3 ml-2"
        >
          <Text className="text-gray-700 text-center font-medium">
            Customize
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">
            Workout Templates
          </Text>
          <TouchableOpacity
            onPress={handleCreateTemplate}
            className="bg-blue-600 rounded-lg px-4 py-2"
          >
            <Text className="text-white font-medium">New Template</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Quick Stats */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Your Templates
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {mockTemplates.length}
              </Text>
              <Text className="text-sm text-gray-600">Templates</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {mockTemplates.reduce((sum, t) => sum + t.usageCount, 0)}
              </Text>
              <Text className="text-sm text-gray-600">Uses</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-600">
                {Math.round(mockTemplates.reduce((sum, t) => sum + t.estimatedDuration, 0) / mockTemplates.length)}
              </Text>
              <Text className="text-sm text-gray-600">Avg Min</Text>
            </View>
          </View>
        </View>

        {/* Templates List */}
        <FlatList
          data={mockTemplates}
          renderItem={renderTemplate}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />

        {/* Popular Templates Suggestion */}
        <View className="bg-white rounded-lg p-4 mt-4 mb-8 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Need Inspiration?
          </Text>
          <Text className="text-gray-600 mb-3">
            Browse popular workout templates from the community
          </Text>
          <TouchableOpacity className="bg-gray-100 rounded-lg py-3">
            <Text className="text-gray-700 text-center font-medium">
              Browse Popular Templates
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TemplatesScreen;