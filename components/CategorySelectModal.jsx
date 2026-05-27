import React from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
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
      <View className="bg-white h-80 rounded-t-3xl border-t border-l border-r border-slate-200 p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-sansBold text-2xl text-slate-800">Select Category</Text>
          <CloseButton onPress={onClose} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {categories.map((category) => (
            <Pressable
              key={category.category_id}
              onPress={() => {
                onSelectCategory({
                  category_id: category.category_id,
                  name: category.category,
                  icon: category.icon,
                });
                onClose();
              }}
              className={`flex-row py-2 gap-2 rounded-md pl-3 active:bg-accent ${selectedCategory?.name == category.category ? "bg-blue-500" : "bg-slate-50"}`}
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
                          ? colors.slate[50]
                          : colors.blue[500]
                    }
                  />
                  <Text
                    className={`${pressed ? "text-black" : selectedCategory?.name == category.category ? "text-slate-50" : "text-slate-700"} font-sansMed text-xl `}
                  >
                    {category.category}
                  </Text>
                </>
              )}
            </Pressable>
          ))}
          {isCategoriesLoading && categories.length === 0 ? (
            <View className="items-center py-4">
              <ActivityIndicator color={colors.blue[500]} />
            </View>
          ) : categories.length === 0 ? (
            <Pressable
              onPress={() => {
                onClose();
                onAddCategoryPress();
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
  );
};

export default CategorySelectModal;
