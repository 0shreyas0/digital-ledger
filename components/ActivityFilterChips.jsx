import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppPressable from '@/components/pressables/AppPressable';
import { useTheme } from '@/context/ThemeContext';

const DATE_FILTERS = [
  { label: 'All',   value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Week',  value: 'week' },
  { label: 'Month', value: 'month' },
];

/**
 * ActivityFilterChips
 * Horizontal scrollable row of date-range filter pills.
 * On iOS 26+: liquid glass capsules — both selected and unselected use the same
 * glassEffect rendering path for consistent sizing and no shadow boundary.
 * Selected state is shown by a primary-color tint on the glass material.
 * On Android / older iOS: plain AppPressable pills.
 */
const ActivityFilterChips = ({ activeType = 'all', onPress }) => {
  const { colors } = useTheme();

  const isGlassEffectAvailable =
    Platform.OS === 'ios' && require('expo-glass-effect').isGlassEffectAPIAvailable();

  const glassUi = isGlassEffectAvailable
    ? require('@expo/ui/swift-ui')
    : null;

  const glassModifiers = isGlassEffectAvailable
    ? require('@expo/ui/swift-ui/modifiers')
    : null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 30, gap: 10, flexGrow: 1, justifyContent: 'center' }}
    >
      {isGlassEffectAvailable ? (
        <glassUi.Host matchContents>
          <glassUi.GlassEffectContainer spacing={10}>
            <glassUi.HStack spacing={10}>
              {DATE_FILTERS.map((f) => {
                const isSelected = activeType === f.value;
                const hasChevron = f.value === 'week' || f.value === 'month';

                return (
                  <glassUi.Button
                    key={f.value}
                    label={f.label}
                    systemImage={hasChevron ? 'chevron.down' : undefined}
                    onPress={() => onPress(f.value)}
                    modifiers={[
                      glassModifiers.buttonStyle('plain'),
                      glassModifiers.buttonBorderShape('capsule'),
                      glassModifiers.controlSize('regular'),
                      glassModifiers.labelStyle(hasChevron ? 'titleAndIcon' : 'titleOnly'),
                      glassModifiers.padding({ top: 8, bottom: 8, leading: 10, trailing: 10 }),
                      isSelected && glassModifiers.foregroundStyle('#ffffff'),
                      glassModifiers.glassEffect({
                        glass: {
                          variant: 'regular',
                          interactive: true,
                          ...(isSelected && { tint: colors.segmentedControl }),
                        },
                        shape: 'capsule',
                      }),
                    ].filter(Boolean)}
                  />
                );
              })}
            </glassUi.HStack>
          </glassUi.GlassEffectContainer>
        </glassUi.Host>
      ) : (
        DATE_FILTERS.map((f) => {
          const isSelected = activeType === f.value;
          const hasChevron = f.value === 'week' || f.value === 'month';

          return (
            <AppPressable
              key={f.value}
              onPress={() => onPress(f.value)}
              className={`px-5 py-2 rounded-full border ${
                isSelected
                  ? 'bg-segmentedControl border-segmentedControl'
                  : 'bg-card border-transparent'
              }`}
            >
              {({ pressed }) => (
                <View className="flex-row items-center gap-1">
                  <Text
                    className={`font-sansMed ${
                      pressed ? 'text-black' : isSelected ? 'text-white' : 'text-textMain'
                    }`}
                  >
                    {f.label}
                  </Text>
                  {hasChevron && (
                    <Ionicons
                      name="chevron-down"
                      size={12}
                      color={pressed ? 'black' : isSelected ? 'white' : colors.textMuted}
                    />
                  )}
                </View>
              )}
            </AppPressable>
          );
        })
      )}
    </ScrollView>
  );
};

export default ActivityFilterChips;
