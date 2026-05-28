import { View, Text, Pressable, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import CirclePressable from "@/components/pressables/CirclePressable";
import { DEFAULT_CATEGORY_ICON } from "@/constants/categoryIcons";

const CategoryItem = ({ item, onDelete, isDeleting = false, onPress, onEditIconPress }) => {
  return (
    <Pressable 
      onPress={onPress}
      className="flex-row items-center justify-between bg-slate-50 border border-slate-300 rounded-2xl px-4 py-4 active:bg-slate-200"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <TouchableOpacity onPress={onEditIconPress} className="bg-blue-100 rounded-full p-3 active:bg-accent">
          <Ionicons
            name={item.icon || DEFAULT_CATEGORY_ICON}
            size={20}
            color={colors.blue[600]}
          />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-sansBold text-lg text-slate-700">
            {item.category}
          </Text>
          <Text className="font-sansReg text-slate-500">
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
    </Pressable>
  );
};

export default CategoryItem;
