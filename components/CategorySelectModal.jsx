import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import AppPressable from "@/components/pressables/AppPressable";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import CloseButton from "./CloseButton";
import { DEFAULT_CATEGORY_ICON } from "@/constants/categoryIcons";

const CategorySelectModal = ({
  isVisible,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  isCategoriesLoading,
  onAddCategoryPress,
}) => {
  const { colors } = useTheme();
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
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
      <View className="bg-card h-80 rounded-t-3xl border-t border-l border-r border-borderSubtle p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-sansBold text-2xl text-textMain">Select Category</Text>
          <CloseButton onPress={onClose} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {categories.map((category) => (
            <AppPressable
              key={category.category_id}
              onPress={() => {
                onSelectCategory({
                  category_id: category.category_id,
                  name: category.category,
                  icon: category.icon,
                });
                onClose();
              }}
              className={`flex-row py-2 gap-2 rounded-md pl-3 ${selectedCategory?.name == category.category ? "bg-primary" : "bg-surface"}`}
            >
              {({ pressed }) => (
                <>
                  <Ionicons
                    name={category.icon || DEFAULT_CATEGORY_ICON}
                    size={20}
                    color={
                      pressed
                        ? "black"
                        : selectedCategory?.name == category.category
                          ? '#ffffff'
                          : colors.primary
                    }
                  />
                  <Text
                    className={`${pressed ? "text-black" : selectedCategory?.name == category.category ? "text-white" : "text-textMain"} font-sansMed text-xl `}
                  >
                    {category.category}
                  </Text>
                </>
              )}
            </AppPressable>
          ))}
          {isCategoriesLoading && categories.length === 0 ? (
            <View className="items-center py-4">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : categories.length === 0 ? (
            <AppPressable
              onPress={() => {
                onClose();
                onAddCategoryPress();
              }}
              className="items-center py-4"
            >
              {({ pressed }) => (
                <Text
                  className={`font-sansMed ${pressed ? "text-textMuted" : "text-primary"}`}
                >
                  Add a category first
                </Text>
              )}
            </AppPressable>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default CategorySelectModal;
