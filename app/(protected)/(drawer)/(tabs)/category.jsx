import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import colors from "tailwindcss/colors";
import CirclePressable from "@/components/pressables/CirclePressable";
import BluePressable from "@/components/pressables/BluePressable";
import PageLoader from "@/components/PageLoader";
import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORY_ICON,
} from "@/constants/categoryIcons";
import { useCategories } from "@/hooks/useCategories";

const Category = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useUser();
  const {
    categories,
    isLoading,
    isSaving,
    deletingCategoryId,
    loadCategories,
    createCategory,
    deleteCategory,
  } = useCategories(user);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_CATEGORY_ICON);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setCategoryName("");
    setSelectedIcon(DEFAULT_CATEGORY_ICON);
  };

  const toggleModal = () => {
    setIsModalVisible((currentValue) => !currentValue);
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      return Alert.alert("Error", "Please enter a category name");
    }

    try {
      await createCategory({
        category: categoryName,
        icon: selectedIcon,
      });
      resetForm();
      toggleModal();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create category");
    }
  };

  const handleDeleteCategory = (category) => {
    if (category.transaction_count > 0) {
      return Alert.alert(
        "Cannot Delete",
        "You cannot delete a category that already has transactions.",
      );
    }

    Alert.alert("Delete Category", `Delete ${category.category}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(category.category_id);
          } catch (error) {
            Alert.alert("Error", error.message || "Failed to delete category");
          }
        },
      },
    ]);
  };

  if (isLoading) return <PageLoader />;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between mx-6 my-3 pb-3 border-b-2 border-slate-300">
        <CirclePressable
          name={"arrow-back"}
          onPress={() => {
            if (navigation.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
        />
        <Text className="font-sansBold text-slate-500 text-2xl">Category</Text>
        <BluePressable name={"add"} text={"Add"} onPress={toggleModal} />
      </View>
      <View className="flex-1 mx-6">
        <FlatList
          data={categories}
          keyExtractor={(item) => item.category_id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, gap: 12 }}
          ListEmptyComponent={
            <View className="bg-slate-50 rounded-2xl border border-slate-300 p-5">
              <Text className="font-sansBold text-xl text-slate-700">
                No categories yet
              </Text>
              <Text className="font-sansReg text-slate-500 mt-2">
                Add your first category to use it while creating transactions.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between bg-slate-50 border border-slate-300 rounded-2xl px-4 py-4">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="bg-blue-100 rounded-full p-3">
                  <Ionicons
                    name={item.icon || DEFAULT_CATEGORY_ICON}
                    size={20}
                    color={colors.blue[600]}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-sansBold text-lg text-slate-700">
                    {item.category}
                  </Text>
                  <Text className="font-sansReg text-slate-500">
                    {item.transaction_count > 0
                      ? `${item.transaction_count} transactions`
                      : "No transactions yet"}
                  </Text>
                </View>
              </View>
              <CirclePressable
                name={"trash-outline"}
                disabled={deletingCategoryId === item.category_id}
                onPress={() => handleDeleteCategory(item)}
              />
            </View>
          )}
        />
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        backdropColor="transparent"
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
        useNativeDriverForBackdrop={true}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View className="bg-slate-50 rounded-t-3xl border-t border-l border-r border-slate-300 p-5 gap-5">
          <Text className="font-sansBold text-2xl text-slate-700">
            New Category
          </Text>
          <TextInput
            className="font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400"
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="Category name"
            placeholderTextColor={colors.slate[400]}
          />
          <View className="flex-row flex-wrap gap-3 justify-between">
            {CATEGORY_ICON_OPTIONS.map((iconOption) => {
              const isSelected = selectedIcon === iconOption.icon;

              return (
                <Pressable
                  key={iconOption.id}
                  onPress={() => setSelectedIcon(iconOption.icon)}
                  className={`w-[22%] items-center py-3 rounded-2xl border ${isSelected ? "bg-blue-600 border-blue-600" : "bg-slate-50 border-slate-300"}`}
                >
                  {({ pressed }) => (
                    <>
                      <Ionicons
                        name={iconOption.icon}
                        size={22}
                        color={
                          isSelected
                            ? colors.slate[50]
                            : pressed
                              ? colors.slate[600]
                              : colors.slate[700]
                        }
                      />
                      <Text
                        className={`font-sansReg text-xs mt-2 ${isSelected ? "text-slate-50" : "text-slate-600"}`}
                      >
                        {iconOption.label}
                      </Text>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
          <View className="flex-row justify-end">
            <BluePressable
              name={"checkmark"}
              text={"Save"}
              direction="right"
              onPress={handleCreateCategory}
              isLoading={isSaving}
              loadingText="Saving..."
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Category;
