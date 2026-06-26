import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { THEMES } from '@/constants/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme(); // 'light' or 'dark'
  
  const [theme, setThemeState] = useState('ice'); // 'ice', 'coffee', 'purple'
  const [themeMode, setThemeModeState] = useState('system'); // 'light', 'dark', 'system'
  const [glassOpacity, setGlassOpacityState] = useState(0.5); // ranges from 0.1 to 1.0
  const [isLoaded, setIsLoaded] = useState(false);
  const opacityTimeoutRef = useRef(null);

  // Load saved preferences
  useEffect(() => {
    async function loadPreferences() {
      try {
        const savedTheme = await SecureStore.getItemAsync('user-theme');
        const savedMode = await SecureStore.getItemAsync('user-theme-mode');
        const savedOpacity = await SecureStore.getItemAsync('user-glass-opacity');
        
        if (savedTheme && THEMES[savedTheme]) {
          setThemeState(savedTheme);
        }
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode);
        }
        if (savedOpacity) {
          const parsed = parseFloat(savedOpacity);
          if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 1.0) {
            setGlassOpacityState(parsed);
          }
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

  const setGlassOpacity = (newOpacity) => {
    if (typeof newOpacity === 'number' && newOpacity >= 0.1 && newOpacity <= 1.0) {
      setGlassOpacityState(newOpacity);
      if (opacityTimeoutRef.current) {
        clearTimeout(opacityTimeoutRef.current);
      }
      opacityTimeoutRef.current = setTimeout(async () => {
        try {
          await SecureStore.setItemAsync('user-glass-opacity', newOpacity.toString());
        } catch (error) {
          console.error("Error saving glass opacity preference:", error);
        }
      }, 400);
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
      glassOpacity,
      setTheme,
      setThemeMode,
      setGlassOpacity,
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
