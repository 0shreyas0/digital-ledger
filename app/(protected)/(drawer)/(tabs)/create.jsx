import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { useRouter, useNavigation } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import colors from "tailwindcss/colors";
import Modal from "react-native-modal";
import CardTitle from "@/components/CardTitle";
import FieldInputBox from "@/components/FieldInputBox";
import CirclePressable from "@/components/pressables/CirclePressable";
import BluePressable from "@/components/pressables/BluePressable";
import CloseButton from "@/components/CloseButton";
import PageLoader from "@/components/PageLoader";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { DEFAULT_CATEGORY_ICON } from "@/constants/categoryIcons";

const CreateScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useUser();
  const { categories, isLoading: isCategoriesLoading, loadCategories } =
    useCategories(user);
  const { loadData } = useTransactions();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currency] = useState("₹");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isModalVisible || isCalendarModalVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isModalVisible, isCalendarModalVisible]);

  const resetForm = useCallback(() => {
    setTitle("");
    setAmount("");
    setSelectedCategory(null);
    setIsExpense(true);
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      // Optional: Clear form on focus if you want it always fresh when switching tabs
      // resetForm(); 
    }, [loadCategories]),
  );

  const toggleModal = () => {
    setModalVisible((currentValue) => !currentValue);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      return Alert.alert("Error", "Please enter a transaction title");
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error, Please enter a a valid amount");
      return;
    }
    if (!selectedCategory) {
      return Alert.alert("Error", "Please select a category");
    }

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
          date,
          category: selectedCategory.name,
          category_id: selectedCategory.category_id,
          category_icon: selectedCategory.icon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(errorData);
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Failed to create transaction entry",
        );
      }

      // Refresh global context
      await loadData(true);
      
      Alert.alert("Success", "Transaction created successfully");
      resetForm();
      router.back();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create transaction");
      console.log("Error creating transaction", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove full-page loader to allow interaction while categories load
  // if (isCategoriesLoading) return <PageLoader />;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between mx-6 my-3 pb-3 border-b-2 border-slate-300">
        <CirclePressable
          name={"arrow-back"}
          onPress={() => {
            router.back();
          }}
        />
        <Text className="font-sansBold color-slate-500 text-2xl">
          New Transaction
        </Text>
        <BluePressable
          name={"checkmark"}
          text={"Save"}
          direction="right"
          loadingText="Saving..."
          onPress={handleCreate}
          isLoading={isLoading}
        />
      </View>
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={{ transform: [{ translateY: slideAnim }] }}
          className="flex p-6 mx-5 bg-slate-50 gap-6 rounded-2xl border border-slate-400 border-dashed"
        >
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

          <CardTitle name={"calendar-outline"} title={"Date"} />
          <Pressable
            onPress={() => setCalendarModalVisible(true)}
            className="flex-row items-center gap-4 border border-slate-400 bg-slate-50 active:bg-accent py-3 px-5 rounded-full"
          >
            <Ionicons
              name="calendar"
              size={22}
              color={colors.blue[500]}
            />
            <Text className="font-sansMed text-slate-600 text-lg">
              {date}
            </Text>
          </Pressable>

          <CardTitle name={"ticket-outline"} title={"Title"} />
          <FieldInputBox
            value={title}
            onChangeText={setTitle}
            placeholder="Transaction title"
          />
          <CardTitle name={"pricetag-outline"} title={"Category"} />
          <Pressable
            onPress={toggleModal}
            className="flex-row items-center justify-center gap-4 border border-slate-400 bg-slate-50 active:bg-accent py-3 rounded-full"
          >
            {({ pressed }) => (
              <>
                {selectedCategory ? (
                  <Ionicons
                    name={selectedCategory.icon || DEFAULT_CATEGORY_ICON}
                    size={22}
                    color={
                      pressed
                        ? colors.slate[600]
                        : isExpense
                          ? colors.red[500]
                          : colors.green[500]
                    }
                  />
                ) : null}
                <Text
                  selectable={false}
                  className={`font-sansMed ${pressed ? "text-slate-600" : selectedCategory ? "text-slate-600" : "text-slate-400"} text-center text-lg`}
                >
                  {selectedCategory ? selectedCategory.name : "Select Category"}
                </Text>
              </>
            )}
          </Pressable>
          <View className="flex-row justify-between items-center py-2">
            <Pressable onPress={() => router.push("/category")}>
              {({ pressed }) => (
                <Text
                  className={`font-sansMed ${pressed ? "text-slate-500" : "text-blue-600"}`}
                >
                  Manage categories
                </Text>
              )}
            </Pressable>
            <TouchableOpacity onPress={resetForm}>
              <Text className="font-sansMed text-red-500">Reset Form</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>
      <View>
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={toggleModal}
          backdropColor="transparent"
          animationIn="slideInUp"
          animationOut="slideOutDown"
          useNativeDriver={true}
          useNativeDriverForBackdrop={true}
          backdropTransitionInTiming={300}
          backdropTransitionOutTiming={300}
          animationOutTiming={300}
          style={{ justifyContent: "flex-end", margin: 0 }}
          avoidKeyboard={true}
        >
          <View className="bg-white h-96 rounded-t-3xl border-t border-l border-r border-slate-200 p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-sansBold text-2xl text-slate-800">Select Category</Text>
              <CloseButton onPress={toggleModal} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {categories.map((category) => (
                <Pressable
                  key={category.category_id}
                  onPress={() => {
                    setSelectedCategory({
                      category_id: category.category_id,
                      name: category.category,
                      icon: category.icon,
                    });
                    toggleModal();
                  }}
                  className={`flex-row py-2 gap-2 rounded-md pl-3 ${selectedCategory?.name == category.category ? "bg-blue-500" : "bg-slate-50"}`}
                >
                  <Ionicons
                    name={category.icon || DEFAULT_CATEGORY_ICON}
                    size={20}
                    color={
                      selectedCategory?.name == category.category
                        ? colors.slate[50]
                        : colors.blue[500]
                    }
                  />
                  <Text
                    className={`${selectedCategory?.name == category.category ? "text-slate-50" : "text-slate-700"} font-sansMed text-xl `}
                  >
                    {category.category}
                  </Text>
                </Pressable>
              ))}
              {isCategoriesLoading && categories.length === 0 ? (
                <View className="items-center py-4">
                  <ActivityIndicator color={colors.blue[500]} />
                </View>
              ) : categories.length === 0 ? (
                <Pressable
                  onPress={() => {
                    toggleModal();
                    router.push("/category");
                  }}
                  className="items-center py-4"
                >
                  {({ pressed }) => (
                    <Text
                      className={`font-sansMed ${pressed ? "text-slate-500" : "text-blue-600"}`}
                    >
                      Add a category first
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        </Modal>
      </View>

      <Modal
        isVisible={isCalendarModalVisible}
        onBackdropPress={() => setCalendarModalVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
        useNativeDriverForBackdrop={true}
        backdropTransitionInTiming={300}
        backdropTransitionOutTiming={300}
        animationOutTiming={300}
        avoidKeyboard={true}
      >
        <View className="bg-white rounded-t-3xl p-6 pb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-sansBold text-2xl text-slate-800">Select Date</Text>
            <CloseButton onPress={() => setCalendarModalVisible(false)} />
          </View>
          <Calendar
            current={date}
            onDayPress={(day) => {
              setDate(day.dateString);
              setCalendarModalVisible(false);
            }}
            markedDates={{
              [date]: { selected: true, selectedColor: colors.slate[700] },
            }}
            theme={{
              todayTextColor: colors.blue[600],
              arrowColor: colors.blue[600],
              monthTextColor: colors.slate[800],
              textDayFontFamily: "GoogleSans-Regular",
              textMonthFontFamily: "GoogleSans-Bold",
              textDayHeaderFontFamily: "GoogleSans-Medium",
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default CreateScreen;
