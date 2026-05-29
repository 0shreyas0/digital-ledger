import React, { useRef, useState, useEffect } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BluePressable from "@/components/pressables/BluePressable";
import TagsView from "@/components/fields/TagsView";
import CategoryView from "@/components/fields/CategoryView";

const FieldsScreen = () => {
  const [activeTab, setActiveTab] = useState('tags');
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
      <View className="mx-6 my-3 pb-5 border-b-2 border-slate-300">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-sansBold text-slate-500 text-2xl">Fields</Text>
          <BluePressable name={"add"} text={"Add"} onPress={handleAdd} />
        </View>
        
        {/* Sliding Pill Segmented Control */}
        <View className="flex-row items-center rounded-full border border-slate-300 bg-slate-100/80 mt-1 relative overflow-hidden p-1">
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
              className="bg-slate-700 rounded-full shadow-sm"
            />
          </View>
          <Pressable 
            onPress={() => setActiveTab('tags')}
            className="flex-1 py-3 flex-row gap-2 items-center justify-center rounded-full active:opacity-70"
          >
            <Ionicons 
              name={activeTab === 'tags' ? "pricetags" : "pricetags-outline"} 
              size={18} 
              color={activeTab === 'tags' ? '#ffffff' : '#475569'} 
            />
            <Text className={`font-sansBold text-base ${activeTab === 'tags' ? 'text-white' : 'text-slate-600'}`}>
              Tags
            </Text>
          </Pressable>

          <Pressable 
            onPress={() => setActiveTab('categories')}
            className="flex-1 py-3 flex-row gap-2 items-center justify-center rounded-full active:opacity-70"
          >
            <Ionicons 
              name={activeTab === 'categories' ? "layers" : "layers-outline"} 
              size={18} 
              color={activeTab === 'categories' ? '#ffffff' : '#475569'} 
            />
            <Text className={`font-sansBold text-base ${activeTab === 'categories' ? 'text-white' : 'text-slate-600'}`}>
              Categories
            </Text>
          </Pressable>
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
