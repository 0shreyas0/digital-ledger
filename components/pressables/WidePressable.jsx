import { View, Text, Pressable } from 'react-native'
import React from 'react'

const WidePressable = ({ name, text, direction = "left", isLoading = false, disabled = isLoading, loadingText = "Loading", hasIcon = true, ...props }) => {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      className={`${direction == "left" ? "flex-row" : "flex-row-reverse"} ${isLoading ? "bg-slate-500" : "bg-blue-600 active:bg-accent"} flex-row p-3 rounded-full gap-2 items-center`}
    >
      {({ pressed }) => (
        <>
          {hasIcon && <Ionicons name={name} size={25} color={pressed ? colors.slate[900] : colors.slate[50]} />}
          <Text className={`font-sansBold text-xl ${direction == "left" ? "mr-1" : "ml-1"} ${pressed ? "text-slate-900" : "text-slate-50"}`}>
            {isLoading ? loadingText : text}
          </Text>
        </>
      )}
    </Pressable>
  )
}

export default WidePressable