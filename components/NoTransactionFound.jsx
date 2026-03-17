import { View, Text, TouchableOpacity, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const NoTransactionFound = () => {
  const router = useRouter();

  return (
    <View className="flex-1 flex-col m-3 mb-20 p-3 rounded-2xl shadow-sm bg-slate-50">
      {/* CENTER CONTENT */}
      <View className="flex-1 items-center justify-center">
        <View style={{ height: 60, width: 60 }}>
          <Ionicons
            name="receipt"
            color="white"
            size={60}
            style={{ position: "absolute" }}
          />
          <Ionicons
            name="receipt-outline"
            color="grey"
            size={60}
            style={{ position: "absolute" }}
          />
        </View>

        <Text className="font-sansBold text-2xl mt-3">No Transactions yet</Text>

        <Text className="font-sansMed text-lg px-8 text-center my-3 text-slate-500">
          Start tracking your finances by adding your first transaction
        </Text>
      </View>

      {/* BOTTOM BUTTON */}
      <Pressable
        onPress={() => router.push("/create")}
        className="flex-row bg-blue-600 active:bg-accent w-full justify-center p-3 rounded-xl gap-2 items-center"
      >
        {({ pressed }) => (
          <>
            <Ionicons
              name="add-circle"
              size={25}
              color={pressed ? "#0f172a" : "#f8fafc"}
            />
            <Text
              className={`font-sansBold text-lg ${
                pressed ? "text-slate-900" : "text-slate-50"
              }`}
            >
              Add
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
};

export default NoTransactionFound;
