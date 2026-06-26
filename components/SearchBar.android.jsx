/**
 * SearchBar — Android
 *
 * Plain RN capsule with a semi-transparent rgba background.
 * No @expo/ui dependency.
 */

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search...",
  containerClassName = "",
  placeholderTextColor,
  variant = 'transparent',
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      className={containerClassName}
      style={[styles.container, style]}
    >
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={placeholderTextColor || colors.textMuted}
        style={[styles.input, { color: colors.textMain }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    gap: 8,
    flex: 1,
    backgroundColor: 'rgba(120,120,128,0.18)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    includeFontPadding: false,
  },
});

export default SearchBar;
