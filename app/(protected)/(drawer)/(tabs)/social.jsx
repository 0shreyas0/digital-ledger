import React from 'react';
import { View, Text } from 'react-native';

const SocialScreen = () => {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="font-sansBold text-2xl text-textMain">Social</Text>
      <Text className="font-sansReg text-textMuted mt-2">Connect with friends</Text>
    </View>
  );
};

export default SocialScreen;
