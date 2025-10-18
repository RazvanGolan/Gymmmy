import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutsData } from '../hooks/useWorkoutsData';
import { useTemplatesData } from '../hooks/useTemplatesData';
import { databaseService } from '../services/database';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { workouts, getWorkoutStreak } = useWorkoutsData();
  const { templates } = useTemplatesData();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [showTargetWeightModal, setShowTargetWeightModal] = useState(false);
  const [newTargetWeight, setNewTargetWeight] = useState('');

  // Load user settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const result = await databaseService.getUserSettings();
      if (result.success && result.data) {
        setTargetWeight(result.data.targetWeight);
        setNotificationsEnabled(result.data.notificationsEnabled);
        setDarkModeEnabled(result.data.darkModeEnabled);
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  };

  const handleResetDatabase = async () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your workouts, templates, and progress. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.debugResetDatabase();
              Alert.alert('Success', 'All data has been reset successfully.');
            } catch (error) {
              console.error('Error resetting database:', error);
              Alert.alert('Error', 'Failed to reset database.');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export functionality coming soon!');
  };

  const handleImportData = () => {
    Alert.alert('Import Data', 'Data import functionality coming soon!');
  };

  const handleSetTargetWeight = () => {
    setNewTargetWeight(targetWeight?.toString() || '');
    setShowTargetWeightModal(true);
  };

  const handleSaveTargetWeight = async () => {
    const weight = newTargetWeight.trim() ? parseFloat(newTargetWeight) : null;
    
    if (newTargetWeight.trim() && (isNaN(weight!) || weight! <= 0)) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }
    
    try {
      const result = await databaseService.updateUserSettings({ targetWeight: weight });
      if (result.success) {
        setTargetWeight(weight);
        setShowTargetWeightModal(false);
        Alert.alert('Success', weight ? 'Target weight updated!' : 'Target weight removed!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save target weight');
      }
    } catch (error) {
      console.error('Failed to save target weight:', error);
      Alert.alert('Error', 'Failed to save target weight');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-gray-800 px-4 py-6 border-b border-gray-700">
          <View className="items-center">
            <View className="w-20 h-20 bg-slate-600 rounded-full items-center justify-center mb-3">
              <Text className="text-white text-3xl font-bold">
                💪
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-100">
              Gymmy
            </Text>
            <Text className="text-gray-400">
              Your Personal Fitness Tracker
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View className="bg-gray-800 mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-100 mb-4">
            Your Progress
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-100">
                {workouts.filter(w => w.completed).length}
              </Text>
              <Text className="text-sm text-gray-400">Workouts</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-100">
                {templates.length}
              </Text>
              <Text className="text-sm text-gray-400">Templates</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-100">
                {getWorkoutStreak()}
              </Text>
              <Text className="text-sm text-gray-400">Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View className="bg-gray-800 mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-100 mb-4">
            Settings
          </Text>
          
          <View className="flex-row justify-between items-center py-3 border-b border-gray-700">
            <Text className="text-gray-200 font-medium">Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#374151', true: '#6366f1' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#9ca3af'}
            />
          </View>
          
          <View className="flex-row justify-between items-center py-3 border-b border-gray-700">
            <Text className="text-gray-200 font-medium">Dark Mode</Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#374151', true: '#6366f1' }}
              thumbColor={darkModeEnabled ? '#ffffff' : '#9ca3af'}
            />
          </View>
          
          <TouchableOpacity 
            onPress={handleSetTargetWeight}
            className="flex-row justify-between items-center py-3"
          >
            <View>
              <Text className="text-gray-200 font-medium">Target Weight</Text>
              <Text className="text-gray-500 text-sm">
                {targetWeight ? `${targetWeight}kg` : 'Not set'}
              </Text>
            </View>
            <Text className="text-gray-500">→</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management Section */}
        <View className="bg-gray-800 mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-100 mb-4">
            Data Management
          </Text>
          
          <TouchableOpacity 
            onPress={handleExportData}
            className="flex-row justify-between items-center py-3 border-b border-gray-700"
          >
            <Text className="text-gray-200 font-medium">Export Data</Text>
            <Text className="text-gray-500">→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleImportData}
            className="flex-row justify-between items-center py-3 border-b border-gray-700"
          >
            <Text className="text-gray-200 font-medium">Import Data</Text>
            <Text className="text-gray-500">→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleResetDatabase}
            className="flex-row justify-between items-center py-3"
          >
            <Text className="text-red-400 font-medium">Reset All Data</Text>
            <Text className="text-red-400">⚠️</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View className="bg-gray-800 mx-4 mt-4 rounded-lg p-4 shadow-sm mb-8">
          <Text className="text-lg font-semibold text-gray-100 mb-4">
            About
          </Text>
          
          <View className="py-2">
            <Text className="text-gray-400 text-sm">Version</Text>
            <Text className="text-gray-200 font-medium">1.0.0</Text>
          </View>
          
          <TouchableOpacity className="mt-4 py-3 border-t border-gray-700">
            <Text className="text-gray-300 font-medium text-center">Help & Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Target Weight Modal */}
      {showTargetWeightModal && (
        <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center">
          <View className="bg-gray-800 rounded-lg p-6 mx-4 w-full max-w-sm">
            <Text className="text-lg font-semibold text-gray-100 mb-4">
              Set Target Weight
            </Text>
            <TextInput
              value={newTargetWeight}
              onChangeText={setNewTargetWeight}
              placeholder="Enter target weight (kg)"
              keyboardType="numeric"
              className="border border-gray-600 rounded-lg p-3 mb-4 text-gray-200 bg-gray-700"
              placeholderTextColor="#9ca3af"
            />
            <Text className="text-gray-400 text-sm mb-4">
              Leave empty to remove target weight
            </Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setShowTargetWeightModal(false)}
                className="flex-1 bg-gray-600 rounded-lg py-3"
              >
                <Text className="text-gray-200 text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveTargetWeight}
                className="flex-1 bg-slate-600 rounded-lg py-3"
              >
                <Text className="text-white text-center font-medium">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;