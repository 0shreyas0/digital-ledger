import { View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
// import { useColorScheme } from "nativewind";

const SafeScreen = ({ children }) => {
  const insets = useSafeAreaInsets();
  // const { colorScheme } = useColorScheme();
  return (
    // <View className={`flex-1 bg-background ${colorScheme === 'dark' ? 'dark' : 'light'}`} style={{ paddingTop: insets.top }}>
    <View className={`flex-1 bg-background light`} style={{ paddingTop: insets.top }}>
      {children}
    </View>
  );
};

export default SafeScreen;
