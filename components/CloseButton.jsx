import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

const CloseButton = ({ onPress, size = 24, iconSize = 24, className = "" }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-slate-100 p-2 rounded-full ${className}`}
      activeOpacity={0.7}
    >
      <Ionicons name="close" size={iconSize} color={colors.slate[600]} />
    </TouchableOpacity>
  );
};

export default CloseButton;
