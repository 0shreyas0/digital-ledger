import { Pressable } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import colors from 'tailwindcss/colors'

const CirclePressable = ({name, onPress, ...props}) => {
  return (
    <Pressable
      {...props}
      onPress={onPress}
      className="h-25 w-25 p-3 rounded-full active:bg-accent"
    >
      {({ pressed }) => (
        <Ionicons name={name} size={25} color={pressed ? colors.slate[900] : colors.slate[500]}/>
      )}
    </Pressable>
  )
}

export default CirclePressable