import React, { useRef, useState, useEffect } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import BluePressable from "@/components/pressables/BluePressable";
import TagsView from "@/components/fields/TagsView";
import CategoryView from "@/components/fields/CategoryView";
import AppPressable from "@/components/pressables/AppPressable";

const FieldsScreen = () => {
  const [activeTab, setActiveTab] = useState('tags');
  const { colors } = useTheme();
  const tagsRef = useRef(null);
  const categoriesRef = useRef(null);

  const slideAnim = useRef(new Animated.Value(activeTab === 'tags' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeTab === 'tags' ? 0 : 1,
      useNativeDriver: false,
      duration: 200,
      easing: Easing.linear,
    }).start();
  }, [activeTab]);

  const handleAdd = () => {
    if (activeTab === 'categories') {
      categoriesRef.current?.toggleModal();
    } else {
      tagsRef.current?.toggleModal();
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="mx-6 my-3 pb-5 border-b-2 border-borderSubtle">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-sansBold text-textMuted text-2xl">Fields</Text>
          <BluePressable name={"add"} text={"Add"} onPress={handleAdd} />
        </View>
        
        {/* Sliding Pill Segmented Control */}
        <View className="flex-row items-center rounded-full border border-borderSubtle bg-surface mt-1 relative overflow-hidden p-1">
          <View className="absolute inset-0 p-1">
            <Animated.View 
              style={{
                width: '50%',
                height: '100%',
                left: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '50%']
                })
              }}
              className="bg-segmentedControl rounded-full"
            />
          </View>
          <AppPressable 
            onPress={() => setActiveTab('tags')}
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
            onPress={() => setActiveTab('categories')}
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
      </View>
      {activeTab === 'categories' ? (
        <CategoryView ref={categoriesRef} />
      ) : (
        <TagsView ref={tagsRef} />
      )}
    </View>
  );
};

export default FieldsScreen;
