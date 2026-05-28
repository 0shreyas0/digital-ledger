import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "@/lib/utils.js";
import CirclePressable from "@/components/pressables/CirclePressable";
import colors from "tailwindcss/colors";
import { DEFAULT_CATEGORY_ICON } from "@/constants/categoryIcons";

const TransactionItem = ({ item, onDelete, currency, onPressIcon }) => {
  const isIncome = parseFloat(item.amount) > 0;
  const iconName = item.icon || DEFAULT_CATEGORY_ICON;

  return (
    <View className="bg-slate-50 p-3 py-6 my-3 rounded-2xl shadow-sm" key={item.id}> 
      <View
        className="flex-row items-center justify-between"
      >
      <View className="flex-row flex-1 items-center">
        <TouchableOpacity 
          onPress={() => onPressIcon && onPressIcon(item)}
          className="h-25 w-25 p-3 mx-3 rounded-full bg-slate-200 active:bg-accent justify-center items-center"
        >
          <Ionicons
            size={25}
            name={iconName}
            color={isIncome ? "#22c55e" : "#ef4444"}
          />
        </TouchableOpacity>
        <View className="flex-col flex-1 mr-2 gap-1 justify-center">
          <Text className="font-sansBold">{item.title}</Text>
          <Text className="font-sansMed color-slate-400">{item.category}</Text>
        </View>
      </View>
      <View className="flex-row justify-between">
        <View className="flex-col items-end justify-center gap-1">
          <Text
            className="font-sansBold"
            style={{ color: isIncome ? "#22c55e" : "#ef4444" }}
          >
            {isIncome ? "+" : "-"}
            {currency}
            {Math.abs(parseFloat(item.amount)).toFixed(2)}
          </Text>
          <Text className="font-sansMed">{formatDate(item.created_at)}</Text>
        </View>
        <View className="border-l h-15 border-l-slate-300 mx-3">
        </View>
        <CirclePressable
          className="self-center h-14 w-14 p-3 items-center justify-center"
          onPress={() => onDelete(item.id)}
          name="trash-outline"
          size={22}
          iconColor={colors.red[500]}
          pressedIconColor={colors.red[700]}
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
              <Text className="text-[10px] font-sansBold text-slate-700">
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
