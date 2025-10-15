import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { exerciseService, Exercise, categories } from '../services/exerciseService';

type CreateTemplateRouteProp = RouteProp<RootStackParamList, 'CreateTemplate'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface TemplateExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

const CreateTemplateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateTemplateRouteProp>();
  const { templateId } = route.params || {};

  const isEditing = !!templateId;

  const [templateName, setTemplateName] = useState(isEditing ? 'Push Day' : '');
  const [templateDescription, setTemplateDescription] = useState(isEditing ? 'Chest, shoulders, and triceps workout' : '');
  
  const [exercises, setExercises] = useState<TemplateExercise[]>(
    isEditing 
      ? [
          { id: '1', name: 'Bench Press', sets: 3, reps: 8, weight: 80 },
          { id: '2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 25 },
          { id: '3', name: 'Overhead Press', sets: 3, reps: 8, weight: 50 },
        ]
      : []
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if ((global as any).selectedExercise) {
        const selectedExercise = (global as any).selectedExercise;
        const newExercise: TemplateExercise = {
          id: selectedExercise.id,
          name: selectedExercise.name,
          sets: 3,
          reps: 8,
          weight: undefined,
          notes: '',
        };
        setExercises(prev => [...prev, newExercise]);
        delete (global as any).selectedExercise;
      }
    });

    return unsubscribe;
  }, [navigation]);

  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const availableExercises = exerciseService.searchExercises(searchQuery, selectedCategory)
    .filter(ex => !exercises.some(templateEx => templateEx.name === ex.name));

  const addExercise = (exercise: Exercise) => {
    const newExercise: TemplateExercise = {
      id: Date.now().toString(),
      name: exercise.name,
      sets: 3,
      reps: 8,
      weight: undefined,
    };
    setExercises([...exercises, newExercise]);
    setSearchQuery('');
    setSelectedCategory('All');
    setShowExerciseSelector(false);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExercise = (exerciseId: string, field: keyof TemplateExercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    // TODO: Save template to database
    console.log('Saving template:', {
      name: templateName,
      description: templateDescription,
      exercises,
    });

    Alert.alert(
      'Success',
      `Template "${templateName}" ${isEditing ? 'updated' : 'created'} successfully!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const renderDeleteAction = (onDelete: () => void) => {
    return (
      <View className="flex-row">
        <TouchableOpacity
          onPress={onDelete}
          className="bg-red-500 justify-center items-center rounded-lg w-20 mb-3 ml-4"
        >
          <Icon name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderExercise = ({ item, index }: { item: TemplateExercise; index: number }) => (
    <Swipeable
      key={item.id}
      renderRightActions={() => renderDeleteAction(() => removeExercise(item.id))}
    >
      <View className="bg-gray-800 rounded-lg p-4 mb-3 shadow-sm">
        <View className="mb-3">
          <Text className="text-lg font-semibold text-gray-100">
            {item.name}
          </Text>
        </View>

      <View className="flex-row gap-8">
        <View className="flex-1">
          <Text className="text-sm text-gray-300 mb-1">Sets</Text>
          <TextInput
            value={item.sets.toString()}
            onChangeText={(value) => updateExercise(item.id, 'sets', parseInt(value) || 0)}
            className="border border-gray-600 rounded-lg p-2 text-center bg-gray-700 text-gray-200"
            keyboardType="numeric"
            placeholder="3"
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-300 mb-1">Reps</Text>
          <TextInput
            value={item.reps.toString()}
            onChangeText={(value) => updateExercise(item.id, 'reps', parseInt(value) || 0)}
            className="border border-gray-600 rounded-lg p-2 text-center bg-gray-700 text-gray-200"
            keyboardType="numeric"
            placeholder="8"
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-300 mb-1">Weight (kg)</Text>
          <TextInput
            value={item.weight?.toString() || ''}
            onChangeText={(value) => updateExercise(item.id, 'weight', parseInt(value) || undefined)}
            className="border border-gray-600 rounded-lg p-2 text-center bg-gray-700 text-gray-200"
            keyboardType="numeric"
            placeholder="Optional"
          />
        </View>
      </View>

      <View className="mt-3">
        <Text className="text-sm text-gray-300 mb-1">Notes</Text>
        <TextInput
          value={item.notes || ''}
          onChangeText={(value) => updateExercise(item.id, 'notes', value)}
          className="border border-gray-600 rounded-lg p-2 bg-gray-700 text-gray-200"
          placeholder="Exercise notes..."
          placeholderTextColor="#9ca3af"
          multiline
        />
      </View>
    </View>
    </Swipeable>
  );

  const renderAvailableExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      onPress={() => addExercise(item)}
      className="bg-gray-800 rounded-lg p-4 mb-2 shadow-sm border border-gray-600"
    >
      <Text className="text-lg font-medium text-gray-100">{item.name}</Text>
      <Text className="text-sm text-gray-300">{item.category}</Text>
    </TouchableOpacity>
  );

  if (showExerciseSelector) {
    return (
      <View className="flex-1 bg-gray-900">
        <View className="flex-row justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
          <Text className="text-xl font-bold text-gray-100">
            Select Exercise
          </Text>
          <TouchableOpacity
            onPress={() => setShowExerciseSelector(false)}
            className="p-2"
          >
            <Text className="text-slate-400 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View className="bg-gray-800 px-4 py-3 border-b border-gray-700">
          <View className="flex-row items-center bg-gray-700 rounded-lg p-3">
            <Icon name="search" size={20} color="#6b7280" />
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category
                      ? 'bg-slate-600'
                      : 'bg-gray-700'
                  }`}
                >
                  <Text
                    className={`font-medium ${
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
          </ScrollView>
        </View>
        
        <FlatList
          data={availableExercises}
          renderItem={renderAvailableExercise}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="bg-gray-800 rounded-lg p-8 items-center">
              <Icon name="search-off" size={48} color="#6b7280" />
              <Text className="text-gray-300 text-lg font-medium mt-4">
                No exercises found
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Try adjusting your search or category filter
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1">
      <ScrollView className="flex-1">
        {/* Template Basic Info */}
        <View className="bg-gray-800 p-4 border-b border-gray-700">
          <Text className="text-xl font-bold text-gray-100 mb-4">
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-sm text-gray-300 mb-2">Template Name *</Text>
              <TextInput
                value={templateName}
                onChangeText={setTemplateName}
                className="border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-200"
                placeholder="e.g., Push Day, Full Body, etc."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-sm text-gray-300 mb-1 mt-4">Description</Text>
              <TextInput
                value={templateDescription}
                onChangeText={setTemplateDescription}
                className="border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-200"
                placeholder="Brief description of this workout"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        </View>

        {/* Exercises */}
        <View className="p-4 bg-gray-900 flex-1">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-100">
              Exercises ({exercises.length})
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddExercise', { onSelectExercise: () => {} })}
              className="bg-slate-600 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-medium">Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {exercises.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-8 shadow-sm items-center">
              <Text className="text-gray-300 mb-2">No exercises added yet</Text>
              <Text className="text-sm text-gray-400 text-center">
                Tap "Add Exercise" to start building your template
              </Text>
            </View>
          ) : (
            <FlatList
              data={exercises}
              renderItem={renderExercise}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="bg-gray-800 border-t border-gray-700 p-4">
        <TouchableOpacity
          onPress={saveTemplate}
          className="bg-slate-600 rounded-lg py-4"
        >
          <Text className="text-white text-center font-bold text-lg">
            {isEditing ? 'Update Template' : 'Save Template'}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

export default CreateTemplateScreen;