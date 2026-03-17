import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ErrorBannerProps = {
  error: string;
  setError: (value: string) => void;
};

export default function ErrorBanner({ error, setError }: ErrorBannerProps) {
  if (!error) return null;

  return (
    <View className="border-l-4 border-l-red-500 bg-red-200 flex-row items-center px-3 py-4 rounded-2xl">
      <Ionicons name="alert-circle" size={20} color="#ef4444" />
      <Text
        className="flex-1 font-sansReg pl-3 text-red-800"
        style={{ includeFontPadding: false }}
      >
        {error}
      </Text>
      <Pressable onPress={() => setError('')}>
        <Ionicons name="close" size={20} color="#ef4444" />
      </Pressable>
    </View>
  );
}
