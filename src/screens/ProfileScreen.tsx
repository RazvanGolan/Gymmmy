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
  const [shareProgress, setShareProgress] = useState(false);

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
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
        <View className="bg-gray-800 mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-100 mb-4">
            Your Stats
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-100">
                {mockUser.totalWorkouts}
              </Text>
              <Text className="text-sm text-gray-100">Workouts</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-100">
                {mockUser.currentStreak}
              </Text>
              <Text className="text-sm text-gray-100">Day Streak</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-100">
                {Math.floor((Date.now() - new Date(mockUser.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
              </Text>
              <Text className="text-sm text-gray-100">Days Active</Text>
            </View>
          </View>
        </View>

        {/* Personal Info Section */}
        <View className="bg-gray-800 mx-4 mt-4 rounded-lg shadow-sm">
          <View className="p-4 border-b border-gray-700">
            <Text className="text-lg font-semibold text-gray-100">
              Personal Information
            </Text>
          </View>
          <View className="p-4 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Weight</Text>
              <Text className="text-gray-100 font-medium">{mockUser.weight} kg</Text>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View className="mx-4 mt-4 space-y-3 mb-8">          
          <TouchableOpacity className="bg-gray-800 rounded-lg p-4 shadow-sm mb-3">
            <Text className="text-gray-100 font-medium">Help & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-gray-800 rounded-lg p-4 shadow-sm mb-3">
            <Text className="text-gray-100 font-medium">Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <Text className="text-red-600 font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;