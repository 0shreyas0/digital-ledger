import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/context/ThemeContext.jsx";
import React from "react";

const PageLoader = () => {
  const { colors } = useTheme();

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default PageLoader;
