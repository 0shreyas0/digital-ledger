import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import colors from "tailwindcss/colors";
import BluePressable from "@/components/pressables/BluePressable";
import PageLoader from "@/components/PageLoader";
import CategoryItem from "@/components/CategoryItem";
import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORY_ICON,
} from "@/constants/categoryIcons";
import { useCategories } from "@/hooks/useCategories";

const CategoryView = forwardRef((props, ref) => {
  const router = useRouter();
  const { user } = useUser();
  const {
    categories,
    isLoading,
    isSaving,
    deletingCategoryId,
    loadCategories,
    createCategory,
    editCategory,
    deleteCategory,
  } = useCategories(user);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_CATEGORY_ICON);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryOriginalName, setEditingCategoryOriginalName] = useState("");
  const [editingCategoryOriginalIcon, setEditingCategoryOriginalIcon] = useState(DEFAULT_CATEGORY_ICON);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setCategoryName("");
    setSelectedIcon(DEFAULT_CATEGORY_ICON);
    setEditingCategoryId(null);
    setEditingCategoryOriginalName("");
    setEditingCategoryOriginalIcon(DEFAULT_CATEGORY_ICON);
  };

  const hasUnsavedChanges = () => {
    if (editingCategoryId) {
      return (
        categoryName !== editingCategoryOriginalName ||
        selectedIcon !== editingCategoryOriginalIcon
      );
    } else {
      return (
        categoryName.trim() !== "" ||
        selectedIcon !== DEFAULT_CATEGORY_ICON
      );
    }
  };

  const handleBackdropPress = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to discard your changes?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              resetForm();
              setIsModalVisible(false);
            },
          },
        ],
      );
    } else {
      resetForm();
      setIsModalVisible(false);
    }
  };

  const toggleModal = () => {
    if (isModalVisible) {
      handleBackdropPress();
    } else {
      resetForm();
      setIsModalVisible(true);
    }
  };

  useImperativeHandle(ref, () => ({
    toggleModal
  }));

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      return Alert.alert("Error", "Please enter a category name");
    }

    try {
      if (editingCategoryId) {
        await editCategory({
          categoryId: editingCategoryId,
          category: categoryName,
          icon: selectedIcon,
        });
      } else {
        await createCategory({
          category: categoryName,
          icon: selectedIcon,
        });
      }
      resetForm();
      setIsModalVisible(false); // directly close
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to save category");
    }
  };

  const handleEditIconPress = (item) => {
    setEditingCategoryId(item.category_id);
    setCategoryName(item.category);
    setEditingCategoryOriginalName(item.category);
    setSelectedIcon(item.icon || DEFAULT_CATEGORY_ICON);
    setEditingCategoryOriginalIcon(item.icon || DEFAULT_CATEGORY_ICON);
    setIsModalVisible(true);
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
    <View className="flex-1">
      <View className="flex-1 mx-6">
        <FlatList
          data={categories}
          keyExtractor={(item) => item.category_id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 110, gap: 12 }}
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
            <CategoryItem
              item={item}
              isDeleting={deletingCategoryId === item.category_id}
              onDelete={handleDeleteCategory}
              onPress={() => router.push(`/category/${item.category_id}?name=${encodeURIComponent(item.category)}`)}
              onEditIconPress={() => handleEditIconPress(item)}
            />
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
          <Text className="font-sansBold text-2xl text-slate-700" numberOfLines={1}>
            {editingCategoryId ? (
              <Text>
                Edit Category <Text className="text-slate-400">({editingCategoryOriginalName})</Text>
              </Text>
            ) : (
              "New Category"
            )}
          </Text>
          <TextInput
            className="font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400"
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="Category name"
            placeholderTextColor={colors.slate[400]}
          />
          <View className="flex-row items-center justify-between">
            <Text className="font-sansMed text-slate-500">Choose an icon</Text>
            <View className="flex-row items-center gap-2">
              <Text className="font-sansReg text-slate-500">Selected</Text>
              <View className="bg-blue-100 rounded-full p-2">
                <Ionicons
                  name={selectedIcon}
                  size={18}
                  color={colors.blue[600]}
                />
              </View>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-3 justify-between">
            {CATEGORY_ICON_OPTIONS.map((iconOption) => {
              const isSelected = selectedIcon === iconOption.icon;

              return (
                <Pressable
                  key={iconOption.id}
                  onPress={() => setSelectedIcon(iconOption.icon)}
                  className={`w-[22%] items-center justify-center py-5 rounded-2xl border ${isSelected ? "bg-blue-600 border-blue-600" : "bg-slate-50 border-slate-300"}`}
                >
                  {({ pressed }) => (
                    <Ionicons
                      name={iconOption.icon}
                      size={24}
                      color={
                        isSelected
                          ? colors.slate[50]
                          : pressed
                            ? colors.slate[600]
                            : colors.slate[700]
                      }
                    />
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
              onPress={handleSaveCategory}
              isLoading={isSaving}
              loadingText="Saving..."
            />
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default CategoryView;
