import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const CloseButton = ({ onPress, size = 24, iconSize = 24, className = "" }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-surface p-2 rounded-full border border-borderSubtle ${className}`}
      activeOpacity={0.7}
    >
      <Ionicons name="close" size={iconSize} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

export default CloseButton;
