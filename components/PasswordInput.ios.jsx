/**
 * PasswordInput — iOS
 *
 * Uses System font (native iOS default) with no includeFontPadding hacks
 * since those are Android-only concerns.
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
        className="flex-1 text-black"
        style={{ fontFamily: 'System', paddingVertical: 0 }}
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
