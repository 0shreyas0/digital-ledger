import { TextInput, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import colors from 'tailwindcss/colors'

export default function FieldInputBox({name ="create-outline", placeholder="Placeholder Text", value, onChangeText}) {
  return (
    <View className="flex-row border border-slate-400 rounded-lg px-4 py-4">
      <Ionicons name={name} color={colors.slate[500]} size={22} />
      <TextInput 
        className="flex-1 ml-6 font-sansMed text-xl leading-tight"
        placeholder={placeholder}
        placeholderTextColor={colors.slate[400]}
        value={value}
        onChangeText={onChangeText}
        style={{paddingVertical: 0, includeFontPadding: false}}
      />
    </View>
  )
}