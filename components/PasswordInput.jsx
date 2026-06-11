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
        className={`w-full bg-slate-50 rounded-2xl border border-slate-400 text-black ${Platform.OS === 'ios' ? '' : 'font-sansReg'}`}
        style={{ paddingVertical: 16, paddingLeft: 12, paddingRight: 44, includeFontPadding: false, textAlignVertical: 'center' }}
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
        style={{ position: 'absolute', right: 12, height: 30, width: 30, justifyContent: 'center', alignItems: 'center' }}
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
