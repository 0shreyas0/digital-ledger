import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import colors from 'tailwindcss/colors'

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
  return (
    <Pressable {...props} disabled={disabled}>
      {({ pressed }) => (
        <View
          className={`
            ${direction === "left" ? "flex-row" : "flex-row-reverse"}
            ${isLoading ? "bg-slate-500" : pressed ? "bg-green-400" : "bg-blue-600"}
            py-3 px-4 rounded-full gap-2 items-center
          `}
        >
          {hasIcon && (
            <Ionicons
              name={name}
              size={25}
              color={pressed ? colors.slate[900] : colors.slate[50]}
            />
          )}
          <Text
            className={`font-sansBold text-xl ${direction === "left" ? "mr-1" : "ml-1"} ${pressed ? "text-slate-900" : "text-slate-50"}`}
          >
            {isLoading ? loadingText : text}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

export default WidePressable