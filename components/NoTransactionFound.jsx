import { View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import AppPressable from "./pressables/AppPressable";

const NoTransactionFound = ({ mode = "initial", onClear }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const isFilter = mode === "filter";

  return (
    <View className="flex-col p-8 rounded-card bg-card border border-borderSubtle shadow-sm">
      <View className="items-center justify-center">
        <View className="bg-borderSubtle/50 p-4 rounded-full mb-4">
          <Ionicons
            name={isFilter ? "search-outline" : "receipt-outline"}
            color={colors.textMuted}
            size={40}
          />
        </View>

        <Text className="font-sansBold text-2xl text-textMain text-center">
          {isFilter ? "No Results Found" : "No Transactions yet"}
        </Text>

        <Text className="font-sansMed text-base px-4 text-center mt-2 mb-6 text-textMuted">
          {isFilter 
            ? "We couldn't find any matches. Try adjusting your filters or search terms." 
            : "Start tracking your finances by adding your first transaction today!"}
        </Text>
      </View>

      {isFilter ? (
        <AppPressable
          onPress={onClear}
          className="bg-textMain py-4 rounded-2xl items-center"
        >
          {({ pressed }) => (
            <Text className={`font-sansBold text-lg ${pressed ? "text-black" : "text-white"}`}>Clear Filters</Text>
          )}
        </AppPressable>
      ) : (
        <AppPressable
          onPress={() => router.push("/create")}
          className="flex-row bg-primary justify-center py-4 rounded-2xl gap-2 items-center"
        >
          {({ pressed }) => (
            <>
              <Ionicons name="add-circle" size={20} color={pressed ? "black" : "white"} />
              <Text className={`font-sansBold text-lg ${pressed ? "text-black" : "text-white"}`}>Add Transaction</Text>
            </>
          )}
        </AppPressable>
      )}
    </View>
  );
};

export default NoTransactionFound;
