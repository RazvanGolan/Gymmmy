import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { exerciseService, Exercise, categories } from '../services/exerciseService';

type AddExerciseRouteProp = RouteProp<RootStackParamList, 'AddExercise'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const AddExerciseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddExerciseRouteProp>();
  const { onSelectExercise } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customExerciseCategory, setCustomExerciseCategory] = useState('Chest');

  const filteredExercises = exerciseService.searchExercises(searchQuery, selectedCategory);

  const handleSelectExercise = (exercise: Exercise) => {
    const newExercise = {
      id: Date.now().toString(), 
      name: exercise.name,
      sets: [
        {
          id: `${Date.now()}-1`,
          last: '8x12kg',
          reps: '8',
          weight: '0'
        }
      ]
    };
    
    onSelectExercise(newExercise);
    navigation.goBack();
  };

  const createCustomExercise = () => {
    if (!customExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    if (exerciseService.exerciseExists(customExerciseName)) {
      Alert.alert('Error', 'An exercise with this name already exists');
      return;
    }

    const newExercise = exerciseService.addCustomExercise(customExerciseName, customExerciseCategory);
    setShowCustomModal(false);
    setCustomExerciseName('');
    setCustomExerciseCategory('Chest');
    
    handleSelectExercise(newExercise);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg p-3">
          <Icon name="search" size={20} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            className="flex-1 ml-2 text-gray-900"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row flex-wrap gap-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
              style={{ minWidth: '22%' }}
            >
              <Text
                className={`font-medium text-center ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Exercise List */}
      <ScrollView className="flex-1">
        <View className="p-4">
          {filteredExercises.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center">
              <Icon name="search-off" size={48} color="#9ca3af" />
              <Text className="text-gray-500 text-lg font-medium mt-4">
                No exercises found
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Try adjusting your search or category filter
              </Text>
            </View>
          ) : (
            filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => handleSelectExercise(exercise)}
                className="bg-white rounded-lg p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">
                      {exercise.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Icon name="category" size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {exercise.category}
                      </Text>
                    </View>
                  </View>
                  <Icon name="add-circle" size={24} color="#3b82f6" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Custom Exercise Button */}
      {/* Custom Exercise Modal */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-black/20 justify-center px-4"
        >
          <View className="bg-white rounded-lg p-6 max-w-sm mx-auto w-full">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Create Custom Exercise
            </Text>
            
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Exercise Name
            </Text>
            <TextInput
              value={customExerciseName}
              onChangeText={setCustomExerciseName}
              placeholder="Enter exercise name"
              className="border border-gray-300 rounded-lg p-3 mb-4"
            />
            
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {categories.filter(cat => cat !== 'All').map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setCustomExerciseCategory(category)}
                  className={`px-3 py-2 rounded-full ${
                    customExerciseCategory === category
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                  style={{ minWidth: '22%' }}
                >
                  <Text
                    className={`font-medium text-center text-xs ${
                      customExerciseCategory === category
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View className="flex-row space-x-3 justify-between gap-5">
              <TouchableOpacity
                onPress={() => setShowCustomModal(false)}
                className="flex-1 bg-gray-200 rounded-lg py-3"
              >
                <Text className="text-gray-700 text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createCustomExercise}
                className="flex-1 bg-blue-600 rounded-lg py-3"
              >
                <Text className="text-white text-center font-medium">
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Exercise Button */}
      <View className="bg-white border-t border-gray-200 p-4">
        <TouchableOpacity
          onPress={() => setShowCustomModal(true)}
          className="bg-gray-100 rounded-lg py-3 flex-row items-center justify-center"
        >
          <Icon name="add" size={20} color="#374151" />
          <Text className="text-gray-700 font-medium ml-2">
            Create Custom Exercise
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddExerciseScreen;