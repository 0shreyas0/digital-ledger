import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import AppPressable from '@/components/pressables/AppPressable';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

type ErrorBannerProps = {
  error: string;
  setError: (value: string) => void;
};

export default function ErrorBanner({ error, setError }: ErrorBannerProps) {
  const [currentError, setCurrentError] = useState(error);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [parentWidth, setParentWidth] = useState(0);

  const animatedHeight = useSharedValue(0);
  const animatedWidth = useSharedValue(48);
  const textOpacity = useSharedValue(0);

  // Synchronize error prop changes
  useEffect(() => {
    if (error) {
      setCurrentError(error);
    } else {
      // Transition out sequence:
      // 1. Shrink width first
      animatedWidth.value = withTiming(48, {
        duration: 240,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      textOpacity.value = withTiming(0, { duration: 150 });

      // 2. Shrink height next (with overlap)
      animatedHeight.value = withDelay(
        180,
        withTiming(
          0,
          {
            duration: 180,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          },
          (finished) => {
            if (finished) {
              runOnJS(setCurrentError)('');
            }
          }
        )
      );
    }
  }, [error]);

  // When height is measured, animate in
  useEffect(() => {
    if (currentError && measuredHeight > 0 && parentWidth > 0) {
      // Transition in sequence:
      // 1. Expand height first
      animatedHeight.value = withTiming(measuredHeight, {
        duration: 180,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      // 2. Expand width next (with overlap)
      animatedWidth.value = withDelay(
        120,
        withTiming(parentWidth, {
          duration: 240,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );

      // 3. Fade in text slightly after width starts expanding
      textOpacity.value = withDelay(180, withTiming(1, { duration: 150 }));
    }
  }, [currentError, measuredHeight, parentWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
      width: animatedWidth.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    };
  });

  return (
    <View
      className="w-full items-start"
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        if (width > 0) {
          setParentWidth(width);
        }
      }}
    >
      {/* Invisible measurement view (absolute positioned so Y-axis layout constraints don't limit it) */}
      {!!error && (
        <View
          className="absolute w-full opacity-0 -z-[1000] border-l-4 border-l-dangerBorder bg-dangerBox flex-row items-center px-3 py-4 rounded-card"
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            if (height > 0) {
              setMeasuredHeight(height);
            }
          }}
        >
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text className="flex-1 font-sansReg pl-3 text-red-800" style={{ includeFontPadding: false }}>
            {error}
          </Text>
          <Ionicons name="close" size={20} color="#ef4444" />
        </View>
      )}

      {/* Animated visible view */}
      <Animated.View
        className="bg-dangerBox border-l-4 border-l-dangerBorder rounded-card overflow-hidden"
        style={animatedStyle}
      >
        {!!currentError && (
          <View className="flex-row items-center h-full px-3" style={{ width: parentWidth }}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Animated.View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 }, textAnimatedStyle]}>
              <Text
                className="flex-1 font-sansReg text-red-800"
                style={{ includeFontPadding: false }}
                numberOfLines={1}
              >
                {currentError}
              </Text>
              <AppPressable onPress={() => setError('')} activeClassName="" className="p-1">
                <Ionicons name="close" size={20} color="#ef4444" />
              </AppPressable>
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
