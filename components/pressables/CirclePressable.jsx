import { Pressable, Platform } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/context/ThemeContext'

function ioniconsToSF(ioniconsName) {
  const map = {
    'arrow-back': 'chevron.left',
    'chevron-back': 'chevron.left',
    'arrow-forward': 'chevron.right',
    close: 'xmark',
    add: 'plus',
    checkmark: 'checkmark',
    trash: 'trash',
    pencil: 'pencil',
    create: 'pencil',
    'log-out': 'rectangle.portrait.and.arrow.right',
    'log-out-outline': 'rectangle.portrait.and.arrow.right',
    'exit': 'rectangle.portrait.and.arrow.right',
  };
  return map[ioniconsName] ?? ioniconsName;
}

const CirclePressable = ({
  name,
  onPress,
  className = "",
  size = 25,
  iconColor,
  pressedIconColor = '#000000',
  variant = 'transparent',   // ← 'transparent' or 'opaque'
  ...props
}) => {
  const { colors } = useTheme();

  if (Platform.OS === 'ios') {
    const { Host, Button } = require('@expo/ui/swift-ui');
    const { buttonStyle, buttonBorderShape, controlSize, labelStyle, imageScale, frame, opacity } =
      require('@expo/ui/swift-ui/modifiers');

    return (
      <Host matchContents>
        <Button
          label={name}
          systemImage={ioniconsToSF(name)}
          onPress={onPress}
          modifiers={[
            frame({ width: 44, height: 44 }),
            buttonStyle('glass'),
            buttonBorderShape('circle'),
            controlSize('large'),
            labelStyle('iconOnly'),
            imageScale('medium'),
            opacity(variant === 'transparent' ? 0.5 : 1.0),
          ]}
        />
      </Host>
    );
  }

  // Android / Web
  const resolvedIconColor = iconColor || colors.textMuted;
  return (
    <Pressable
      {...props}
      onPress={onPress}
      className={`h-25 w-25 p-3 rounded-full active:bg-accent ${className}`}
    >
      {({ pressed }) => (
        <Ionicons
          name={name}
          size={size}
          color={pressed ? pressedIconColor : resolvedIconColor}
        />
      )}
    </Pressable>
  )
}

export default CirclePressable
