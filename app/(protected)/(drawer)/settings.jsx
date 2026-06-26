import React from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, ScrollView, Platform } from 'react-native';
import SafeScreen from '@/components/SafeScreen';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NestedTopBar from '@/components/NestedTopBar';
import AppPressable from '@/components/pressables/AppPressable';

/**
 * GlassOpacitySlider
 *
 * On iOS 26+ with the Glass Effect API: renders a native SwiftUI Slider
 * inside a GlassEffectContainer — same pattern as ActivityFilterChips.
 * On Android / older iOS: renders a plain @expo/ui universal Slider.
 */
const GlassOpacitySlider = ({ value, onChange, colors }) => {
  const isGlassEffectAvailable =
    Platform.OS === 'ios' && require('expo-glass-effect').isGlassEffectAPIAvailable();

  const percentage = `${Math.round(value * 100)}%`;

  if (isGlassEffectAvailable) {
    const { Host, GlassEffectContainer, Slider } = require('@expo/ui/swift-ui');
    const { tint, padding } = require('@expo/ui/swift-ui/modifiers');

    return (
      <View style={{ gap: 8, marginTop: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text className="text-sm font-sansBold text-textMain">Glass Opacity</Text>
          <Text className="text-sm font-sansBold text-primary">{percentage}</Text>
        </View>
        {/* 
          Host must NOT use matchContents here — the Slider needs a proposed width from RN.
          Give it width:'100%' + explicit height so SwiftUI has room to lay out the slider track.
        */}
        <Host style={{ width: '100%', height: 44 }}>
          <GlassEffectContainer spacing={0}>
            <Slider
              value={value}
              min={0.1}
              max={1.0}
              onValueChange={(v) => onChange(parseFloat(v.toFixed(2)))}
              modifiers={[
                tint(colors.primary),
                padding({ top: 4, bottom: 4, leading: 8, trailing: 8 }),
              ]}
            />
          </GlassEffectContainer>
        </Host>
      </View>
    );
  }

  // Fallback: universal @expo/ui Slider for Android / older iOS
  const { Slider } = require('@expo/ui');
  
  let sliderContent = (
    <Slider
      value={value}
      min={0.1}
      max={1.0}
      onValueChange={(v) => onChange(parseFloat(v.toFixed(2)))}
    />
  );

  if (Platform.OS === 'android') {
    const { Host } = require('@expo/ui/jetpack-compose');
    sliderContent = (
      <Host style={{ width: '100%', height: 44 }}>
        {sliderContent}
      </Host>
    );
  } else if (Platform.OS === 'ios') {
    const { Host } = require('@expo/ui/swift-ui');
    sliderContent = (
      <Host style={{ width: '100%', height: 44 }}>
        {sliderContent}
      </Host>
    );
  }

  return (
    <View style={{ gap: 8, marginTop: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text className="text-sm font-sansBold text-textMain">Glass Opacity</Text>
        <Text className="text-sm font-sansBold text-primary">{percentage}</Text>
      </View>
      {sliderContent}
    </View>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setTheme, setThemeMode, glassOpacity, setGlassOpacity, colors } = useTheme();

  const themes = [
    { id: 'ice', label: 'Ice (Default)', icon: 'snow-outline', desc: 'Cool blue & slate tones' },
    { id: 'coffee', label: 'Coffee', icon: 'cafe-outline', desc: 'Warm brown & beige tones' },
    { id: 'purple', label: 'Purple', icon: 'color-palette-outline', desc: 'Royal purple & lavender' },
  ];

  const modes = [
    { id: 'light', label: 'Light', icon: 'sunny-outline' },
    { id: 'dark', label: 'Dark', icon: 'moon-outline' },
    { id: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  const activeIndex = themeMode === 'light' ? 0 : themeMode === 'dark' ? 1 : 2;
  const slideAnim = React.useRef(new Animated.Value(activeIndex)).current;

  React.useEffect(() => {
    const targetValue = themeMode === 'light' ? 0 : themeMode === 'dark' ? 1 : 2;
    Animated.timing(slideAnim, {
      toValue: targetValue,
      useNativeDriver: false,
      duration: 200,
      easing: Easing.linear,
    }).start();
  }, [themeMode]);

  return (
    <SafeScreen>
      {/* Top Header Bar */}
      <NestedTopBar title="Settings" />

      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        <View>
          <Text className="text-2xl font-sansBold text-textMain mb-1">
            Appearance
          </Text>
          <Text className="font-sansReg text-textMuted">
            Personalize your app appearance and theme settings.
          </Text>
        </View>

      {/* Mode Section */}
      <View className="bg-card p-5 rounded-card gap-4 shadow-sm">
        <Text className="text-lg font-sansBold text-textMain">
          App Mode
        </Text>
        {/* Sliding Pill Segmented Control */}
        <View className="flex-row items-center rounded-full border border-borderSubtle bg-surface mt-1 relative overflow-hidden p-1">
          <View className="absolute inset-0 p-1">
            <Animated.View 
              style={{
                width: '33.33%',
                height: '100%',
                left: slideAnim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: ['0%', '33.33%', '66.66%']
                })
              }}
              className="bg-segmentedControl rounded-full"
            />
          </View>
          {modes.map((m) => {
            const isSelected = themeMode === m.id;
            return (
              <AppPressable
                key={m.id}
                onPress={() => setThemeMode(m.id)}
                activeClassName=""
                className="flex-1 py-3 flex-row gap-2 items-center justify-center rounded-full"
              >
                <Ionicons 
                  name={isSelected ? m.icon.replace('-outline', '') : m.icon} 
                  size={18} 
                  color={isSelected ? '#ffffff' : colors.textMain} 
                />
                <Text className={`font-sansBold text-sm ${isSelected ? 'text-white' : 'text-textMain'}`}>
                  {m.label}
                </Text>
              </AppPressable>
            );
          })}
        </View>
      </View>

      {/* Theme Section */}
      <View className="bg-card p-5 rounded-card gap-4 shadow-sm">
        <Text className="text-lg font-sansBold text-textMain">
          App Theme
        </Text>
        <View className="gap-2.5">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTheme(t.id)}
                className={`flex-row items-center justify-between p-4 rounded-xl border ${
                  isSelected 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-surface border-borderSubtle'
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`p-2 rounded-full ${isSelected ? 'bg-primary/20' : 'bg-surface'}`}>
                    <Ionicons 
                      name={t.icon} 
                      size={20} 
                      color={isSelected ? colors.primary : colors.textMuted} 
                    />
                  </View>
                  <View>
                    <Text className={`font-sansBold text-base ${isSelected ? 'text-primary' : 'text-textMain'}`}>
                      {t.label}
                    </Text>
                    <Text className="text-xs font-sansReg text-textMuted">
                      {t.desc}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Glassmorphism Section - iOS Only */}
      {Platform.OS === 'ios' && (
        <View className="bg-card p-5 rounded-card gap-4 shadow-sm">
          <Text className="text-lg font-sansBold text-textMain">
            Glassmorphism
          </Text>
          <Text className="font-sansReg text-textMuted text-xs -mt-2">
            Adjust the opacity level of all glass panels and blur effects across the app.
          </Text>
          <GlassOpacitySlider value={glassOpacity} onChange={setGlassOpacity} colors={colors} />
        </View>
      )}

    </ScrollView>
  </SafeScreen>
  );
}