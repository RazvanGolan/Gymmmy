import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutsData } from '../hooks/useWorkoutsData';
import { useTemplatesData } from '../hooks/useTemplatesData';
import { useTheme } from '../contexts/ThemeContext';
import { databaseService } from '../services/database';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { workouts, getWorkoutStreak } = useWorkoutsData();
  const { templates } = useTemplatesData();
  const { toggleTheme, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
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
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`} edges={['top']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className={`px-4 py-6 border-b ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'}`}>
          <View className="items-center">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-3 bg-primary">
              <Text className={`text-3xl font-bold ${isDark ? 'text-gray-900' : 'text-white'}`}>
                💪
              </Text>
            </View>
            <Text className={`text-xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Gymmy
            </Text>
            <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
              Your Personal Fitness Tracker
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View className={`mx-4 mt-4 rounded-lg p-4 shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Your Progress
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                {workouts.filter(w => w.completed).length}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>Workouts</Text>
            </View>
            <View className="items-center">
              <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                {templates.length}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>Templates</Text>
            </View>
            <View className="items-center">
              <Text className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                {getWorkoutStreak()}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View className={`mx-4 mt-4 rounded-lg p-4 shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Settings
          </Text>
          
          <View className={`flex-row justify-between items-center py-3 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <Text className={`font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: isDark ? '#374151' : '#e2e8f0', true: '#10d6bf' }}
              thumbColor={notificationsEnabled ? '#ffffff' : (isDark ? '#9ca3af' : '#64748b')}
            />
          </View>
          
          <View className={`flex-row justify-between items-center py-3 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            <Text className={`font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: isDark ? '#374151' : '#e2e8f0', true: '#10d6bf' }}
              thumbColor={isDark ? '#ffffff' : '#64748b'}
            />
          </View>
          
          <TouchableOpacity 
            onPress={handleSetTargetWeight}
            className="flex-row justify-between items-center py-3"
          >
            <View>
              <Text className={`font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Target Weight</Text>
              <Text className={`text-sm ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                {targetWeight ? `${targetWeight}kg` : 'Not set'}
              </Text>
            </View>
            <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management Section */}
        <View className={`mx-4 mt-4 rounded-lg p-4 shadow-sm ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Data Management
          </Text>
          
          <TouchableOpacity 
            onPress={handleExportData}
            className={`flex-row justify-between items-center py-3 border-b ${
              isDark ? 'border-dark-border' : 'border-light-border'
            }`}
          >
            <Text className={`font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Export Data</Text>
            <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleImportData}
            className={`flex-row justify-between items-center py-3 border-b ${
              isDark ? 'border-dark-border' : 'border-light-border'
            }`}
          >
            <Text className={`font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Import Data</Text>
            <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleResetDatabase}
            className="flex-row justify-between items-center py-3"
          >
            <Text className="font-medium text-red-400">Reset All Data</Text>
            <Text className="text-red-400">⚠️</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View className={`mx-4 mt-4 rounded-lg p-4 shadow-sm mb-8 ${isDark ? 'bg-dark-surface' : 'bg-light-surface'}`}>
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            About
          </Text>
          
          <View className="py-2">
            <Text className={`text-sm ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>Version</Text>
            <Text className={`font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>1.0.0</Text>
          </View>
          
          <TouchableOpacity className={`mt-4 py-3 border-t ${
            isDark ? 'border-dark-border' : 'border-light-border'
          }`}>
            <Text className={`font-medium text-center ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Help & Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Target Weight Modal */}
      {showTargetWeightModal && (
        <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center">
          <View className={`rounded-lg p-6 mx-4 w-full max-w-sm ${isDark ? 'bg-dark-surface' : 'bg-light-background'}`}>
            <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Set Target Weight
            </Text>
            <TextInput
              value={newTargetWeight}
              onChangeText={setNewTargetWeight}
              placeholder="Enter target weight (kg)"
              keyboardType="numeric"
              className={`border rounded-lg p-3 mb-4 ${
                isDark 
                  ? 'border-dark-border text-dark-text bg-dark-surface-secondary' 
                  : 'border-light-border text-light-text bg-light-surface-secondary'
              }`}
              placeholderTextColor={isDark ? '#9ca3af' : '#64748b'}
            />
            <Text className={`text-sm mb-4 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
              Leave empty to remove target weight
            </Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setShowTargetWeightModal(false)}
                className={`flex-1 rounded-lg py-3 ${
                  isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'
                }`}
              >
                <Text className={`text-center font-medium ${
                  isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveTargetWeight}
                className="flex-1 rounded-lg py-3 bg-primary"
              >
                <Text className={`text-center font-medium ${
                  isDark ? 'text-gray-900' : 'text-white'
                }`}>
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