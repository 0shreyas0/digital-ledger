import { View, Text, TouchableOpacity, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import colors from "tailwindcss/colors";

const NoTransactionFound = ({ mode = "initial", onClear }) => {
  const router = useRouter();
  const isFilter = mode === "filter";

  return (
    <View className="flex-col p-8 rounded-3xl bg-slate-50 border border-slate-200">
      <View className="items-center justify-center">
        <View className="bg-slate-200/50 p-4 rounded-full mb-4">
          <Ionicons
            name={isFilter ? "search-outline" : "receipt-outline"}
            color={colors.slate[400]}
            size={40}
          />
        </View>

        <Text className="font-sansBold text-2xl text-slate-800 text-center">
          {isFilter ? "No Results Found" : "No Transactions yet"}
        </Text>

        <Text className="font-sansMed text-base px-4 text-center mt-2 mb-6 text-slate-500">
          {isFilter 
            ? "We couldn't find any matches. Try adjusting your filters or search terms." 
            : "Start tracking your finances by adding your first transaction today!"}
        </Text>
      </View>

      {isFilter ? (
        <TouchableOpacity
          onPress={onClear}
          className="bg-slate-700 py-4 rounded-2xl items-center"
        >
          <Text className="text-white font-sansBold text-lg">Clear Filters</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => router.push("/create")}
          className="flex-row bg-slate-700 justify-center py-4 rounded-2xl gap-2 items-center"
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text className="font-sansBold text-white text-lg">Add Transaction</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default NoTransactionFound;
