import React, { useRef, useState, useCallback } from "react";
import { View, Text, Animated, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import BluePressable from "@/components/pressables/BluePressable";
import TagsView from "@/components/fields/TagsView";
import CategoryView from "@/components/fields/CategoryView";
import AppPressable from "@/components/pressables/AppPressable";
import SafeScreen from "@/components/SafeScreen";

// ─── Segmented Control ────────────────────────────────────────────────────────
// Uses translateX (native driver compatible) + spring physics for a
// liquid-glass-like morph: stretch → spring slide → scale pulse on landing.
const CustomSegmentedControl = ({ activeTab, onTabPress, colors }) => {
  const pillWidth = useRef(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTo = useCallback((toPx) => {
    Animated.timing(slideAnim, {
      toValue: toPx,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = useCallback((tab) => {
    if (tab === activeTab) return;
    onTabPress(tab);
    animateTo(tab === 'tags' ? 0 : pillWidth.current);
  }, [activeTab, onTabPress, animateTo]);

  // Measure once, snap pill to correct side without animating
  const handleLayout = useCallback((e) => {
    const W = e.nativeEvent.layout.width;
    // Account for padding (p-1 is 4px on each side) and border (1px on each side)
    const travelDistance = (W - 10) / 2;
    pillWidth.current = travelDistance;
    slideAnim.setValue(activeTab === 'tags' ? 0 : travelDistance);
  }, [activeTab]);

  return (
    <View
      className="flex-row items-center rounded-full border border-borderSubtle bg-white mt-1 relative overflow-hidden p-1"
      onLayout={handleLayout}
    >
      <View className="absolute inset-0 p-1" pointerEvents="none">
        <Animated.View
          style={{
            width: '50%',
            height: '100%',
            transform: [
              { translateX: slideAnim },
            ],
          }}
          className="bg-segmentedControl rounded-full"
        />
      </View>

      <AppPressable
        onPress={() => handlePress('tags')}
        activeClassName=""
        className="flex-1 py-3 flex-row gap-2 items-center justify-center rounded-full"
      >
        <Ionicons
          name={activeTab === 'tags' ? "pricetags" : "pricetags-outline"}
          size={18}
          color={activeTab === 'tags' ? '#ffffff' : colors.textMain}
        />
        <Text className={`font-sansBold text-base ${activeTab === 'tags' ? 'text-white' : 'text-textMain'}`}>
          Tags
        </Text>
      </AppPressable>

      <AppPressable
        onPress={() => handlePress('categories')}
        activeClassName=""
        className="flex-1 py-3 flex-row gap-2 items-center justify-center rounded-full"
      >
        <Ionicons
          name={activeTab === 'categories' ? "layers" : "layers-outline"}
          size={18}
          color={activeTab === 'categories' ? '#ffffff' : colors.textMain}
        />
        <Text className={`font-sansBold text-base ${activeTab === 'categories' ? 'text-white' : 'text-textMain'}`}>
          Categories
        </Text>
      </AppPressable>
    </View>
  );
};

const SegmentedControl = ({ activeTab, onTabPress, colors }) => {
  return <CustomSegmentedControl activeTab={activeTab} onTabPress={onTabPress} colors={colors} />;
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const FieldsScreen = () => {
  const [activeTab, setActiveTab] = useState('tags');
  const { colors } = useTheme();
  const tagsRef = useRef(null);
  const categoriesRef = useRef(null);

  const handleAdd = () => {
    if (activeTab === 'categories') {
      categoriesRef.current?.toggleModal();
    } else {
      tagsRef.current?.toggleModal();
    }
  };

  return (
    <SafeScreen>
      <View className="mx-6 my-3 pb-5 border-b-2 border-borderSubtle">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-sansBold text-textMuted text-2xl">Fields</Text>
          <BluePressable name={"add"} text={"Add"} onPress={handleAdd} />
        </View>

        <SegmentedControl
          activeTab={activeTab}
          onTabPress={setActiveTab}
          colors={colors}
        />
      </View>

      {activeTab === 'categories' ? (
        <CategoryView ref={categoriesRef} />
      ) : (
        <TagsView ref={tagsRef} />
      )}
    </SafeScreen>
  );
};

export default FieldsScreen;
