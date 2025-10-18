import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { exerciseService, Exercise, categories } from '../services/exerciseService';
import { useTemplatesData } from '../hooks/useTemplatesData';
import { useTemplateActions } from '../hooks/useTemplateActions';
import { TemplateExercise, WorkoutTemplate } from '../types';

type CreateTemplateRouteProp = RouteProp<RootStackParamList, 'CreateTemplate'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const CreateTemplateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateTemplateRouteProp>();
  const { templateId } = route.params || {};
  
  const { getTemplate } = useTemplatesData();
  const { createTemplate, updateTemplate: updateTemplateAction, loadTemplates } = useTemplateActions();

  const isEditing = !!templateId;
  const [isLoading, setIsLoading] = useState(false);

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);

  // Load existing template if editing
  useEffect(() => {
    if (isEditing && templateId) {
      const existingTemplate = getTemplate(templateId);
      if (existingTemplate) {
        setTemplateName(existingTemplate.name);
        setTemplateDescription(existingTemplate.description || '');
        setExercises(existingTemplate.exercises || []);
      }
    }
  }, [isEditing, templateId, getTemplate]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if ((global as any).selectedExercise) {
        const selectedExercise = (global as any).selectedExercise;
        const newExercise: TemplateExercise = {
          id: selectedExercise.id,
          exerciseId: selectedExercise.id,
          exerciseName: selectedExercise.name,
          sets: 3,
          reps: 8,
          weight: undefined,
          duration: undefined,
          notes: '',
          order: exercises.length,
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
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    if (showExerciseSelector) {
      loadAvailableExercises();
    }
  }, [showExerciseSelector, searchQuery, selectedCategory, exercises]);

  const loadAvailableExercises = async () => {
    try {
      setLoadingExercises(true);
      const allExercises = await exerciseService.searchExercises(searchQuery, selectedCategory);
      const filtered = allExercises.filter(ex => !exercises.some(templateEx => templateEx.exerciseName === ex.name));
      setAvailableExercises(filtered);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoadingExercises(false);
    }
  };

  const addExercise = (exercise: Exercise) => {
    const newExercise: TemplateExercise = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      reps: 8,
      weight: undefined,
      duration: undefined,
      notes: '',
      order: exercises.length,
    };
    setExercises([...exercises, newExercise]);
    setSearchQuery('');
    setSelectedCategory('All');
    setShowExerciseSelector(false);
  };

  const removeExercise = (exerciseId: string) => {
    const filtered = exercises.filter(ex => ex.id !== exerciseId);
    // Reorder the remaining exercises
    const reordered = filtered.map((ex, index) => ({ ...ex, order: index }));
    setExercises(reordered);
  };

  const updateExercise = (exerciseId: string, field: keyof TemplateExercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setIsLoading(true);
    
    try {
      const templateData = {
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        exercises: exercises,
      };

      if (isEditing && templateId) {
        await updateTemplateAction(templateId, templateData);
        Alert.alert(
          'Success',
          `Template "${templateName}" updated successfully!`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        const newTemplateId = await createTemplate(templateData);
        if (newTemplateId) {
          Alert.alert(
            'Success',
            `Template "${templateName}" created successfully!`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert('Error', 'Failed to create template. Please try again.');
        }
      }
    } catch (error) {
      console.error('Save template error:', error);
      Alert.alert('Error', 'Failed to save template. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            {item.exerciseName}
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
            value={(item.reps || 0).toString()}
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
              onPress={() => setShowExerciseSelector(true)}
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
          disabled={isLoading}
          className={`rounded-lg py-4 ${
            isLoading ? 'bg-gray-600' : 'bg-slate-600'
          }`}
        >
          <Text className="text-white text-center font-bold text-lg">
            {isLoading 
              ? 'Saving...' 
              : isEditing 
                ? 'Update Template' 
                : 'Save Template'
            }
          </Text>
        </TouchableOpacity>
      </View>
      </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

export default CreateTemplateScreen;