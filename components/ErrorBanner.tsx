import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
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
      style={{ width: '100%', alignItems: 'flex-start' }}
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
          style={{ position: 'absolute', width: '100%', opacity: 0, zIndex: -1000 }}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            if (height > 0) {
              setMeasuredHeight(height);
            }
          }}
          className="border-l-4 border-l-red-500 bg-red-200 flex-row items-center px-3 py-4 rounded-2xl"
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
        style={[
          {
            backgroundColor: '#fecaca', // bg-red-200
            borderLeftWidth: 4,
            borderLeftColor: '#ef4444', // border-l-red-500
            borderRadius: 16,
            overflow: 'hidden',
          },
          animatedStyle,
        ]}
      >
        {!!currentError && (
          <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%', width: parentWidth, paddingHorizontal: 12 }}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Animated.View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 }, textAnimatedStyle]}>
              <Text
                className="flex-1 font-sansReg text-red-800"
                style={{ includeFontPadding: false }}
                numberOfLines={1}
              >
                {currentError}
              </Text>
              <Pressable onPress={() => setError('')} style={{ padding: 4 }}>
                <Ionicons name="close" size={20} color="#ef4444" />
              </Pressable>
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
