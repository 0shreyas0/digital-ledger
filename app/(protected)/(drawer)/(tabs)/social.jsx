import React from 'react';
import { Text } from 'react-native';
import SafeScreen from '@/components/SafeScreen';

const SocialScreen = () => {
  return (
    <SafeScreen className="items-center justify-center">
      <Text className="font-sansBold text-2xl text-textMain">Social</Text>
      <Text className="font-sansReg text-textMuted mt-2">Connect with friends</Text>
    </SafeScreen>
  );
};

export default SocialScreen;
