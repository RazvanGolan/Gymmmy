import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';
import CreateTemplateScreen from '../screens/CreateTemplateScreen';
import StatsScreen from '../screens/StatsScreen';
import AddExerciseScreen from '../screens/AddExerciseScreen';
import { useTheme } from '../contexts/ThemeContext';

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
  const { isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#374151' : '#e2e8f0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: '#10d6bf',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#64748b',
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
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen}
        options={{
          tabBarLabel: 'Workout',
          tabBarIcon: ({ color, size }) => (
            <Icon name="fitness-center" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Templates" 
        component={TemplatesScreen}
        options={{
          tabBarLabel: 'Templates',
          tabBarIcon: ({ color, size }) => (
            <Icon name="turned-in-not" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Icon name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isDark } = useTheme();
  
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
            headerStyle: {
              backgroundColor: isDark ? '#1f2937' : '#f8fafc',
            },
            headerTintColor: isDark ? '#f3f4f6' : '#1e293b',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="CreateTemplate" 
          component={CreateTemplateScreen}
          options={{
            headerShown: true,
            headerTitle: 'Create Template',
            headerStyle: {
              backgroundColor: isDark ? '#1f2937' : '#f8fafc',
            },
            headerTintColor: isDark ? '#f3f4f6' : '#1e293b',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="Stats" 
          component={StatsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Statistics',
            headerStyle: {
              backgroundColor: isDark ? '#1f2937' : '#f8fafc',
            },
            headerTintColor: isDark ? '#f3f4f6' : '#1e293b',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="AddExercise" 
          component={AddExerciseScreen}
          options={{
            headerShown: true,
            headerTitle: 'Add Exercise',
            headerStyle: {
              backgroundColor: isDark ? '#1f2937' : '#f8fafc',
            },
            headerTintColor: isDark ? '#f3f4f6' : '#1e293b',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}