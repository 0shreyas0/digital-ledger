import {
  Alert,
  FlatList,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import AppPressable from "@/components/pressables/AppPressable";
import React, { useCallback, useState, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router/react-navigation";
import Modal from "react-native-modal";
import NativeBottomSheet from "@/components/NativeBottomSheet";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import BluePressable from "@/components/pressables/BluePressable";
import PageLoader from "@/components/PageLoader";
import CloseButton from "@/components/CloseButton";
import { useTags } from "@/hooks/useTags";

const PALETTE = [
  "#FFC6FF", // Pastel Pink
  "#BDB2FF", // Pastel Purple/Lavender
  "#A0C4FF", // Pastel Blue
  "#9BF6FF", // Pastel Teal/Mint
  "#CAFFBF", // Pastel Green
  "#FDFFB6", // Pastel Yellow
  "#FFD6A5", // Pastel Peach/Orange
];

const TagsView = forwardRef((props, ref) => {
  const router = useRouter();
  const { user } = useUser();
  const { colors } = useTheme();
  const {
    tags,
    isLoading,
    isSaving,
    deletingTagId,
    loadTags,
    createTag,
    editTag,
    deleteTag,
  } = useTags(user);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  // Track original values so we can detect real changes in edit mode
  const [originalTagName, setOriginalTagName] = useState("");
  const [originalTagColor, setOriginalTagColor] = useState(PALETTE[0]);

  useFocusEffect(
    useCallback(() => {
      loadTags();
    }, [loadTags])
  );

  const resetForm = () => {
    setTagName("");
    setSelectedColor(PALETTE[0]);
    setOriginalTagName("");
    setOriginalTagColor(PALETTE[0]);
    setEditingTagId(null);
  };

  const hasUnsavedChanges = () => {
    if (editingTagId) {
      return tagName !== originalTagName || selectedColor !== originalTagColor;
    }
    return tagName.trim() !== "" || selectedColor !== PALETTE[0];
  };

  // Reactive: compare against originals so edit mode doesn't lock immediately
  const unsavedChanges = editingTagId
    ? (tagName !== originalTagName || selectedColor !== originalTagColor)
    : (tagName.trim() !== "" || selectedColor !== PALETTE[0]);

  const handleBackdropPress = () => {
    // Only fires when there are NO unsaved changes (preventNativeDismiss blocks it otherwise)
    resetForm();
    setIsModalVisible(false);
  };

  // X button: sheet is still open, show alert first then close
  const handleCloseButtonPress = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to discard your changes?",
        [
          { text: "Cancel", style: "cancel" }, // sheet stays open
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
      handleCloseButtonPress();
    } else {
      setIsModalVisible(true);
    }
  };

  useImperativeHandle(ref, () => ({
    toggleModal
  }));

  const openEditModal = (tag) => {
    setEditingTagId(tag.tag_id);
    setTagName(tag.tag_name);
    setSelectedColor(tag.color);
    setOriginalTagName(tag.tag_name);
    setOriginalTagColor(tag.color);
    setIsModalVisible(true);
  };

  const handleCreateOrUpdateTag = async () => {
    if (!tagName.trim()) {
      return Alert.alert("Error", "Please enter a tag name");
    }

    try {
      if (editingTagId) {
        await editTag({
          tagId: editingTagId,
          tag_name: tagName,
          color: selectedColor,
        });
      } else {
        await createTag({
          tag_name: tagName,
          color: selectedColor,
        });
      }
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert("Error", error.message || `Failed to ${editingTagId ? "update" : "create"} tag`);
    }
  };

  const handleDeleteTag = (tag) => {
    Alert.alert("Delete Tag", `Are you sure you want to delete tag "${tag.tag_name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTag(tag.tag_id);
          } catch (error) {
            Alert.alert("Error", error.message || "Failed to delete tag");
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
          data={tags}
          keyExtractor={(item) => item.tag_id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 110, gap: 12 }}
          ListEmptyComponent={
            <View className="bg-surface rounded-2xl border border-borderSubtle p-5">
              <Text className="font-sansBold text-xl text-textMain">
                No tags yet
              </Text>
              <Text className="font-sansReg text-textMuted mt-2">
                Add your first tag to start grouping transactions.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <AppPressable
              onPress={() => router.push(`/tag/${item.tag_id}?name=${encodeURIComponent(item.tag_name)}`)}
              className="flex-row items-center justify-between rounded-card px-4 py-4 mb-2 border border-borderSubtle"
              activeClassName="active:opacity-70"
              style={{ backgroundColor: item.color }}
            >
              <Pressable
                onPress={() => openEditModal(item)}
                className="h-14 w-14 p-3 rounded-full active:bg-accent items-center justify-center mr-3"
              >
                {({ pressed }) => (
                  <Ionicons size={22} name="pencil" color={pressed ? "#000000" : colors.textMain} />
                )}
              </Pressable>
              <View className="flex-1">
                <Text className="font-sansBold text-lg text-textMain">
                  {item.tag_name}
                </Text>
                <Text className="font-sansReg text-textMuted mt-0.5">
                  {item.transaction_count > 0
                    ? `${item.transaction_count} transactions`
                    : "No transactions yet"}
                </Text>
              </View>
              <Pressable
                className="h-14 w-14 p-3 rounded-full active:bg-accent items-center justify-center"
                disabled={deletingTagId === item.tag_id}
                onPress={() => handleDeleteTag(item)}
              >
                {({ pressed }) => (
                  <Ionicons size={22} name="trash-outline" color={pressed ? "#000000" : colors.red} />
                )}
              </Pressable>
            </AppPressable>
          )}
        />
      </View>
      <NativeBottomSheet
        isVisible={isModalVisible}
        onClose={handleBackdropPress}
        snapPoint="55%"
        preventNativeDismiss={unsavedChanges}
      >
        <View className="flex-row justify-between items-center mb-5">
          <Text className="font-sansBold text-2xl text-textMain">
            {editingTagId ? "Edit Tag" : "New Tag"}
          </Text>
          <CloseButton onPress={toggleModal} />
        </View>
        <TextInput
          className="font-sansReg bg-surface rounded-input border border-border text-lg py-4 px-3"
          style={{ includeFontPadding: false, textAlignVertical: "center" }}
          value={tagName}
          onChangeText={setTagName}
          placeholder="Tag name"
          placeholderTextColor={colors.textMuted}
          maxLength={25}
        />
        <View className="mt-4">
          <Text className="font-sansMed text-textMuted mb-3">Choose color</Text>
          <View className="flex-row justify-between">
            {PALETTE.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={{
                    backgroundColor: color,
                    borderColor: isSelected ? "#000" : "transparent",
                    borderWidth: isSelected ? 3 : 0,
                  }}
                  className="w-10 h-10 rounded-full"
                />
              );
            })}
          </View>
        </View>
        <View className="flex-row justify-end mt-5">
          <BluePressable
            name={"checkmark"}
            text={"Save"}
            direction="right"
            onPress={handleCreateOrUpdateTag}
            isLoading={isSaving}
            loadingText="Saving..."
          />
        </View>
      </NativeBottomSheet>
    </View>
  );
});

export default TagsView;
