import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { THEMES } from '@/constants/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme(); // 'light' or 'dark'
  
  const [theme, setThemeState] = useState('ice'); // 'ice', 'coffee', 'purple'
  const [themeMode, setThemeModeState] = useState('system'); // 'light', 'dark', 'system'
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preferences
  useEffect(() => {
    async function loadPreferences() {
      try {
        const savedTheme = await SecureStore.getItemAsync('user-theme');
        const savedMode = await SecureStore.getItemAsync('user-theme-mode');
        
        if (savedTheme && THEMES[savedTheme]) {
          setThemeState(savedTheme);
        }
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode);
        }
      } catch (error) {
        console.error("Error loading theme preferences:", error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadPreferences();
  }, []);

  const setTheme = async (newTheme) => {
    if (THEMES[newTheme]) {
      setThemeState(newTheme);
      try {
        await SecureStore.setItemAsync('user-theme', newTheme);
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    }
  };

  const setThemeMode = async (newMode) => {
    if (['light', 'dark', 'system'].includes(newMode)) {
      setThemeModeState(newMode);
      try {
        await SecureStore.setItemAsync('user-theme-mode', newMode);
      } catch (error) {
        console.error("Error saving theme mode preference:", error);
      }
    }
  };

  // Resolve light/dark based on the setting (themeMode) and device OS preference
  const colorScheme = themeMode === 'system' 
    ? (deviceColorScheme || 'light')
    : themeMode;

  // Resolve JS theme colors dynamically
  const colors = THEMES[theme]?.[colorScheme] || THEMES.ice.light;

  if (!isLoaded) {
    // Avoid flash of default theme if possible, but rendering null or a loading view is fine
    return null;
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      themeMode,
      colorScheme, // resolved active mode: 'light' or 'dark'
      colors, // dynamic JS color sheet matching active theme and colorScheme
      setTheme,
      setThemeMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
