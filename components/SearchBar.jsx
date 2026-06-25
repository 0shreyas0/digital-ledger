import React from 'react';
import { View, TextInput, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search...",
  containerClassName = "",
  placeholderTextColor,
  variant = 'transparent',   // ← 'transparent' or 'opaque'
  style
}) => {
  const { colors } = useTheme();

  const content = (
    <>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={placeholderTextColor || colors.textMuted}
        style={[styles.input, { color: colors.textMain }]}
      />
    </>
  );

  if (Platform.OS === 'ios') {
    const { isGlassEffectAPIAvailable } = require('expo-glass-effect');

    if (isGlassEffectAPIAvailable()) {
      const { Host, HStack, Spacer } = require('@expo/ui/swift-ui');
      const { glassEffect, frame, opacity } = require('@expo/ui/swift-ui/modifiers');
      const opacityVal = variant === 'transparent' ? 0.5 : 1.0;

      return (
        <View className={containerClassName} style={[styles.flexFill, style]}>
          {/* SwiftUI liquid glass layer — same material as the tab bar */}
          <Host
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <HStack
              modifiers={[
                frame({ minWidth: 0, maxWidth: 999999, minHeight: 0, maxHeight: 999999 }),
                glassEffect({
                  glass: { variant: 'regular', interactive: true },
                  shape: 'capsule',
                }),
                opacity(opacityVal),
              ]}
            >
              <Spacer />
            </HStack>
          </Host>

          {/* Interactive RN content on top */}
          <View style={styles.foregroundContainer}>
            {content}
          </View>
        </View>
      );
    }
  }

  // Fallback: Android + older iOS
  return (
    <View
      className={containerClassName}
      style={[styles.glassContainer, styles.fallbackBg, style]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  flexFill: {
    height: 44,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    gap: 8,
    flex: 1,
  },
  foregroundContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  fallbackBg: {
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