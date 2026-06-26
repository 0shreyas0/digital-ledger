/**
 * SearchBar — iOS
 *
 * Uses SwiftUI glassEffect capsule as the background layer (matching the
 * tab bar and filter button glass material). The RN TextInput is rendered
 * on top as an interactive foreground layer.
 *
 * NOTE: Do NOT apply opacity() modifier here — it would fade the icon/input.
 * Glass transparency is driven by BlurView intensity (glassOpacity in tab bar).
 */

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Host, HStack, Spacer } from '@expo/ui/swift-ui';
import { glassEffect, frame } from '@expo/ui/swift-ui/modifiers';

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
    <View className={containerClassName} style={[styles.container, style]}>
      {/* SwiftUI liquid glass layer — same material as the tab bar */}
      <Host style={StyleSheet.absoluteFill} pointerEvents="none">
        <HStack
          modifiers={[
            frame({ minWidth: 0, maxWidth: 999999, minHeight: 0, maxHeight: 999999 }),
            glassEffect({
              glass: { variant: 'regular', interactive: true },
              shape: 'capsule',
            }),
          ]}
        >
          <Spacer />
        </HStack>
      </Host>

      {/* Interactive RN content on top */}
      <View style={styles.foreground}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={placeholderTextColor || colors.textMuted}
          style={[styles.input, { color: colors.textMain }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
  },
  foreground: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    includeFontPadding: false,
  },
});

export default SearchBar;
