import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

const SearchBar = ({ 
  value, 
  onChangeText, 
  placeholder = "Search...", 
  containerClassName = "",
  placeholderTextColor
}) => {
  const { colors } = useTheme();

  return (
    <View className={`flex-row items-center bg-surface rounded-input px-4 h-14 border border-border ${containerClassName}`}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        className="flex-1 ml-2 font-sansReg text-textMain py-0 h-full"
        style={{ includeFontPadding: false, textAlignVertical: 'center' }}
        placeholderTextColor={placeholderTextColor || colors.textMuted}
      />
    </View>
  );
};

export default SearchBar;
