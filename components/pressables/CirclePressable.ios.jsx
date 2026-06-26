import React from 'react'
import { useTheme } from '@/context/ThemeContext'

function ioniconsToSF(ioniconsName) {
  const map = {
    'arrow-back': 'chevron.left',
    'chevron-back': 'chevron.left',
    'arrow-forward': 'chevron.right',
    close: 'xmark',
    add: 'plus',
    checkmark: 'checkmark',
    trash: 'trash',
    'trash-outline': 'trash',
    pencil: 'pencil',
    create: 'pencil',
    'log-out': 'rectangle.portrait.and.arrow.right',
    'log-out-outline': 'rectangle.portrait.and.arrow.right',
    'exit': 'rectangle.portrait.and.arrow.right',
  };
  return map[ioniconsName] ?? ioniconsName;
}

const CirclePressable = ({
  name,
  onPress,
  style,
  iconColor,
  ...props
}) => {
  const { Host, Button } = require('@expo/ui/swift-ui');
  const { buttonStyle, buttonBorderShape, controlSize, labelStyle, imageScale, frame, tint } =
    require('@expo/ui/swift-ui/modifiers');

  return (
    <Host matchContents style={[{ width: 60, height: 60 }, style]}>
      <Button
        label={name}
        systemImage={ioniconsToSF(name)}
        onPress={onPress}
        modifiers={[
          frame({ width: 60, height: 60 }),
          buttonStyle('glass'),
          buttonBorderShape('circle'),
          controlSize('large'),
          labelStyle('iconOnly'),
          imageScale('medium'),
          iconColor && tint(iconColor),
        ].filter(Boolean)}
      />
    </Host>
  );
}

export default CirclePressable;
