import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useRouter, useNavigation } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import Modal from "react-native-modal";

import CardTitle from "@/components/CardTitle";
import FieldInputBox from "@/components/FieldInputBox";
import CirclePressable from "@/components/pressables/CirclePressable";
import BluePressable from "@/components/pressables/BluePressable";

const CATEGORY_ICONS = [
  { id: "food", name: "Foods & Drinks", icon: "fast-food" },
  { id: "shopping", name: "Shopping", icon: "cart" },
  { id: "transportation", name: "Transportation", icon: "car" },
  { id: "entertainment", name: "Entertainment", icon: "film" },
  { id: "bills", name: "Bills", icon: "receipt" },
  { id: "income", name: "Income", icon: "cash" },
  { id: "gym", name: "Gym", icon: "fitness-sharp" },
  { id: "other", name: "Other", icon: "ellipsis-horizontal" },
];

const CreateScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useUser();
  // <Ionicons name="car"/>
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState("₹");

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleCreate = async () => {
    if (!title.trim())
      return Alert.alert("Error", "Please enter a transaction title");
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error, Please enter a a valid amount");
      return;
    }
    if (!selectedCategory)
      return Alert.alert("Error", "Please select a category");
    setIsLoading(true);
    try {
      const formattedAmount = isExpense
        ? -Math.abs(parseFloat(amount))
        : Math.abs(parseFloat(amount));

      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username || user.fullName || user.firstName,
          email:
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress,
          title,
          amount: formattedAmount,
          category: selectedCategory.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(
          errorData.error || "Failed to create transaction entry",
        );
      }

      Alert.alert("Success", "Transaction created successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create transaction");
      console.log("Error creating transaction", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Full Container
    <View className="flex-1 bg-background">
      {/* Top Navigator */}
      <View className="flex-row items-center justify-between mx-6 my-3 pb-3 border-b-2 border-slate-300">
        <CirclePressable name={"arrow-back"} onPress={() => {
          if (navigation.canGoBack()) {
            router.back();
          } else {
            router.replace("/");
          }
        }} />
        <Text className="font-sansBold color-slate-500 text-2xl">
          New Transaction
        </Text>
        {/* <TouchableOpacity
          className={`flex-row items-center pl-6 pr-3 py-3 gap-2 rounded-full ${isLoading ? "bg-slate-500" : "bg-blue-500 active:bg-accent"}  `}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text className="font-sansMed color-slate-50 text-xl">
            {isLoading ? "Saving..." : "Save"}
          </Text>
          <Ionicons name="checkmark" color="white" size={25} />
        </TouchableOpacity> */}
        <BluePressable name={"checkmark"} text={"Save"} direction="right" loadingText="Saving..." onPress={handleCreate} isLoading={isLoading} />
      </View>
      {/* Card */}
      <View className="flex p-6 mx-5 bg-slate-50 gap-6 rounded-2xl border border-slate-400 border-dashed">
        {/* Expense Income button */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center p-3 py-4 ${isExpense ? " bg-slate-700" : "bg-slate-50 border border-slate-400"} rounded-full active:bg-accent`}
            onPress={() => setIsExpense(true)}
          >
            <Ionicons
              name="pricetag"
              size={18}
              color={isExpense ? "white" : "red"}
            />
            <Text
              className={`font-sansMed text-xl ml-4 ${isExpense ? "text-white ml-4" : " text-slate-700"} `}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center p-3 py-4 ${!isExpense ? " bg-slate-700" : "bg-slate-50 border border-slate-400"} rounded-full active:bg-accent`}
            onPress={() => setIsExpense(false)}
          >
            <Ionicons
              name="cash"
              size={18}
              color={!isExpense ? "white" : "#22c55e"}
            />
            <Text
              className={`font-sansMed text-xl ml-4 ${!isExpense ? "text-white ml-4" : " text-slate-700"} `}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
        {/* Amount */}
        <View className="flex-row gap-3 items-center border-b border-b-slate-400">
          <Text className="font-sansBold text-5xl color-slate-700 leading-tight">
            {currency}
          </Text>
          <TextInput
            className="flex-1 font-sansBold text-5xl leading-tight h-20"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.slate[400]}
            keyboardType="numeric"
            style={{ paddingVertical: 0, includeFontPadding: false }}
          />
        </View>
        {/* Transaction Title */}
        <CardTitle name={"ticket-outline"} title={"Title"} />
        <FieldInputBox
          value={title}
          onChangeText={setTitle}
          placeholder="Transaction title"
        />
        {/* Category Heading*/}
        <CardTitle name={"pricetag-outline"} title={"Category"} />
        {/* Category Icons */}
        <Pressable
          onPress={toggleModal}
          className="flex-row items-center justify-center gap-4 border border-slate-400 bg-slate-50 active:bg-slate-300 py-3 rounded-full"
        >
          {({ pressed }) => (
            <>
              {selectedCategory ? (
                <Ionicons name={selectedCategory.icon} size={22} color={pressed ? colors.slate[600] : selectedCategory ? (isExpense ? colors.red[500] : colors.green[500]) : colors.slate[50]} />
              ) : null}
              <Text selectable={false} className={`font-sansMed ${pressed ? "text-slate-600" : (selectedCategory ? "text-slate-600" : "text-slate-400")} text-center text-lg`}>
                {selectedCategory ? selectedCategory.name : "Select Category"}
              </Text>
            </>
          )}
        </Pressable>
      </View>
      <View>
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={toggleModal}
          backdropColor="transparent"
          animationIn="slideInUp"
          animationOut="slideOutDown"
          useNativeDriver={true}
          useNativeDriverForBackdrop={true}
          backdropTransitionInTiming={300} // Prevents backdrop flicker
          backdropTransitionOutTiming={300} // Prevents backdrop flicker
          // animationInTiming={600}      // Duration of the slide up (in ms)
          animationOutTiming={1000}     // Duration of the slide down (in ms)
          style={{ justifyContent: "flex-end", margin: 0 }}
        >
          <View className="bg-slate-50 h-64 rounded-t-3xl border-t border-l border-r border-t-slate-400 border-l-slate-400 border-r-slate-400 p-4">
            {/* <TouchableOpacity onPress={toggleModal}>
              </TouchableOpacity> */}
            <ScrollView showsVerticalScrollIndicator={false} className="">
              {CATEGORY_ICONS.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    setSelectedCategory(category);
                    toggleModal()
                  }}
                  className={`flex-row py-2 gap-2 rounded-md pl-3 ${selectedCategory?.name == category.name ? "bg-blue-500" : "bg-slate-50"}`}
                >
                  <Ionicons
                    name={category.icon}
                    size={20}
                    color={selectedCategory?.name == category.name ? colors.slate[50] : colors.blue[500]}
                  />
                  <Text className={`${selectedCategory?.name == category.name ? "text-slate-50" : "text-slate-700"} font-sansMed text-xl `}>{category.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default CreateScreen;
