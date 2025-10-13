import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';
import ExerciseHistoryScreen from '../screens/ExerciseHistoryScreen';
import CreateTemplateScreen from '../screens/CreateTemplateScreen';
import StatsScreen from '../screens/StatsScreen';
import AddExerciseScreen from '../screens/AddExerciseScreen';

// Navigation Types
export type RootTabParamList = {
  Home: undefined;
  Workout: undefined;
  Templates: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  WorkoutSession: { 
    date: string; 
    templateId?: string; 
    workoutId?: string;
  };
  ExerciseHistory: { 
    exerciseId: string; 
    exerciseName: string; 
  };
  CreateTemplate: { 
    templateId?: string; 
  };
  Stats: undefined;
  AddExercise: {
    onSelectExercise: (exercise: {
      id: string;
      name: string;
      sets: {
        id: string;
        last: string;
        reps: string;
        weight: string;
      }[];
    }) => void;
  };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Calendar',
          // TODO: Add icon when vector icons are properly set up
        }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen}
        options={{
          tabBarLabel: 'Workout',
          // TODO: Add icon when vector icons are properly set up
        }}
      />
      <Tab.Screen 
        name="Templates" 
        component={TemplatesScreen}
        options={{
          tabBarLabel: 'Templates',
          // TODO: Add icon when vector icons are properly set up
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          // TODO: Add icon when vector icons are properly set up
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          // TODO: Add icon when vector icons are properly set up
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen 
          name="WorkoutSession" 
          component={WorkoutSessionScreen}
          options={{
            headerShown: true,
            headerTitle: 'Workout Session',
          }}
        />
        <Stack.Screen 
          name="ExerciseHistory" 
          component={ExerciseHistoryScreen}
          options={{
            headerShown: true,
            headerTitle: 'Exercise History',
          }}
        />
        <Stack.Screen 
          name="CreateTemplate" 
          component={CreateTemplateScreen}
          options={{
            headerShown: true,
            headerTitle: 'Create Template',
          }}
        />
        <Stack.Screen 
          name="Stats" 
          component={StatsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Statistics',
          }}
        />
        <Stack.Screen 
          name="AddExercise" 
          component={AddExerciseScreen}
          options={{
            headerShown: true,
            headerTitle: 'Add Exercise',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}