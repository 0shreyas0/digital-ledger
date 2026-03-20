import { Pressable } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import colors from 'tailwindcss/colors'

const CirclePressable = ({
  name,
  onPress,
  className = "",
  size = 25,
  iconColor = colors.slate[500],
  pressedIconColor = colors.slate[900],
  ...props
}) => {
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
          color={pressed ? pressedIconColor : iconColor}
        />
      )}
    </Pressable>
  )
}

export default CirclePressable
