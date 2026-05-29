import React, { useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BluePressable from "@/components/pressables/BluePressable";
import TagsView from "@/components/fields/TagsView";
import CategoryView from "@/components/fields/CategoryView";

const FieldsScreen = () => {
  const [activeTab, setActiveTab] = useState('tags');
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
    <View className="flex-1 bg-background">
      <View className="mx-6 my-3 pb-5 border-b-2 border-slate-300">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-sansBold text-slate-500 text-2xl">Fields</Text>
          <BluePressable name={"add"} text={"Add"} onPress={handleAdd} />
        </View>
        
        {/* Big wide pill with a divider */}
        <View className="flex-row items-center rounded-full border-2 border-slate-200 bg-slate-50 mt-1 overflow-hidden">
          <Pressable 
            onPress={() => setActiveTab('tags')}
            className={`flex-1 py-3 flex-row gap-2 items-center justify-center ${activeTab === 'tags' ? 'bg-slate-800' : 'active:bg-slate-100'}`}
          >
            <Ionicons 
              name={activeTab === 'tags' ? "pricetags" : "pricetags-outline"} 
              size={18} 
              color={activeTab === 'tags' ? '#ffffff' : '#94a3b8'} 
            />
            <Text className={`font-sansBold text-lg ${activeTab === 'tags' ? 'text-white' : 'text-slate-400'}`}>
              Tags
            </Text>
          </Pressable>

          <View className="w-[2px] h-full bg-slate-200" />

          <Pressable 
            onPress={() => setActiveTab('categories')}
            className={`flex-1 py-3 flex-row gap-2 items-center justify-center ${activeTab === 'categories' ? 'bg-slate-800' : 'active:bg-slate-100'}`}
          >
            <Ionicons 
              name={activeTab === 'categories' ? "layers" : "layers-outline"} 
              size={18} 
              color={activeTab === 'categories' ? '#ffffff' : '#94a3b8'} 
            />
            <Text className={`font-sansBold text-lg ${activeTab === 'categories' ? 'text-white' : 'text-slate-400'}`}>
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
