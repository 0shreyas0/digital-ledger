import { Text, Pressable } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/context/ThemeContext'

const BluePressable = ({ name, text, direction = "left", isLoading = false, disabled = isLoading, loadingText = "Loading", hasIcon = true, ...props }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      {...props}
      disabled={disabled}
      className={`${direction == "left" ? "flex-row" : "flex-row-reverse"} ${isLoading ? "bg-textMuted" : "bg-primary active:bg-accent"} flex-row p-3 rounded-full gap-2 items-center`}
    >
      {({ pressed }) => (
        <>
          {hasIcon && <Ionicons name={name} size={25} color={pressed ? colors.textMain : '#ffffff'} />}
          <Text className={`font-sansBold text-xl ${direction == "left" ? "mr-1" : "ml-1"} ${pressed ? "text-textMain" : "text-white"}`}>
            {isLoading ? loadingText : text}
          </Text>
        </>
      )}
    </Pressable>
  )
}

export default BluePressable
