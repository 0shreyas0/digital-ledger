import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "@/constants/api";

export const useCategories = (user) => {
  const userId = user?.id;
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const loadCategories = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories/${userId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch categories (${response.status})`,
        );
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Error fetching categories:", error);
      Alert.alert("Error", error.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const createCategory = useCallback(
    async ({ category, icon }) => {
      if (!userId) throw new Error("User not loaded");

      setIsSaving(true);
      try {
        const response = await fetch(`${API_URL}/categories`, {
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
            category,
            icon,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to create category");
        }

        setCategories((currentCategories) =>
          [...currentCategories, data].sort((left, right) =>
            left.category.localeCompare(right.category),
          ),
        );

        return data;
      } finally {
        setIsSaving(false);
      }
    },
    [user, userId],
  );

  const deleteCategory = useCallback(
    async (categoryId) => {
      if (!userId) throw new Error("User not loaded");

      setDeletingCategoryId(categoryId);
      try {
        const response = await fetch(
          `${API_URL}/categories/${categoryId}?userId=${encodeURIComponent(userId)}`,
          {
            method: "DELETE",
          },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete category");
        }

        setCategories((currentCategories) =>
          currentCategories.filter(
            (category) => category.category_id !== categoryId,
          ),
        );
      } finally {
        setDeletingCategoryId(null);
      }
    },
    [userId],
  );

  return {
    categories,
    isLoading,
    isSaving,
    deletingCategoryId,
    loadCategories,
    createCategory,
    deleteCategory,
  };
};
