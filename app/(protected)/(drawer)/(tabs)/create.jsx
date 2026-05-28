import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  Pressable,
  Animated,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { useRouter, useNavigation } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "@/constants/api";
import { Ionicons, Feather } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import CardTitle from "@/components/CardTitle";
import FieldInputBox from "@/components/FieldInputBox";
import CirclePressable from "@/components/pressables/CirclePressable";
import BluePressable from "@/components/pressables/BluePressable";
import PageLoader from "@/components/PageLoader";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { useTags } from "@/hooks/useTags";
import { DEFAULT_CATEGORY_ICON } from "@/constants/categoryIcons";
import CategorySelectModal from "@/components/CategorySelectModal";
import TagsSelectModal from "@/components/TagsSelectModal";
import DateSelectModal from "@/components/DateSelectModal";
import Ticket from "@/components/Ticket";

const CreateScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useUser();
  const { categories, isLoading: isCategoriesLoading, loadCategories } =
    useCategories(user);
  const { loadTags, tags, createTag, isSaving: isTagSaving } = useTags(user);
  const { loadData } = useTransactions();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currency] = useState("₹");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [isTagsModalVisible, setTagsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let toValue = 0;
    if (isTagsModalVisible) {
      toValue = -240;
    } else if (isModalVisible) {
      toValue = -38;
    } else if (isCalendarModalVisible) {
      toValue = 0;
    }

    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isModalVisible, isCalendarModalVisible, isTagsModalVisible]);

  const resetForm = useCallback(() => {
    setTitle("");
    setAmount("");
    setSelectedCategory(null);
    setIsExpense(true);
    setDate(new Date().toISOString().split("T")[0]);
    setSelectedTags([]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadTags();
    }, [loadCategories, loadTags]),
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
          tag_ids: selectedTags.map((tag) => tag.tag_id),
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
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
        <Ticket
          borderColor="#94a3b8"
          style={{ transform: [{ translateY: slideAnim }] }}
          className="mx-5 gap-4"
          perforationRadius={5}
          cornerRadius={16}
          cornerType="cutout"
          semicircleRadius={16}
          topTicketView={
            <>
              {/* Grouped type selector and amount to reduce gap */}
              <View className="gap-2">
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className={`flex-1 flex-row items-center justify-center p-2 py-3 ${isExpense ? " bg-slate-700" : "bg-slate-50 border border-slate-400"} rounded-full active:bg-accent`}
                    onPress={() => setIsExpense(true)}
                  >
                    <Ionicons
                      name="pricetag"
                      size={16}
                      color={isExpense ? "white" : "red"}
                    />
                    <Text
                      className={`font-sansMed text-lg ml-2 ${isExpense ? "text-white ml-2" : " text-slate-700"} `}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 flex-row items-center justify-center p-2 py-3 ${!isExpense ? " bg-slate-700" : "bg-slate-50 border border-slate-400"} rounded-full active:bg-accent`}
                    onPress={() => setIsExpense(false)}
                  >
                    <Ionicons
                      name="cash"
                      size={16}
                      color={!isExpense ? "white" : "#22c55e"}
                    />
                    <Text
                      className={`font-sansMed text-lg ml-2 ${!isExpense ? "text-white ml-2" : " text-slate-700"} `}
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
                    className="flex-1 font-sansBold text-5xl leading-tight h-16"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.slate[400]}
                    keyboardType="numeric"
                    style={{ paddingVertical: 0, includeFontPadding: false }}
                  />
                </View>
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

              <CardTitle name={"Pencil"} title={"Title"} library="Lucide" />
              <FieldInputBox
                value={title}
                onChangeText={setTitle}
                placeholder="Transaction title"
              />
              <CardTitle name={"layers-outline"} title={"Category"} />
              <Pressable
                onPress={toggleModal}
                className="flex-row items-center justify-center gap-4 border border-slate-400 bg-slate-50 active:bg-slate-200 py-3 rounded-full"
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
            </>
          }
          bottomTicketView={
            <>
              {/* Lower Ticket Section: Tags */}
              {selectedTags.length === 0 && (
                <CardTitle name={"pricetags-outline"} title={"Tags"} />
              )}
              {selectedTags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 items-center mb-3">
                  {selectedTags.map((tag) => (
                    <View
                      key={tag.tag_id}
                      style={{ backgroundColor: `${tag.color}35`, borderColor: tag.color }}
                      className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border"
                    >
                      <Text className="font-sansBold text-xs text-slate-800">
                        {tag.tag_name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedTags((prev) => prev.filter((t) => t.tag_id !== tag.tag_id))}
                      >
                        <Ionicons name="close-circle" size={14} color={colors.slate[500]} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {selectedTags.length < 5 && (
                <Pressable
                  onPress={() => setTagsModalVisible(true)}
                  className="flex-row items-center justify-center gap-4 border border-slate-400 bg-slate-50 active:bg-slate-200 py-3 rounded-full"
                >
                  {({ pressed }) => (
                    <Text
                      selectable={false}
                      className={`font-sansMed ${pressed ? "text-slate-600" : "text-slate-400"} text-center text-lg`}
                    >
                      Add Tag
                    </Text>
                  )}
                </Pressable>
              )}
            </>
          }
        />

        {/* Actions Footer - Positioned Outside Ticket Card */}
        <View className="flex-row justify-between items-center mx-10 mt-4">
          <Pressable onPress={() => router.push("/category")}>
            {({ pressed }) => (
              <Text
                className={`font-sansMed ${pressed ? "text-slate-500" : "text-blue-600"}`}
              >
                Manage categories
              </Text>
            )}
          </Pressable>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Reset Form",
                "Are you sure you want to reset the form?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => {
                      resetForm();
                    },
                  },
                ],
              );
            }}
            className="active:opacity-50 p-1 -mr-1"
          >
            <Feather name="refresh-cw" size={22} color={colors.red[500]} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <CategorySelectModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isCategoriesLoading={isCategoriesLoading}
        onAddCategoryPress={() => router.push("/category")}
      />

      <TagsSelectModal
        isVisible={isTagsModalVisible}
        onClose={() => setTagsModalVisible(false)}
        tags={tags}
        selectedTags={selectedTags}
        onSelectTags={setSelectedTags}
        createTag={createTag}
        isSavingTag={isTagSaving}
      />

      <DateSelectModal
        isVisible={isCalendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
        date={date}
        onSelectDate={setDate}
      />
    </View>
  );
};

export default CreateScreen;
