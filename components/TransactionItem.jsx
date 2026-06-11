import { View, Text } from "react-native";
import AppPressable from "@/components/pressables/AppPressable";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "@/lib/utils.js";
import CirclePressable from "@/components/pressables/CirclePressable";
import { DEFAULT_CATEGORY_ICON } from "@/constants/categoryIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

const TransactionItem = ({ item, onDelete, currency, onPressIcon }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const isIncome = parseFloat(item.amount) > 0;
  const iconName = item.icon || DEFAULT_CATEGORY_ICON;

  return (
    <View className="bg-card p-3 py-6 my-3 rounded-card shadow-sm   " key={item.id}> 
      <View
        className="flex-row items-center justify-between"
      >
      <View className="flex-row flex-1 items-center">
        <AppPressable 
          onPress={() => onPressIcon ? onPressIcon(item) : router.push(`/edit?id=${item.id}`)}
          className="h-25 w-25 p-3 mx-3 rounded-full bg-surface justify-center items-center"
        >
          {({ pressed }) => (
            <Ionicons
              size={25}
              name={iconName}
              color={pressed ? "#000000" : (isIncome ? colors.green : colors.red)}
            />
          )}
        </AppPressable>
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
        <CirclePressable
          className="self-center h-14 w-14 p-3 items-center justify-center"
          onPress={() => onDelete(item.id)}
          name="trash-outline"
          size={22}
          iconColor={colors.red}
        />
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

    //     {/* FIXED DIVIDER */}
    //     <View className="mx-3 h-10 border-l border-slate-300 self-center" />

    //     {/* FIXED TRASH BUTTON */}
    //     <TouchableOpacity
    //       className="h-12 w-12 p-3 rounded-full self-center"
    //       onPress={() => onDelete(item.id)}
    //     >
    //       <Ionicons size={24} name="trash" color="#ef4444" />
    //     </TouchableOpacity>
    //   </View>
    // </View>
