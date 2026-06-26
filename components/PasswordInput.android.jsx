/**
 * PasswordInput — Android
 *
 * Uses GoogleSans-Regular font via className, with includeFontPadding: false
 * and textAlignVertical: 'center' to fix Android text centering quirks.
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
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
    <View className="w-full flex-row items-center bg-surface rounded-input border border-border pl-3 pr-2 h-14">
      <TextInput
        className="flex-1 text-black font-sansReg"
        style={{ includeFontPadding: false, textAlignVertical: 'center', paddingVertical: 0 }}
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
        className="h-[30px] w-[30px] justify-center items-center ml-1"
        activeOpacity={0.7}
      >
        {showPassword ? (
          <Ionicons name="eye-outline" size={22} color="#64748b" />
        ) : (
          <ClosedEyeIcon size={22} color="#64748b" />
        )}
      </TouchableOpacity>
    </View>
  );
}
