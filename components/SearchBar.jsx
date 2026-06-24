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
    const { GlassView, isGlassEffectAPIAvailable } = require('expo-glass-effect');

    if (isGlassEffectAPIAvailable()) {
      const { Host, HStack, Spacer } = require('@expo/ui/swift-ui');
      const { glassEffect, frame, opacity } = require('@expo/ui/swift-ui/modifiers');

      return (
        <View className={containerClassName} style={[styles.flexFill, style]}>
          {/* Layer 1: GlassView for the blur material at 50% opacity */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <GlassView
              glassEffectStyle="regular"
              style={styles.glassBackground}
            />
          </View>

          {/* Layer 2: SwiftUI HStack for the shine border at 50% opacity */}
          <Host
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 44,
            }}
            pointerEvents="none"
          >
            <HStack
              modifiers={[
                frame({ minWidth: 0, maxWidth: 999999, minHeight: 0, maxHeight: 999999 }),
                glassEffect({ shape: 'capsule' }),
                opacity(0.5),
              ]}
            >
              <Spacer />
            </HStack>
          </Host>

          {/* Layer 3: Interactive TextInput content at full opacity */}
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
  glassBackground: {
    flex: 1,
    borderRadius: 22,
    opacity: 0.5,
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