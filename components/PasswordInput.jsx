import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ClosedEyeIcon from './ClosedEyeIcon';

export default function PasswordInput({
  value,
  onChangeText,
  placeholder = "Enter password",
  placeholderTextColor = "#64748b",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="w-full justify-center">
      <TextInput
        className={`w-full bg-surface rounded-input border border-border text-black py-4 pl-3 pr-11 ${Platform.OS === 'ios' ? '' : 'font-sansReg'}`}
        style={Platform.OS === 'ios' ? { fontFamily: 'System' } : { includeFontPadding: false, textAlignVertical: 'center' }}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={!showPassword}
        onChangeText={onChangeText}
        autoCapitalize="none"
        {...props}
      />
      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        className="absolute right-3 h-[30px] w-[30px] justify-center items-center"
        activeOpacity={0.7}
      >
        {showPassword ? (
          <Ionicons
            name="eye-outline"
            size={22}
            color="#64748b"
          />
        ) : (
          <ClosedEyeIcon size={22} color="#64748b" />
        )}
      </TouchableOpacity>
    </View>
  );
}
