import { TextInput, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/context/ThemeContext'

export default function FieldInputBox({name ="create-outline", placeholder="Placeholder Text", value, onChangeText}) {
  const { colors } = useTheme();

  return (
    <View className="flex-row border border-border rounded-input px-4 py-4 bg-surface">
      <Ionicons name={name} color={colors.textMuted} size={22} />
      <TextInput 
        className="flex-1 ml-6 font-sansMed text-xl leading-tight py-0 text-textMain"
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted + "99"} /* dynamic transparency fallback */
        value={value}
        onChangeText={onChangeText}
        style={{includeFontPadding: false, textAlignVertical: 'center'}}
      />
    </View>
  )
}