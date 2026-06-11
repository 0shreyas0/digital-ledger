import { View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const SafeScreen = ({ children }) => {
  const insets = useSafeAreaInsets();
  const { theme, colorScheme } = useTheme();

  return (
    <View 
      className={`flex-1 bg-background theme-${theme} ${colorScheme === 'dark' ? 'dark' : 'light'}`} 
      style={{ paddingTop: insets.top }}
    >
      {children}
    </View>
  );
};

export default SafeScreen;
