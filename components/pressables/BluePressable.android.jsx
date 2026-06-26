import { Pressable, StyleSheet, ActivityIndicator, Text } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const BluePressable = ({
  name,
  text,
  direction = 'left',
  isLoading = false,
  disabled = isLoading,
  loadingText = 'Loading',
  hasIcon = true,
  onPress,
  style,
  variant = 'transparent',   // ← 'transparent' or 'opaque'
  ...props
}) => {
  return (
    <Pressable
      {...props}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.androidWrapper,
        isLoading && styles.androidDisabled,
        direction === 'right' && styles.rowReverse,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {isLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : hasIcon && <Ionicons name={name} size={22} color="#ffffff" />
          }
          <Text style={[styles.androidLabel, pressed && { opacity: 0.75 }]}>
            {isLoading ? loadingText : text}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  androidWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
    gap: 8,
  },
  androidDisabled: {
    backgroundColor: '#9CA3AF',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  androidLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'GoogleSans-Bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default BluePressable;
