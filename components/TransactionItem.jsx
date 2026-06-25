import { View, Text, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "@/lib/utils.js";
import { DEFAULT_CATEGORY_ICON } from "@/constants/categoryIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

const TransactionItem = ({ item, onDelete, currency, onPressIcon }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const isIncome = parseFloat(item.amount) > 0;
  const iconName = item.icon || DEFAULT_CATEGORY_ICON;

  return (
    <View className="bg-card p-3 py-6 my-3 rounded-card shadow-sm" key={item.id}> 
      <View
        className="flex-row items-center justify-between"
      >
      <View className="flex-row flex-1 items-center">
        <Pressable 
          onPress={() => onPressIcon ? onPressIcon(item) : router.push(`/edit?id=${item.id}`)}
          className="h-25 w-25 p-3 mx-3 rounded-full bg-surface active:bg-accent justify-center items-center"
        >
          {({ pressed }) => (
            <Ionicons
              size={25}
              name={iconName}
              color={pressed ? "#000000" : (isIncome ? colors.green : colors.red)}
            />
          )}
        </Pressable>
        <View className="flex-col flex-1 mr-2 gap-1 justify-center">
          <Text className="font-sansBold text-textMain">{item.title}</Text>
          <Text className="font-sansMed text-textMuted">{item.category}</Text>
        </View>
      </View>
      <View className="flex-row justify-between">
        <View className="flex-col items-end justify-center gap-1">
          <Text
            className="font-sansBold"
            style={{ color: isIncome ? colors.green : colors.red }}
          >
            {isIncome ? "+" : "-"}
            {currency}
            {Math.abs(parseFloat(item.amount)).toFixed(2)}
          </Text>
          <Text className="font-sansMed text-textMain">{formatDate(item.created_at)}</Text>
        </View>
        <View className="border-l h-15 border-l-borderSubtle mx-3">
        </View>
        <Pressable
          className="h-14 w-14 p-3 rounded-full self-center active:bg-accent items-center justify-center"
          onPress={() => onDelete(item.id)}
        >
          {({ pressed }) => (
            <Ionicons size={22} name="trash-outline" color={pressed ? "#000000" : colors.red} />
          )}
        </Pressable>
      </View>
    </View>
    <View className="ml-[64px]">
      {item.tags && item.tags.length > 0 && (
        <View className="flex-row flex-wrap gap-1 mt-2">
          {item.tags.map((tag) => (
            <View
              key={tag.id}
              style={{ backgroundColor: tag.color }}
              className="px-2 py-1.5 rounded-full"
            >
              <Text className="text-[10px] font-sansBold text-textMain">
                {tag.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
    </View>
  );
};

export default TransactionItem;
