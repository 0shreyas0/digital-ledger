import React from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import AppPressable from "@/components/pressables/AppPressable";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import CloseButton from "../CloseButton";
import NativeBottomSheet from "../NativeBottomSheet";
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

  const getCategoryColors = (iconName) => {
    const icon = (iconName || "").toLowerCase();
    if (icon.includes("plane") || icon.includes("flight") || icon.includes("vacation") || icon.includes("globe"))
      return { bg: "#e0f2fe", icon: "#0284c7" };
    if (icon.includes("shirt") || icon.includes("apparel") || icon.includes("clothes") || icon.includes("gift"))
      return { bg: "#f3e8ff", icon: "#7c3aed" };
    if (icon.includes("food") || icon.includes("restaurant") || icon.includes("pizza") || icon.includes("cafe") || icon.includes("burger") || icon.includes("fast-food"))
      return { bg: "#fef3c7", icon: "#d97706" };
    if (icon.includes("med") || icon.includes("pulse") || icon.includes("heart") || icon.includes("bandage"))
      return { bg: "#fee2e2", icon: "#dc2626" };
    if (icon.includes("cash") || icon.includes("money") || icon.includes("card") || icon.includes("income") || icon.includes("trending-up"))
      return { bg: "#dcfce7", icon: "#16a34a" };
    return { bg: "#f3f4f6", icon: colors.primary };
  };

  return (
    <NativeBottomSheet isVisible={isVisible} onClose={onClose} snapPoint="55%">
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textMain }]}>Select Category</Text>
        <CloseButton onPress={onClose} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.itemsGap}>
          {categories.map((category) => {
            const isSelected = selectedCategory?.name === category.category;
            const categoryColors = getCategoryColors(category.icon);

            return (
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
                style={[styles.item, isSelected ? styles.itemSelected : styles.itemUnselected]}
              >
                {({ pressed }) => (
                  <>
                    <View style={styles.itemLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: isSelected ? colors.primary + "22" : categoryColors.bg }]}>
                        <Ionicons name={category.icon || DEFAULT_CATEGORY_ICON} size={22} color={isSelected ? colors.primary : categoryColors.icon} />
                      </View>
                      <Text style={[styles.itemLabel, { color: isSelected ? colors.primary : colors.textMain, fontWeight: isSelected ? "700" : "500" }]}>
                        {category.category}
                      </Text>
                    </View>
                    {isSelected
                      ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                      : <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    }
                  </>
                )}
              </AppPressable>
            );
          })}
        </View>

        {isCategoriesLoading && categories.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : categories.length === 0 ? (
          <AppPressable
            onPress={() => { onClose(); onAddCategoryPress(); }}
            style={[styles.addCategoryButton, { borderColor: colors.borderSubtle }]}
          >
            {({ pressed }) => (
              <Text style={[styles.addCategoryText, { color: pressed ? colors.textMuted : colors.primary }]}>
                + Add a category first
              </Text>
            )}
          </AppPressable>
        ) : null}
      </ScrollView>
    </NativeBottomSheet>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  itemsGap: { gap: 10 },
  item: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
  itemSelected: { borderColor: "rgba(0,122,255,0.35)", backgroundColor: "rgba(0,122,255,0.08)" },
  itemUnselected: { borderColor: "rgba(0,0,0,0.07)", backgroundColor: "rgba(255,255,255,0.45)" },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  itemLabel: { fontSize: 16 },
  loadingContainer: { alignItems: "center", paddingVertical: 24 },
  addCategoryButton: { alignItems: "center", paddingVertical: 24, borderWidth: 1, borderStyle: "dashed", borderRadius: 16 },
  addCategoryText: { fontSize: 15, fontWeight: "500" },
});

export default CategorySelectModal;
