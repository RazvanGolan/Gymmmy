import React, { useState, useEffect } from 'react';
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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, selectedCategory]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const allExercises = await exerciseService.getAllExercises();
      setExercises(allExercises);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = async () => {
    try {
      const filtered = await exerciseService.searchExercises(searchQuery, selectedCategory);
      setFilteredExercises(filtered);
    } catch (error) {
      console.error('Failed to filter exercises:', error);
    }
  };

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
    
    (global as any).selectedExercise = newExercise;
    
    onSelectExercise(newExercise);
    navigation.goBack();
  };

  const createCustomExercise = async () => {
    if (!customExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    const exists = await exerciseService.exerciseExists(customExerciseName);
    if (exists) {
      Alert.alert('Error', 'An exercise with this name already exists');
      return;
    }

    const newExercise = await exerciseService.addCustomExercise(customExerciseName, customExerciseCategory);
    if (newExercise) {
      setShowCustomModal(false);
      setCustomExerciseName('');
      setCustomExerciseCategory('Chest');
      
      // Reload exercises to include the new one
      await loadExercises();
      
      handleSelectExercise(newExercise);
    } else {
      Alert.alert('Error', 'Failed to create custom exercise');
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Search Bar */}
      <View className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <View className="flex-row items-center bg-gray-700 rounded-lg p-3">
          <Icon name="search" size={20} color="#9ca3af" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            className="flex-1 ml-2 text-gray-200"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <View className="flex-row flex-wrap gap-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-slate-600'
                  : 'bg-gray-700'
              }`}
              style={{ minWidth: '22%' }}
            >
              <Text
                className={`font-medium text-center ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'text-gray-300'
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
          {loading ? (
            <View className="bg-gray-800 rounded-lg p-8 items-center">
              <Text className="text-gray-300 text-lg font-medium">
                Loading exercises...
              </Text>
            </View>
          ) : filteredExercises.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-8 items-center">
              <Icon name="search-off" size={48} color="#6b7280" />
              <Text className="text-gray-300 text-lg font-medium mt-4">
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
                className="bg-gray-800 rounded-lg p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-100 mb-1">
                      {exercise.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Icon name="category" size={16} color="#9ca3af" />
                      <Text className="text-sm text-gray-300 ml-1">
                        {exercise.category}
                      </Text>
                    </View>
                  </View>
                  <Icon name="add-circle" size={24} color="#64748b" />
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
          <View className="bg-gray-800 rounded-lg p-6 max-w-sm mx-auto w-full">
            <Text className="text-xl font-bold text-gray-100 mb-4">
              Create Custom Exercise
            </Text>
            
            <Text className="text-sm font-medium text-gray-300 mb-2">
              Exercise Name
            </Text>
            <TextInput
              value={customExerciseName}
              onChangeText={setCustomExerciseName}
              placeholder="Enter exercise name"
              className="border border-gray-600 rounded-lg p-3 mb-4 bg-gray-700 text-gray-200"
            />
            
            <Text className="text-sm font-medium text-gray-300 mb-2">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {categories.filter(cat => cat !== 'All').map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setCustomExerciseCategory(category)}
                  className={`px-3 py-2 rounded-full ${
                    customExerciseCategory === category
                      ? 'bg-slate-600'
                      : 'bg-gray-700'
                  }`}
                  style={{ minWidth: '22%' }}
                >
                  <Text
                    className={`font-medium text-center text-xs ${
                      customExerciseCategory === category
                        ? 'text-white'
                        : 'text-gray-300'
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
                className="flex-1 bg-gray-600 rounded-lg py-3"
              >
                <Text className="text-gray-300 text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createCustomExercise}
                className="flex-1 bg-slate-600 rounded-lg py-3"
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
      <View className="bg-gray-800 border-t border-gray-700 p-4">
        <TouchableOpacity
          onPress={() => setShowCustomModal(true)}
          className="bg-gray-600 rounded-lg py-3 flex-row items-center justify-center"
        >
          <Icon name="add" size={20} color="#d1d5db" />
          <Text className="text-gray-200 font-medium ml-2">
            Create Custom Exercise
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddExerciseScreen;