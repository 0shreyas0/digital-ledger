import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  Pressable,
  Animated,
  ScrollView,
  LayoutAnimation,
  findNodeHandle,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
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
import DateSelectModal from "@/components/DateSelectModal";
import Ticket from "@/components/Ticket";

const PASTEL_PALETTE = [
  "#FFC6FF", // Pastel Pink
  "#BDB2FF", // Pastel Purple/Lavender
  "#A0C4FF", // Pastel Blue
  "#9BF6FF", // Pastel Teal/Mint
  "#CAFFBF", // Pastel Green
  "#FDFFB6", // Pastel Yellow
  "#FFD6A5", // Pastel Peach/Orange
];

const EditScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  
  const { categories, isLoading: isCategoriesLoading, loadCategories } = useCategories(user);
  const { loadTags, tags, createTag, isSaving: isTagSaving } = useTags(user);
  const { transactions, loadData } = useTransactions();

  const [transaction, setTransaction] = useState(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currency] = useState("₹");
  const [date, setDate] = useState("");
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [isTagFocused, setIsTagFocused] = useState(false);
  
  const scrollViewRef = useRef(null);
  const tagInputRef = useRef(null);

  // Load Categories & Tags
  useEffect(() => {
    if (user) {
      loadCategories();
      loadTags();
    }
  }, [user]);

  // Find transaction to edit
  useEffect(() => {
    if (id && transactions.length > 0) {
      const txn = transactions.find(t => t.transaction_id === id || t.id === id);
      if (txn) {
        setTransaction(txn);
        setTitle(txn.title || "");
        
        const absAmount = Math.abs(parseFloat(txn.amount));
        setAmount(isNaN(absAmount) ? "" : absAmount.toString());
        
        setIsExpense(parseFloat(txn.amount) < 0);
        
        const txnDateStr = typeof txn.date === "string" 
          ? txn.date.split("T")[0] 
          : new Date(txn.date).toISOString().split("T")[0];
        setDate(txnDateStr);

        // Normalize tags to { tag_id, tag_name, color }
        const normalizedTags = txn.tags ? txn.tags.map(t => ({
          tag_id: t.id,
          tag_name: t.name,
          color: t.color
        })) : [];
        setSelectedTags(normalizedTags);

        // Find and select category
        if (categories && categories.length > 0) {
          const matched = categories.find(c => c.name === txn.category);
          if (matched) setSelectedCategory(matched);
        }
      }
    }
  }, [id, transactions, categories]);

  const toggleModal = () => {
    setModalVisible((currentValue) => !currentValue);
  };

  const handleSelectTag = (tag) => {
    if (selectedTags.some((t) => t.tag_id === tag.tag_id)) {
      setSelectedTags(selectedTags.filter((t) => t.tag_id !== tag.tag_id));
    } else {
      if (selectedTags.length >= 5) {
        Alert.alert("Limit Reached", "You can only select up to 5 tags.");
        return;
      }
      setSelectedTags([...selectedTags, tag]);
    }
    setTagQuery("");
  };

  const handleCreateTagOnTheFly = async () => {
    const cleaned = tagQuery.trim();
    if (!cleaned) return;
    const randomColor = PASTEL_PALETTE[Math.floor(Math.random() * PASTEL_PALETTE.length)];
    try {
      const created = await createTag({
        tag_name: cleaned,
        color: randomColor,
      });
      if (created) {
        setTagQuery("");
        if (selectedTags.length < 5) {
          setSelectedTags([...selectedTags, created]);
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create tag");
    }
  };

  const cleanedTagQuery = tagQuery.trim();
  const filteredTags = tags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(cleanedTagQuery.toLowerCase()) &&
    !selectedTags.some((t) => t.tag_id === tag.tag_id)
  );
  const tagQueryExists = tags.some(
    (tag) => tag.tag_name.toLowerCase() === cleanedTagQuery.toLowerCase()
  );

  const shouldShowDropdown = isTagFocused && cleanedTagQuery.length > 0 && (filteredTags.length > 0 || (!tagQueryExists && !isTagSaving));
  const tagDropdownAnim = useRef(new Animated.Value(0)).current;
  const dropdownHeightAnim = useRef(new Animated.Value(0)).current;
  const contentHeightRef = useRef(0);
  const scrollOffsetRef = useRef(0);

  const handleScroll = (event) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  };

  const handleContentSizeChange = useCallback((w, h) => {
    const isListEmpty = filteredTags.length === 0 && !(!tagQueryExists && !isTagSaving && cleanedTagQuery.length > 0);
    const targetHeight = isListEmpty ? 0 : Math.min(147, h);
    contentHeightRef.current = targetHeight;
    if (shouldShowDropdown) {
      Animated.timing(dropdownHeightAnim, {
        toValue: targetHeight,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [shouldShowDropdown, filteredTags, tagQueryExists, isTagSaving, cleanedTagQuery]);

  useEffect(() => {
    const targetHeight = shouldShowDropdown ? contentHeightRef.current : 0;

    Animated.timing(tagDropdownAnim, {
      toValue: shouldShowDropdown ? 1 : 0,
      duration: shouldShowDropdown ? 200 : 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(dropdownHeightAnim, {
      toValue: targetHeight,
      duration: shouldShowDropdown ? 200 : 300,
      useNativeDriver: false,
    }).start();
  }, [shouldShowDropdown]);

  const handleSave = async () => {
    if (!title.trim()) {
      return Alert.alert("Error", "Please enter a transaction title");
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
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

      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
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
        throw new Error(errorData.message || "Failed to update transaction");
      }

      await loadData(true);
      Alert.alert("Success", "Transaction updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      "Discard Changes?",
      "Are you sure you want to discard your changes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  };

  if (!transaction) return <PageLoader />;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between mx-6 my-3 pb-3 border-b-2 border-slate-300">
        <CirclePressable
          name={"arrow-back"}
          onPress={handleBackPress}
        />
        <Text className="font-sansBold color-slate-500 text-2xl">
          Edit Transaction
        </Text>
        <BluePressable
          name={"checkmark"}
          text={"Save"}
          direction="right"
          loadingText="Saving..."
          onPress={handleSave}
          isLoading={isLoading}
        />
      </View>
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={false}
        enableOnAndroid={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Ticket
          borderColor="#94a3b8"
          className="mx-5 gap-4"
          perforationRadius={5}
          cornerRadius={16}
          cornerType="cutout"
          semicircleRadius={16}
          topTicketView={
            <>
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

              <CardTitle title={"Date"} />
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

              <CardTitle title={"Title"} />
              <FieldInputBox
                value={title}
                onChangeText={setTitle}
                placeholder="Transaction title"
              />
              <CardTitle title={"Category"} />
              <Pressable
                onPress={toggleModal}
                className="flex-row items-center justify-center gap-4 border border-slate-400 bg-slate-50 active:bg-slate-200 py-3 rounded-full"
              >
                {({ pressed }) => (
                  <>
                    <Text
                      selectable={false}
                      className={`font-sansMed ${pressed ? "text-slate-600" : selectedCategory ? "text-slate-600" : "text-slate-400"} text-lg`}
                    >
                      {selectedCategory ? selectedCategory.name : "Select Category"}
                    </Text>
                    <Ionicons
                      name={selectedCategory ? (selectedCategory.icon || DEFAULT_CATEGORY_ICON) : "layers-outline"}
                      size={22}
                      color={
                        pressed
                          ? colors.slate[600]
                          : selectedCategory
                            ? (isExpense ? colors.red[500] : colors.green[500])
                            : colors.slate[400]
                      }
                    />
                  </>
                )}
              </Pressable>
            </>
          }
          bottomTicketView={
            <>
              <CardTitle title={"Tags"} />
              {selectedTags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 items-center mt-1 mb-1">
                  {selectedTags.map((tag) => (
                    <View
                      key={tag.tag_id}
                      style={{ backgroundColor: tag.color, borderColor: colors.slate[300], borderWidth: 1 }}
                      className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                    >
                      <Text className="font-sansBold text-xs text-slate-800">
                        {tag.tag_name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedTags((prev) => prev.filter((t) => t.tag_id !== tag.tag_id))}
                      >
                        <Ionicons name="close-circle" size={14} color={colors.slate[800]} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <Animated.View
                style={{
                  height: dropdownHeightAnim,
                  maxHeight: 147,
                  opacity: tagDropdownAnim,
                  marginBottom: 12,
                  borderWidth: 1,
                }}
                className="border-slate-300 rounded-lg bg-white overflow-hidden"
              >
                <ScrollView
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  onContentSizeChange={handleContentSizeChange}
                >
                  {cleanedTagQuery.length > 0 && !tagQueryExists && !isTagSaving && (
                    <Pressable
                      onPress={handleCreateTagOnTheFly}
                      className="flex-row items-center gap-2 p-3 border-b border-slate-100 bg-blue-50 active:bg-blue-100"
                    >
                      <Ionicons name="add-circle" size={18} color={colors.blue[500]} />
                      <Text className="font-sansBold text-base text-blue-600">
                        Create tag "{cleanedTagQuery}"
                      </Text>
                    </Pressable>
                  )}

                  {filteredTags.map((tag) => (
                    <Pressable
                      key={tag.tag_id}
                      onPress={() => handleSelectTag(tag)}
                      style={{ backgroundColor: tag.color }}
                      className="flex-row items-center p-3 border-b border-white/50 active:opacity-75"
                    >
                      <Text className="font-sansBold text-base text-slate-800">
                        {tag.tag_name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </Animated.View>

              {selectedTags.length < 5 && (
                <View className="z-10 gap-3">
                  <View className="flex-row border border-slate-400 rounded-lg px-4 py-4 bg-slate-50 items-center">
                    <Ionicons name="pricetag-outline" color={colors.slate[500]} size={22} />
                    <TextInput
                      ref={tagInputRef}
                      className="flex-1 ml-6 font-sansMed text-xl leading-tight"
                      placeholder="Add tag..."
                      placeholderTextColor={colors.slate[400]}
                      value={tagQuery}
                      onChangeText={setTagQuery}
                      onFocus={() => {
                        setIsTagFocused(true);
                        setTimeout(() => {
                          scrollViewRef.current?.scrollToFocusedInput(
                            findNodeHandle(tagInputRef.current)
                          );
                        }, 150);
                      }}
                      onBlur={() => {
                        setTimeout(() => setIsTagFocused(false), 200);
                      }}
                      style={{ paddingVertical: 0, includeFontPadding: false }}
                    />
                  </View>
                </View>
              )}
            </>
          }
        />
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

      <DateSelectModal
        isVisible={isCalendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
        date={date}
        onSelectDate={setDate}
      />
    </View>
  );
};

export default EditScreen;
