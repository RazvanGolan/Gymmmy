import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { exerciseService, Exercise, categories } from '../services/exerciseService';
import { useTheme } from '../contexts/ThemeContext';

type AddExerciseRouteProp = RouteProp<RootStackParamList, 'AddExercise'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const AddExerciseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddExerciseRouteProp>();
  const { onSelectExercise } = route.params;
  const { isDark } = useTheme();

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
    <View className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      {/* Search Bar */}
      <View className={`${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'} px-4 py-3 border-b`}>
        <View className={`flex-row items-center rounded-lg p-3 ${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'}`}>
          <Icon name="search" size={20} color={isDark ? '#9ca3af' : '#64748b'} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            className={`flex-1 ml-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color={isDark ? '#9ca3af' : '#94a3b8'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View className={`${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'} px-4 py-3 border-b`}>
        <View className="flex-row flex-wrap gap-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-primary'
                  : isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'
              }`}
              style={{ minWidth: '22%' }}
            >
              <Text
                className={`font-medium text-center ${
                  selectedCategory === category
                    ? (isDark ? 'text-gray-900' : 'text-white')
                    : (isDark ? 'text-dark-text' : 'text-light-text')
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
            <View className={`${isDark ? 'bg-dark-surface' : 'bg-light-surface'} rounded-lg p-8 items-center`}>
              <Text className={`${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'} text-lg font-medium`}>
                Loading exercises...
              </Text>
            </View>
          ) : filteredExercises.length === 0 ? (
            <View className={`${isDark ? 'bg-dark-surface' : 'bg-light-surface'} rounded-lg p-8 items-center`}>
              <Icon name="search-off" size={48} color={isDark ? '#9ca3af' : '#94a3b8'} />
              <Text className={`${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'} text-lg font-medium mt-4`}>
                No exercises found
              </Text>
              <Text className={`${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'} text-center mt-2`}>
                Try adjusting your search or category filter
              </Text>
            </View>
          ) : (
            filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => handleSelectExercise(exercise)}
                className={`${isDark ? 'bg-dark-surface' : 'bg-light-surface'} rounded-lg p-4 mb-3 shadow-sm`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={`text-lg font-semibold mb-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                      {exercise.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Icon name="category" size={16} color={isDark ? '#9ca3af' : '#94a3b8'} />
                      <Text className={`text-sm ml-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                        {exercise.category}
                      </Text>
                    </View>
                  </View>
                  <Icon name="add-circle" size={24} color={isDark ? '#10d6bf' : '#10d6bf'} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

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
          <View className={`${isDark ? 'bg-dark-surface' : 'bg-light-surface'} rounded-lg p-6 max-w-sm mx-auto w-full`}>
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Create Custom Exercise
            </Text>
            
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              Exercise Name
            </Text>
            <TextInput
              value={customExerciseName}
              onChangeText={setCustomExerciseName}
              placeholder="Enter exercise name"
              className={`border rounded-lg p-3 mb-4 ${isDark ? 'border-dark-border bg-dark-surface-secondary text-dark-text' : 'border-light-border bg-light-surface-secondary text-light-text'}`}
            />
            
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {categories.filter(cat => cat !== 'All').map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setCustomExerciseCategory(category)}
                  className={`px-3 py-2 rounded-full ${
                    customExerciseCategory === category
                      ? 'bg-primary'
                      : isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'
                  }`}
                  style={{ minWidth: '22%' }}
                >
                  <Text
                    className={`font-medium text-center text-xs ${
                      customExerciseCategory === category
                        ? (isDark ? 'text-gray-900' : 'text-white')
                        : (isDark ? 'text-dark-text' : 'text-light-text')
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
                className={`flex-1 rounded-lg py-3 ${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'}`}
              >
                <Text className={`${isDark ? 'text-dark-text' : 'text-light-text'} text-center font-medium`}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createCustomExercise}
                className="flex-1 bg-primary rounded-lg py-3"
              >
                <Text className={`${isDark ? 'text-gray-900' : 'text-white'} text-center font-medium`}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Exercise Button */}
      <View className={`${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'} border-t p-4`}>
        <TouchableOpacity
          onPress={() => setShowCustomModal(true)}
          className={`${isDark ? 'bg-dark-surface-secondary' : 'bg-light-surface-secondary'} rounded-lg py-3 flex-row items-center justify-center`}
        >
          <Icon name="add" size={20} color={isDark ? '#f3f4f6' : '#1e293b'} />
          <Text className={`${isDark ? 'text-dark-text' : 'text-light-text'} font-medium ml-2`}>
            Create Custom Exercise
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddExerciseScreen;