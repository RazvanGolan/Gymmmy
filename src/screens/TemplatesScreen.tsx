import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTemplatesData } from '../hooks/useTemplatesData';
import { useTemplateActions } from '../hooks/useTemplateActions';
import { format } from 'date-fns';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const TemplatesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { templates, isLoading, error } = useTemplatesData();
  const { loadTemplates, deleteTemplate, incrementTemplateUsage } = useTemplateActions();

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreateTemplate = () => {
    navigation.navigate('CreateTemplate', {});
  };

  const handleEditTemplate = (templateId: string) => {
    navigation.navigate('CreateTemplate', { templateId });
  };

  const handleUseTemplate = async (templateId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    navigation.navigate('WorkoutSession', { 
      date: today, 
      templateId 
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteTemplate(templateId)
        },
      ]
    );
  };

  const renderTemplate = ({ item }: { item: typeof templates[0] }) => (
    <View className="bg-gray-800 rounded-lg p-4 mb-3 shadow-sm border border-gray-600">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-100 mb-1">
            {item.name}
          </Text>
          {item.description && (
            <Text className="text-gray-300 text-sm mb-2">
              {item.description}
            </Text>
          )}
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500 mr-4">
              {item.exercises?.length || 0} exercises
            </Text>
            <Text className="text-xs text-gray-500">
              Used {item.usageCount || 0} times
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteTemplate(item.id)}
          className="p-2"
        >
          <Text className="text-red-400 text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
      
      <View className="flex-row mt-3 pt-3 border-t border-gray-700">
        <TouchableOpacity
          onPress={() => handleUseTemplate(item.id)}
          className="flex-1 bg-slate-600 rounded-lg py-3 mr-2"
        >
          <Text className="text-white text-center font-medium">
            Start Workout
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleEditTemplate(item.id)}
          className="flex-1 bg-gray-600 rounded-lg py-3 ml-2"
        >
          <Text className="text-gray-200 text-center font-medium">
            Customize
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-100">
            Workout Templates
          </Text>
          <TouchableOpacity
            onPress={handleCreateTemplate}
            className="bg-slate-600 rounded-lg px-4 py-2"
          >
            <Text className="text-white font-medium">New Template</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Quick Stats */}
        <View className="bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-100 mb-3">
            Your Templates
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-100">
                {templates.length}
              </Text>
              <Text className="text-sm text-gray-600">Templates</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-100">
                {templates.reduce((sum: number, t) => sum + (t.usageCount || 0), 0)}
              </Text>
              <Text className="text-sm text-gray-600">Total Uses</Text>
            </View>
          </View>
        </View>

        {/* Templates List */}
        {isLoading ? (
          <View className="bg-gray-800 rounded-lg p-8 items-center">
            <Text className="text-gray-300 text-lg">Loading templates...</Text>
          </View>
        ) : error ? (
          <View className="bg-gray-800 rounded-lg p-8 items-center">
            <Text className="text-red-400 text-lg mb-2">Error loading templates</Text>
            <Text className="text-gray-400 text-sm text-center">{error}</Text>
            <TouchableOpacity
              onPress={loadTemplates}
              className="bg-slate-600 rounded-lg px-4 py-2 mt-4"
            >
              <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : templates.length === 0 ? (
          <View className="bg-gray-800 rounded-lg p-8 items-center">
            <Text className="text-gray-300 text-lg mb-2">No templates yet</Text>
            <Text className="text-gray-400 text-sm text-center mb-4">
              Create your first workout template to get started
            </Text>
            <TouchableOpacity
              onPress={handleCreateTemplate}
              className="bg-slate-600 rounded-lg px-6 py-3"
            >
              <Text className="text-white font-medium">Create First Template</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={templates}
            renderItem={renderTemplate}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TemplatesScreen;