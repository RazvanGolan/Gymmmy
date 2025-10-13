import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Mock user data - will be replaced with real data from state management
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  weight: 75,
  totalWorkouts: 45,
  currentStreak: 7,
  joinDate: '2024-01-15',
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [shareProgress, setShareProgress] = useState(false);

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export feature coming soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // TODO: Implement logout logic
          console.log('Logout confirmed');
        }},
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-gray-800 px-4 py-6 border-b border-gray-700">
          <View className="items-center">
            <View className="w-20 h-20 bg-slate-600 rounded-full items-center justify-center mb-3">
              <Text className="text-white text-2xl font-bold">
                {mockUser.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {mockUser.name}
            </Text>
            <Text className="text-gray-600">
              {mockUser.email}
            </Text>
            <TouchableOpacity
              onPress={handleEditProfile}
              className="mt-3 bg-slate-600 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-medium">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Your Stats
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {mockUser.totalWorkouts}
              </Text>
              <Text className="text-sm text-gray-600">Workouts</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {mockUser.currentStreak}
              </Text>
              <Text className="text-sm text-gray-600">Day Streak</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-600">
                {Math.floor((Date.now() - new Date(mockUser.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
              </Text>
              <Text className="text-sm text-gray-600">Days Active</Text>
            </View>
          </View>
        </View>

        {/* Personal Info Section */}
        <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Personal Information
            </Text>
          </View>
          <View className="p-4 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Weight</Text>
              <Text className="text-gray-900 font-medium">{mockUser.weight} kg</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">
              Settings
            </Text>
          </View>
          <View className="p-4 space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Push Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#9ca3af'}
              />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Share Progress</Text>
              <Switch
                value={shareProgress}
                onValueChange={setShareProgress}
                trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
                thumbColor={shareProgress ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View className="mx-4 mt-4 space-y-3 mb-8">
          <TouchableOpacity
            onPress={handleExportData}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <Text className="text-gray-700 font-medium">Export My Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-gray-700 font-medium">Help & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-gray-700 font-medium">Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <Text className="text-red-600 font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;