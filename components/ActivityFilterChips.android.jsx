/**
 * ActivityFilterChips — Android
 *
 * Plain AppPressable pill chips. Selected state uses segmentedControl
 * background colour. No @expo/ui dependency.
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppPressable from '@/components/pressables/AppPressable';
import { useTheme } from '@/context/ThemeContext';

const DATE_FILTERS = [
  { label: 'All',   value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Week',  value: 'week' },
  { label: 'Month', value: 'month' },
];

const ActivityFilterChips = ({ activeType = 'all', onPress }) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        gap: 8,
      }}
    >
      {DATE_FILTERS.map((f) => {
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
                  style={{ includeFontPadding: false, textAlignVertical: 'center' }}
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
      })}
    </ScrollView>
  );
};

export default ActivityFilterChips;
