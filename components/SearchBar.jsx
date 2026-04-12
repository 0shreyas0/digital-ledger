import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from 'tailwindcss/colors';

const SearchBar = ({ 
  value, 
  onChangeText, 
  placeholder = "Search...", 
  containerClassName = "",
  placeholderTextColor = colors.slate[400]
}) => {
  return (
    <View className={`flex-row items-center bg-slate-100 rounded-2xl px-4 h-14 border border-slate-350 ${containerClassName}`}>
      <Ionicons name="search" size={20} color={colors.slate[350]} />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        className="flex-1 ml-2 font-sansReg text-slate-700"
        placeholderTextColor={placeholderTextColor}
      />
    </View>
  );
};

export default SearchBar;
