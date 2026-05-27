import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "@/constants/api";

export const useTags = (user) => {
  const userId = user?.id;
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState(null);

  const loadTags = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/tags/${userId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch tags (${response.status})`,
        );
      }

      const data = await response.json();
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Error fetching tags:", error);
      Alert.alert("Error", error.message || "Failed to load tags");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const createTag = useCallback(
    async ({ tag_name, color }) => {
      if (!userId) throw new Error("User not loaded");

      setIsSaving(true);
      try {
        const response = await fetch(`${API_URL}/tags`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            username: user?.username || user?.fullName || user?.firstName,
            email:
              user?.primaryEmailAddress?.emailAddress ||
              user?.emailAddresses?.[0]?.emailAddress,
            tag_name,
            color,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to create tag");
        }

        setTags((currentTags) =>
          [...currentTags, data].sort((left, right) =>
            left.tag_name.localeCompare(right.tag_name),
          ),
        );

        return data;
      } finally {
        setIsSaving(false);
      }
    },
    [user, userId],
  );

  const deleteTag = useCallback(
    async (tagId) => {
      if (!userId) throw new Error("User not loaded");

      setDeletingTagId(tagId);
      try {
        const response = await fetch(
          `${API_URL}/tags/${tagId}?userId=${encodeURIComponent(userId)}`,
          {
            method: "DELETE",
          },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete tag");
        }

        setTags((currentTags) =>
          currentTags.filter((tag) => tag.tag_id !== tagId),
        );
      } finally {
        setDeletingTagId(null);
      }
    },
    [userId],
  );

  return {
    tags,
    isLoading,
    isSaving,
    deletingTagId,
    loadTags,
    createTag,
    deleteTag,
  };
};
