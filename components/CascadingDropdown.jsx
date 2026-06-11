import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

/**
 * CascadingDropdown - A reusable accordion dropdown component.
 * Smoothly animates height between 0 and measured content height.
 */
const CascadingDropdown = ({
  title,
  headerContent,
  previewValue,
  isOpen,
  onToggle,
  onDelete,
  showDelete = false,
  children,
}) => {
  const { colors } = useTheme();
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useSharedValue(0);

  const onContentLayout = (e) => {
    const measured = e.nativeEvent.layout.height;
    if (measured > 0 && measured !== contentHeight) {
      setContentHeight(measured);
      if (isOpen) {
        animatedHeight.value = withTiming(measured, {
          duration: 250,
          easing: Easing.inOut(Easing.ease),
        });
      }
    }
  };

  // Drive animation when isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      animatedHeight.value = withTiming(contentHeight || 0, {
        duration: 250,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      animatedHeight.value = withTiming(0, {
        duration: 250,
        easing: Easing.inOut(Easing.ease),
      });
    }
  }, [isOpen, contentHeight]);

  const containerStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: 'hidden',
    opacity: animatedHeight.value === 0 ? 0 : 1,
  }));

  return (
    <View>
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row justify-between items-center"
        activeOpacity={0.7}
      >
        {headerContent || (
          <Text className="font-sansBold text-textMuted">{title}</Text>
        )}
        <View className="flex-row items-center gap-2">
          {previewValue && !isOpen && (
            <Text className="font-sansMed text-primary text-sm capitalize">
              {previewValue}
            </Text>
          )}
          {showDelete && isOpen && onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              className="p-1"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="trash-outline"
                size={15}
                color={colors.red || '#EF4444'}
              />
            </TouchableOpacity>
          )}
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* Animated collapsible container */}
      <Animated.View style={containerStyle}>
        <View
          onLayout={onContentLayout}
          style={{ position: 'absolute', width: '100%' }}
        >
          <View style={{ paddingTop: 12 }}>{children}</View>
        </View>
      </Animated.View>
    </View>
  );
};

export default CascadingDropdown;
