import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/context/ThemeContext'

const WidePressable = ({
  name,
  text,
  direction = "left",
  isLoading = false,
  disabled = isLoading,
  loadingText = "Loading",
  hasIcon = true,
  ...props
}) => {
  const { colors } = useTheme();
  return (
    <Pressable {...props} disabled={disabled}>
      {({ pressed }) => (
        <View
          className={`
            ${direction === "left" ? "flex-row" : "flex-row-reverse"}
            ${isLoading ? "bg-textMuted" : pressed ? "bg-accent" : "bg-primary"}
            py-3 px-4 rounded-full gap-2 items-center
          `}
        >
          {hasIcon && (
            <Ionicons
              name={name}
              size={25}
              color={pressed ? colors.textMain : '#ffffff'}
            />
          )}
          <Text
            className={`font-sansBold text-xl ${direction === "left" ? "mr-1" : "ml-1"} ${pressed ? "text-textMain" : "text-white"}`}
          >
            {isLoading ? loadingText : text}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

export default WidePressable