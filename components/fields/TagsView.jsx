import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useState, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import Modal from "react-native-modal";
import colors from "tailwindcss/colors";
import CirclePressable from "@/components/pressables/CirclePressable";
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
  const {
    tags,
    isLoading,
    isSaving,
    deletingTagId,
    loadTags,
    createTag,
    deleteTag,
  } = useTags(user);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);

  useFocusEffect(
    useCallback(() => {
      loadTags();
    }, [loadTags])
  );

  const resetForm = () => {
    setTagName("");
    setSelectedColor(PALETTE[0]);
  };

  const hasUnsavedChanges = () => {
    return (
      tagName.trim() !== "" ||
      selectedColor !== PALETTE[0]
    );
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
      setIsModalVisible(true);
    }
  };

  useImperativeHandle(ref, () => ({
    toggleModal
  }));

  const handleCreateTag = async () => {
    if (!tagName.trim()) {
      return Alert.alert("Error", "Please enter a tag name");
    }

    try {
      await createTag({
        tag_name: tagName,
        color: selectedColor,
      });
      resetForm();
      setIsModalVisible(false); // don't toggle, explicitly close to avoid discarding alert
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create tag");
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
            <View className="bg-slate-50 rounded-2xl border border-slate-300 p-5">
              <Text className="font-sansBold text-xl text-slate-700">
                No tags yet
              </Text>
              <Text className="font-sansReg text-slate-500 mt-2">
                Add your first tag to start grouping transactions.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/tag/${item.tag_id}?name=${encodeURIComponent(item.tag_name)}`)}
              style={{
                backgroundColor: item.color,
                borderColor: colors.slate[300],
                borderWidth: 1,
              }}
              className="flex-row items-center justify-between rounded-2xl px-4 py-4 mb-2 active:opacity-70"
            >
              <View className="flex-1">
                <Text className="font-sansBold text-lg text-slate-800">
                  {item.tag_name}
                </Text>
                <Text className="font-sansReg text-slate-600 mt-0.5">
                  {item.transaction_count > 0
                    ? `${item.transaction_count} transactions`
                    : "No transactions yet"}
                </Text>
              </View>
              <CirclePressable
                name={"trash-outline"}
                disabled={deletingTagId === item.tag_id}
                onPress={() => handleDeleteTag(item)}
              />
            </Pressable>
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
          <View className="flex-row justify-between items-center">
            <Text className="font-sansBold text-2xl text-slate-700">
              New Tag
            </Text>
            <CloseButton onPress={toggleModal} />
          </View>
          <TextInput
            className="font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400 text-lg"
            value={tagName}
            onChangeText={setTagName}
            placeholder="Tag name"
            placeholderTextColor={colors.slate[400]}
            maxLength={25}
          />
          <View>
            <Text className="font-sansMed text-slate-500 mb-3">Choose color</Text>
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
          <View className="flex-row justify-end mt-2">
            <BluePressable
              name={"checkmark"}
              text={"Save"}
              direction="right"
              onPress={handleCreateTag}
              isLoading={isSaving}
              loadingText="Saving..."
            />
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default TagsView;
