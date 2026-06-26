import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  LayoutAnimation,
  findNodeHandle,
  Easing,
  Platform,
} from "react-native";
import AppPressable from "@/components/pressables/AppPressable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SafeScreen from "@/components/SafeScreen";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { useRouter, useNavigation } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router/react-navigation";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { MenuView } from "@expo/ui/community/menu";
import { API_URL } from "@/constants/api";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import CardTitle from "@/components/CardTitle";
import FieldInputBox from "@/components/FieldInputBox";
import NestedTopBar from "@/components/NestedTopBar";
import BluePressable from "@/components/pressables/BluePressable";
import PageLoader from "@/components/PageLoader";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { useTags } from "@/hooks/useTags";
import { DEFAULT_CATEGORY_ICON } from "@/constants/categoryIcons";
import { CategorySelectModal, DateSelectModal } from "@/components/modals";
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

const CreateScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useUser();
  const { colors } = useTheme();
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
  const [tagQuery, setTagQuery] = useState("");
  const [isTagFocused, setIsTagFocused] = useState(false);
  const scrollViewRef = useRef(null);
  const tagInputRef = useRef(null);

  const slideAnim = useRef(new Animated.Value(isExpense ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isExpense ? 0 : 1,
      useNativeDriver: false,
      duration: 200,
      easing: Easing.linear,
    }).start();
  }, [isExpense]);

  const expenseBgTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'] // Slides out to the right (towards Income) when inactive
  });
  const expenseTextColor = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', colors.textMain]
  });
  const expenseActiveOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });
  const expenseInactiveOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const incomeBgTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', '0%'] // Slides in from the left (from Expense) when becoming active
  });
  const incomeTextColor = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMain, '#ffffff']
  });
  const incomeInactiveOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });
  const incomeActiveOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

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
        } else {
          Alert.alert("Tag Created", "Tag was created but could not be auto-selected because you have reached the 5-tag limit.");
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

  const prevAnimHeightRef = useRef(0);

  useEffect(() => {
    const id = dropdownHeightAnim.addListener(({ value }) => {
      const delta = value - prevAnimHeightRef.current;
      prevAnimHeightRef.current = value;
      if (Math.abs(delta) > 0.1) {
        const newY = scrollOffsetRef.current + delta;
        scrollOffsetRef.current = newY; // sync immediately, don't wait for onScroll
        scrollViewRef.current?.getScrollResponder()?.scrollTo({
          y: newY,
          animated: false,
        });
      }
    });
    return () => dropdownHeightAnim.removeListener(id);
  }, []);

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

  const handleCreate = async () => {
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
    <SafeScreen>
      <NestedTopBar
        title="New Transaction"
        onBack={() => router.back()}
        rightElement={
          <BluePressable
            name={"checkmark"}
            text={"Save"}
            direction="right"
            loadingText="Saving..."
            onPress={handleCreate}
            isLoading={isLoading}
          />
        }
      />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={false}
        enableOnAndroid={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
          <Ticket
            borderColor={colors.border}
            className="mx-6 gap-4"
            perforationRadius={5}
            cornerRadius={16}
            cornerType="cutout"
            semicircleRadius={16}
            dividerAccessory={
              <View className="p-1">
                <Ionicons name="star" size={20} color={colors.accent} />
              </View>
            }
            dividerLeftAccessory={
              Platform.OS === 'ios' ? (
                <MenuView
                  title="Are you sure you want to reset the form?"
                  onPressAction={({ nativeEvent }) => {
                    if (nativeEvent.event === 'reset') {
                      resetForm();
                    }
                  }}
                  actions={[
                    {
                      id: 'reset',
                      title: 'Reset Form',
                      image: 'arrow.clockwise',
                      attributes: {
                        destructive: true,
                      },
                    },
                  ]}
                >
                  <View className="active:opacity-50 p-1">
                    <Feather name="refresh-cw" size={20} color={colors.red} strokeWidth={2.5} />
                  </View>
                </MenuView>
              ) : (
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
                  className="active:opacity-50 p-1"
                >
                  <Feather name="refresh-cw" size={20} color={colors.red} strokeWidth={2.5} />
                </TouchableOpacity>
              )
            }
          topTicketView={
            <>
            {/* <View> */}
              {/* Grouped type selector and amount to reduce gap */}
              <View className="gap-2">
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center p-2 py-3 bg-surface border border-border rounded-full active:opacity-70 overflow-hidden relative"
                      onPress={() => setIsExpense(true)}
                    >
                      <Animated.View 
                        className="absolute inset-0 bg-segmentedControl" 
                        style={{ transform: [{ translateX: expenseBgTranslate }] }} 
                      />
                      <View style={{ width: 16, height: 16, justifyContent: 'center', alignItems: 'center' }}>
                        <Animated.View style={{ position: 'absolute', opacity: expenseInactiveOpacity }}>
                          <Ionicons name="pricetag" size={16} color="red" />
                        </Animated.View>
                        <Animated.View style={{ position: 'absolute', opacity: expenseActiveOpacity }}>
                          <Ionicons name="pricetag" size={16} color="white" />
                        </Animated.View>
                      </View>
                      <Animated.Text
                        className="font-sansMed text-lg ml-2"
                        style={{ color: expenseTextColor }}
                      >
                        Expense
                      </Animated.Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center p-2 py-3 bg-surface border border-border rounded-full active:opacity-70 overflow-hidden relative"
                      onPress={() => setIsExpense(false)}
                    >
                      <Animated.View 
                        className="absolute inset-0 bg-segmentedControl" 
                        style={{ transform: [{ translateX: incomeBgTranslate }] }} 
                      />
                      <View style={{ width: 16, height: 16, justifyContent: 'center', alignItems: 'center' }}>
                        <Animated.View style={{ position: 'absolute', opacity: incomeInactiveOpacity }}>
                          <Ionicons name="cash" size={16} color="#22c55e" />
                        </Animated.View>
                        <Animated.View style={{ position: 'absolute', opacity: incomeActiveOpacity }}>
                          <Ionicons name="cash" size={16} color="white" />
                        </Animated.View>
                      </View>
                      <Animated.Text
                        className="font-sansMed text-lg ml-2"
                        style={{ color: incomeTextColor }}
                      >
                        Income
                      </Animated.Text>
                    </TouchableOpacity>
                  </View>
                <View className="flex-row gap-3 items-center border-b border-b-border">
                  <Text className="font-sansBold text-5xl text-textMain leading-tight">
                    {currency}
                  </Text>
                  <TextInput
                    className="flex-1 font-sansBold text-5xl leading-tight h-16"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    style={{ paddingVertical: 0, includeFontPadding: false }}
                  />
                </View>
              </View>

              <CardTitle title={"Date"} />
              {Platform.OS === 'ios' ? (
                <View className="flex-row items-center justify-between border border-border bg-surface py-2 px-5 rounded-full">
                  <View className="flex-row items-center gap-4">
                    <Ionicons name="calendar" size={22} color={colors.primary} />
                    <Text className="font-sansMed text-textMain text-lg">Date</Text>
                  </View>
                  <DateTimePicker
                    value={(() => {
                      const [year, month, day] = date.split('-').map(Number);
                      return new Date(year, month - 1, day);
                    })()}
                    onValueChange={(event, newDate) => {
                      if (newDate) {
                        const yyyy = newDate.getFullYear();
                        const mm = String(newDate.getMonth() + 1).padStart(2, '0');
                        const dd = String(newDate.getDate()).padStart(2, '0');
                        setDate(`${yyyy}-${mm}-${dd}`);
                      }
                    }}
                    mode="date"
                    display="compact"
                    style={{ width: 110, height: 34 }}
                  />
                </View>
              ) : (
                <AppPressable
                  onPress={() => setCalendarModalVisible(true)}
                  activeClassName="active:bg-borderSubtle"
                  className="flex-row items-center gap-4 border border-border bg-surface py-3 px-5 rounded-full"
                >
                  <Ionicons
                    name="calendar"
                    size={22}
                    color={colors.primary}
                  />
                  <Text className="font-sansMed text-textMain text-lg">
                    {date}
                  </Text>
                </AppPressable>
              )}

              <CardTitle title={"Title"} />
              <FieldInputBox
                value={title}
                onChangeText={setTitle}
                placeholder="Transaction title"
              />
              <CardTitle title={"Category"} />
              <AppPressable
                onPress={toggleModal}
                activeClassName="active:bg-borderSubtle"
                className="flex-row items-center justify-center gap-4 border border-border bg-surface py-3 rounded-full"
              >
                {({ pressed }) => (
                  <>
                    <Ionicons
                      name={selectedCategory ? (selectedCategory.icon || DEFAULT_CATEGORY_ICON) : "layers-outline"}
                      size={22}
                      color={
                        pressed
                          ? colors.textMain
                          : selectedCategory
                            ? (isExpense ? colors.red : colors.green)
                            : colors.textMuted
                      }
                    />
                    <Text
                      selectable={false}
                      className={`font-sansMed ${pressed ? "text-textMain" : selectedCategory ? "text-textMain" : "text-textMuted"} text-lg`}
                    >
                      {selectedCategory ? selectedCategory.name : "Select Category"}
                    </Text>
                  </>
                )}
              </AppPressable>
              {/* </View> */}
            </>
          }
          bottomTicketView={
            <>
              {/* Lower Ticket Section: Tags */}
              <View className="flex-row justify-between items-center pr-2">
                <CardTitle title={"Tags"} />
              </View>
              {selectedTags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 items-center mt-1 mb-1">
                  {selectedTags.map((tag) => (
                    <View
                      key={tag.tag_id}
                      style={{ backgroundColor: tag.color, borderColor: colors.borderSubtle, borderWidth: 1 }}
                      className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                    >
                      <Text className="font-sansBold text-xs text-textMain">
                        {tag.tag_name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedTags((prev) => prev.filter((t) => t.tag_id !== tag.tag_id))}
                      >
                        <Ionicons name="close-circle" size={14} color={colors.textMain} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Suggestions list inline above input box */}
              <View className="z-10 -mt-2">
                <Animated.View
                  style={{
                    height: dropdownHeightAnim,
                    maxHeight: 147,
                    opacity: tagDropdownAnim,
                    marginBottom: tagDropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 12]
                    }),
                    borderWidth: tagDropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1]
                    }),
                  }}
                  className="border-borderSubtle rounded-lg bg-card overflow-hidden"
                >
                  <ScrollView
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={handleContentSizeChange}
                  >
                    {/* Create tag option */}
                    {cleanedTagQuery.length > 0 && !tagQueryExists && !isTagSaving && (
                      <AppPressable
                        onPress={handleCreateTagOnTheFly}
                        activeClassName="active:bg-borderSubtle"
                        className="flex-row items-center gap-2 p-3 border-b border-borderSubtle bg-surface"
                      >
                        <Ionicons name="add-circle" size={18} color={colors.primary} />
                        <Text className="font-sansBold text-base text-primary">
                          Create tag "{cleanedTagQuery}"
                        </Text>
                      </AppPressable>
                    )}

                    {/* Suggestions list */}
                    {filteredTags.map((tag) => (
                      <AppPressable
                        key={tag.tag_id}
                        onPress={() => handleSelectTag(tag)}
                        style={{ backgroundColor: tag.color }}
                        activeClassName="active:opacity-75"
                        className="flex-row items-center p-3 border-b border-white/50"
                      >
                        <Text className="font-sansBold text-base text-textMain">
                          {tag.tag_name}
                        </Text>
                      </AppPressable>
                    ))}
                  </ScrollView>
                </Animated.View>

                {selectedTags.length < 5 && (
                  <View className="mt-1">
                    <View className="flex-row border border-border rounded-lg px-4 py-4 bg-surface items-center">
                      <Ionicons name="pricetag-outline" color={colors.textMuted} size={22} />
                      <TextInput
                        ref={tagInputRef}
                        className="flex-1 ml-6 font-sansMed text-xl leading-tight"
                        placeholder="Add tag..."
                        placeholderTextColor={colors.textMuted}
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
                          // Small delay so taps on suggestion list are registered before blur hides it
                          setTimeout(() => setIsTagFocused(false), 200);
                        }}
                        style={{ paddingVertical: 0, includeFontPadding: false }}
                      />
                    </View>
                  </View>
                )}
              </View>
            </>
          }
        />

        {/* Actions Footer - Positioned Outside Ticket Card */}
        <View className="mt-4" />
      </KeyboardAwareScrollView>
      <CategorySelectModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
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
    </SafeScreen>
  );
};

export default CreateScreen;
