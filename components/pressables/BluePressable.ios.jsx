import { Platform } from 'react-native';
import React from 'react';
import { useTheme } from '@/context/ThemeContext';

function ioniconsToSF(ioniconsName) {
  const map = {
    add: 'plus',
    checkmark: 'checkmark',
    'checkmark-circle': 'checkmark.circle',
    close: 'xmark',
    save: 'checkmark',
    create: 'pencil',
    trash: 'trash',
    pencil: 'pencil',
    'arrow-back': 'chevron.left',
    'chevron-back': 'chevron.left',
  };
  return map[ioniconsName] ?? ioniconsName;
}

const BluePressable = ({
  name,
  text,
  direction = 'left',
  isLoading = false,
  disabled = isLoading,
  loadingText = 'Loading',
  hasIcon = true,
  onPress,
  style,
  variant = 'transparent',   // ← 'transparent' or 'opaque'
  ...props
}) => {
  const { Host, Button } = require('@expo/ui/swift-ui');
  const {
    buttonStyle,
    buttonBorderShape,
    labelStyle,
    controlSize,
    imageScale,
  } = require('@expo/ui/swift-ui/modifiers');

  return (
    <Host matchContents style={[{ width: 60, height: 60 }, style]}>
      <Button
        label={text || name}
        systemImage={ioniconsToSF(name)}
        onPress={disabled ? undefined : onPress}
        modifiers={[
          buttonStyle('glass'),
          buttonBorderShape('circle'),
          controlSize('large'),
          labelStyle('iconOnly'),
          imageScale('medium'),
        ]}
      />
    </Host>
  );
};

export default BluePressable;
