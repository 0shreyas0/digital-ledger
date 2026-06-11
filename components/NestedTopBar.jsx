import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import CirclePressable from './pressables/CirclePressable';

const NestedTopBar = ({ title, onBack, rightElement }) => {
  const router = useRouter();
  const handleBack = onBack || (() => router.back());

  return (
    <View className="flex-row items-center justify-between mx-6 my-3 pb-3 border-b-2 border-borderSubtle">
      <View className="flex-row items-center gap-4 flex-1">
        <CirclePressable
          name="arrow-back"
          onPress={handleBack}
        />
        <Text className="font-sansBold text-textMuted text-2xl flex-1" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {rightElement && (
        <View className="ml-4">
          {rightElement}
        </View>
      )}
    </View>
  );
};

export default NestedTopBar;
