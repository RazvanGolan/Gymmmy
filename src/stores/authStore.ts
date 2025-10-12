import { create } from 'zustand';
import { User, UserPreferences } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
      // Mock user data
      const mockUser: User = {
        id: '1',
        email,
        name: 'John Doe',
        weight: 75,
        preferences: {
          weightUnit: 'kg',
          notifications: {
            workoutReminders: true,
            achievementAlerts: true,
            weeklyProgress: true,
          },
          privacy: {
            shareProgress: false,
            publicProfile: false,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        preferences: {
          weightUnit: 'kg',
          notifications: {
            workoutReminders: true,
            achievementAlerts: true,
            weeklyProgress: true,
          },
          privacy: {
            shareProgress: false,
            publicProfile: false,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ 
            user: { 
              ...user, 
              ...updates, 
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      updatePreferences: (preferences: Partial<UserPreferences>) => {
        const { user } = get();
        if (user && user.preferences) {
          set({
            user: {
              ...user,
              preferences: {
                ...user.preferences,
                ...preferences,
                notifications: {
                  ...user.preferences.notifications,
                  ...preferences.notifications,
                },
                privacy: {
                  ...user.preferences.privacy,
                  ...preferences.privacy,
                },
              },
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
}));