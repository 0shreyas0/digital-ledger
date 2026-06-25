import { Platform, Pressable, StyleSheet, ActivityIndicator, Text } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

function ioniconsToSF(ioniconsName) {
  const map = {
    add: 'plus',
    checkmark: 'checkmark',
    'checkmark-circle': 'checkmark.circle',
    close: 'xmark',
    save: 'checkmark',
    create: 'pencil',
    trash: 'trash',
    pencil: 'pencil',
    'arrow-back': 'chevron.left',
    'chevron-back': 'chevron.left',
  };
  return map[ioniconsName] ?? ioniconsName;
}

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
  const { glassOpacity } = useTheme();

  if (Platform.OS === 'ios') {
    const { Host, Button } = require('@expo/ui/swift-ui');
    const {
      buttonStyle,
      buttonBorderShape,
      labelStyle,
      controlSize,
      imageScale,
      opacity,
    } = require('@expo/ui/swift-ui/modifiers');

    return (
      <Host matchContents style={style}>
        <Button
          label={text || name}
          systemImage={ioniconsToSF(name)}
          onPress={disabled ? undefined : onPress}
          modifiers={[
            buttonStyle('glass'),
            buttonBorderShape('circle'),
            controlSize('large'),
            labelStyle('iconOnly'),
            imageScale('medium'),
            opacity(variant === 'transparent' ? glassOpacity : 1.0),
          ]}
        />
      </Host>
    );
  }

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
  },
});

export default BluePressable;