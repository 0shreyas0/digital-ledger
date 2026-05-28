import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import CloseButton from "./CloseButton";

const PASTEL_PALETTE = [
  "#FFC6FF", // Pastel Pink
  "#BDB2FF", // Pastel Purple/Lavender
  "#A0C4FF", // Pastel Blue
  "#9BF6FF", // Pastel Teal/Mint
  "#CAFFBF", // Pastel Green
  "#FDFFB6", // Pastel Yellow
  "#FFD6A5", // Pastel Peach/Orange
];

const TagsSelectModal = ({
  isVisible,
  onClose,
  tags,
  selectedTags,
  onSelectTags,
  createTag,
  isSavingTag,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectTag = (tag) => {
    const isSelected = selectedTags.some((t) => t.tag_id === tag.tag_id);
    if (isSelected) {
      onSelectTags(selectedTags.filter((t) => t.tag_id !== tag.tag_id));
    } else {
      if (selectedTags.length >= 5) {
        Alert.alert("Limit Reached", "You can only select up to 5 tags.");
        return;
      }
      onSelectTags([...selectedTags, tag]);
    }
  };

  const handleCreateOnTheFly = async () => {
    const cleanedQuery = searchQuery.trim();
    if (!cleanedQuery) return;
    const randomColor = PASTEL_PALETTE[Math.floor(Math.random() * PASTEL_PALETTE.length)];
    try {
      const created = await createTag({
        tag_name: cleanedQuery,
        color: randomColor,
      });
      if (created) {
        setSearchQuery("");
        if (selectedTags.length < 5) {
          onSelectTags([...selectedTags, created]);
        } else {
          Alert.alert("Tag Created", "Tag was created but could not be auto-selected because you have reached the 5-tag limit.");
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create tag");
    }
  };

  const cleanedQuery = searchQuery.trim();
  const filteredTags = tags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(cleanedQuery.toLowerCase())
  );
  const queryExists = tags.some(
    (tag) => tag.tag_name.toLowerCase() === cleanedQuery.toLowerCase()
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
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
      <View className="bg-white h-[380px] rounded-t-3xl border-t border-l border-r border-slate-200 p-6 gap-3">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-sansBold text-2xl text-slate-800">Select Tags</Text>
          <CloseButton onPress={onClose} />
        </View>

        {/* Unified Search or Enter Tag box */}
        <TextInput
          className="font-sansReg bg-slate-50 px-3 py-3 rounded-xl border border-slate-300 text-base"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search or enter tag name..."
          placeholderTextColor={colors.slate[400]}
          maxLength={25}
        />

        {/* List of tags */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
        >
          {isSavingTag && (
            <View className="flex-row items-center justify-center p-3 gap-2 bg-slate-50 rounded-xl border border-slate-200">
              <ActivityIndicator color={colors.blue[500]} size="small" />
              <Text className="font-sansMed text-slate-500">Creating tag...</Text>
            </View>
          )}

          {cleanedQuery.length > 0 && !queryExists && !isSavingTag && (
            <Pressable
              onPress={handleCreateOnTheFly}
              className="flex-row items-center justify-between p-3 rounded-xl border border-dashed border-blue-400 bg-blue-50 active:bg-blue-100"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="add-circle" size={20} color={colors.blue[500]} />
                <Text className="font-sansBold text-lg text-blue-600">
                  Create tag "{cleanedQuery}"
                </Text>
              </View>
            </Pressable>
          )}

          {filteredTags.map((tag) => {
            const isSelected = selectedTags.some((t) => t.tag_id === tag.tag_id);
            return (
              <Pressable
                key={tag.tag_id}
                onPress={() => handleSelectTag(tag)}
                style={{
                  backgroundColor: isSelected ? `${tag.color}40` : '#f8fafc',
                  borderColor: isSelected ? tag.color : '#e2e8f0',
                  borderWidth: 1,
                }}
                className="flex-row items-center justify-between p-3 rounded-xl active:bg-slate-200"
              >
                <View className="flex-row items-center gap-2">
                  <View style={{ backgroundColor: tag.color }} className="w-3.5 h-3.5 rounded-full" />
                  <Text className="font-sansMed text-lg text-slate-800">{tag.tag_name}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={tag.color} />
                )}
              </Pressable>
            );
          })}

          {filteredTags.length === 0 && (!cleanedQuery || queryExists) && (
            <Text className="font-sansReg text-slate-400 text-center py-4">No tags found.</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default TagsSelectModal;
