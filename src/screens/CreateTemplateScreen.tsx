import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

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

// Mock exercises for selection
const mockExercises = [
  { id: '1', name: 'Bench Press', category: 'Chest' },
  { id: '2', name: 'Squat', category: 'Legs' },
  { id: '3', name: 'Deadlift', category: 'Back' },
  { id: '4', name: 'Overhead Press', category: 'Shoulders' },
  { id: '5', name: 'Pull-ups', category: 'Back' },
  { id: '6', name: 'Dips', category: 'Chest' },
  { id: '7', name: 'Barbell Rows', category: 'Back' },
  { id: '8', name: 'Incline Dumbbell Press', category: 'Chest' },
];

const CreateTemplateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateTemplateRouteProp>();
  const { templateId } = route.params || {};

  const isEditing = !!templateId;

  const [templateName, setTemplateName] = useState(isEditing ? 'Push Day' : '');
  const [templateDescription, setTemplateDescription] = useState(isEditing ? 'Chest, shoulders, and triceps workout' : '');
  const [templateCategory, setTemplateCategory] = useState(isEditing ? 'Push' : '');
  const [estimatedDuration, setEstimatedDuration] = useState(isEditing ? '60' : '');
  
  const [exercises, setExercises] = useState<TemplateExercise[]>(
    isEditing 
      ? [
          { id: '1', name: 'Bench Press', sets: 3, reps: 8, weight: 80 },
          { id: '2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 25 },
          { id: '3', name: 'Overhead Press', sets: 3, reps: 8, weight: 50 },
        ]
      : []
  );

  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const addExercise = (exerciseId: string, exerciseName: string) => {
    const newExercise: TemplateExercise = {
      id: exerciseId,
      name: exerciseName,
      sets: 3,
      reps: 8,
      weight: undefined,
    };
    setExercises([...exercises, newExercise]);
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
      category: templateCategory,
      estimatedDuration: parseInt(estimatedDuration) || 0,
      exercises,
    });

    Alert.alert(
      'Success',
      `Template "${templateName}" ${isEditing ? 'updated' : 'created'} successfully!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const renderExercise = ({ item, index }: { item: TemplateExercise; index: number }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-900 flex-1">
          {item.name}
        </Text>
        <TouchableOpacity
          onPress={() => removeExercise(item.id)}
          className="p-2"
        >
          <Text className="text-red-600 text-sm">Remove</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Text className="text-sm text-gray-600 mb-1">Sets</Text>
          <TextInput
            value={item.sets.toString()}
            onChangeText={(value) => updateExercise(item.id, 'sets', parseInt(value) || 0)}
            className="border border-gray-300 rounded-lg p-2 text-center"
            keyboardType="numeric"
            placeholder="3"
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-600 mb-1">Reps</Text>
          <TextInput
            value={item.reps.toString()}
            onChangeText={(value) => updateExercise(item.id, 'reps', parseInt(value) || 0)}
            className="border border-gray-300 rounded-lg p-2 text-center"
            keyboardType="numeric"
            placeholder="8"
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-600 mb-1">Weight (kg)</Text>
          <TextInput
            value={item.weight?.toString() || ''}
            onChangeText={(value) => updateExercise(item.id, 'weight', parseInt(value) || undefined)}
            className="border border-gray-300 rounded-lg p-2 text-center"
            keyboardType="numeric"
            placeholder="Optional"
          />
        </View>
      </View>

      <View className="mt-3">
        <Text className="text-sm text-gray-600 mb-1">Notes</Text>
        <TextInput
          value={item.notes || ''}
          onChangeText={(value) => updateExercise(item.id, 'notes', value)}
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Exercise notes..."
          multiline
        />
      </View>
    </View>
  );

  const renderAvailableExercise = ({ item }: { item: typeof mockExercises[0] }) => (
    <TouchableOpacity
      onPress={() => addExercise(item.id, item.name)}
      className="bg-white rounded-lg p-4 mb-2 shadow-sm border border-gray-100"
    >
      <Text className="text-lg font-medium text-gray-900">{item.name}</Text>
      <Text className="text-sm text-gray-600">{item.category}</Text>
    </TouchableOpacity>
  );

  if (showExerciseSelector) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">
            Select Exercise
          </Text>
          <TouchableOpacity
            onPress={() => setShowExerciseSelector(false)}
            className="p-2"
          >
            <Text className="text-blue-600 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={mockExercises.filter(ex => !exercises.some(templateEx => templateEx.id === ex.id))}
          renderItem={renderAvailableExercise}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Template Basic Info */}
        <View className="bg-white p-4 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-sm text-gray-600 mb-1">Template Name *</Text>
              <TextInput
                value={templateName}
                onChangeText={setTemplateName}
                className="border border-gray-300 rounded-lg p-3"
                placeholder="e.g., Push Day, Full Body, etc."
              />
            </View>

            <View>
              <Text className="text-sm text-gray-600 mb-1">Description</Text>
              <TextInput
                value={templateDescription}
                onChangeText={setTemplateDescription}
                className="border border-gray-300 rounded-lg p-3"
                placeholder="Brief description of this workout"
                multiline
                numberOfLines={2}
              />
            </View>

            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Category</Text>
                <TextInput
                  value={templateCategory}
                  onChangeText={setTemplateCategory}
                  className="border border-gray-300 rounded-lg p-3"
                  placeholder="Push, Pull, Legs, etc."
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Est. Duration (min)</Text>
                <TextInput
                  value={estimatedDuration}
                  onChangeText={setEstimatedDuration}
                  className="border border-gray-300 rounded-lg p-3"
                  placeholder="60"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Exercises */}
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Exercises ({exercises.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowExerciseSelector(true)}
              className="bg-blue-600 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-medium">Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {exercises.length === 0 ? (
            <View className="bg-white rounded-lg p-8 shadow-sm items-center">
              <Text className="text-gray-500 mb-2">No exercises added yet</Text>
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
      <View className="bg-white border-t border-gray-200 p-4">
        <TouchableOpacity
          onPress={saveTemplate}
          className="bg-blue-600 rounded-lg py-4"
        >
          <Text className="text-white text-center font-bold text-lg">
            {isEditing ? 'Update Template' : 'Save Template'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreateTemplateScreen;