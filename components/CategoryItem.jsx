import { View, Text } from "react-native";
import AppPressable from "@/components/pressables/AppPressable";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import CirclePressable from "@/components/pressables/CirclePressable";
import { DEFAULT_CATEGORY_ICON } from "@/constants/categoryIcons";
import { useTheme } from "@/context/ThemeContext";

const CategoryItem = ({ item, onDelete, isDeleting = false, onPress, onEditIconPress }) => {
  const { colors } = useTheme();

  return (
    <AppPressable 
      onPress={onPress}
      activeClassName="active:bg-surface"
      className="flex-row items-center justify-between bg-card border border-borderSubtle rounded-card px-4 py-4"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <AppPressable onPress={onEditIconPress} className="bg-primary/20 rounded-full p-3">
          {({ pressed }) => (
            <Ionicons
              name={item.icon || DEFAULT_CATEGORY_ICON}
              size={20}
              color={pressed ? "#000000" : colors.primary}
            />
          )}
        </AppPressable>
        <View className="flex-1">
          <Text className="font-sansBold text-lg text-textMain">
            {item.category}
          </Text>
          <Text className="font-sansReg text-textMuted">
            {item.transaction_count > 0
              ? `${item.transaction_count} transactions`
              : "No transactions yet"}
          </Text>
        </View>
      </View>
      <CirclePressable className="active:bg-accent"
        name={"trash-outline"}
        disabled={isDeleting}
        onPress={() => onDelete(item)}
      />
    </AppPressable>
  );
};

export default CategoryItem;
