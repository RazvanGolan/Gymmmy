import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { databaseService } from '../services/database';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const result = await databaseService.getUserSettings();
      if (result.success && result.data) {
        setTheme(result.data.darkModeEnabled ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Failed to load theme setting:', error);
      setTheme('dark');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    const isDarkMode = newTheme === 'dark';
    
    try {
      const result = await databaseService.updateUserSettings({ 
        darkModeEnabled: isDarkMode 
      });
      
      if (result.success) {
        setTheme(newTheme);
      } else {
        console.error('Failed to save theme setting:', result.error);
      }
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  };

  const isDark = theme === 'dark';

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};