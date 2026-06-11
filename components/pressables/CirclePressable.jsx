import { Pressable } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/context/ThemeContext'

const CirclePressable = ({
  name,
  onPress,
  className = "",
  size = 25,
  iconColor,
  pressedIconColor = '#000000',
  ...props
}) => {
  const { colors } = useTheme();
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
