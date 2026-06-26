/**
 * ActivityFilterChips — iOS
 *
 * iOS 26 liquid glass capsules using @expo/ui/swift-ui.
 * Both selected and unselected chips share the same glassEffect path for
 * consistent sizing. Selected state is shown via a primary-color tint on
 * the glass material.
 *
 * NOTE: Do NOT use opacity() modifier — it fades icons/text too.
 * Glass transparency is driven by BlurView intensity in the tab bar.
 */

import React from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Host, GlassEffectContainer, HStack, Button } from '@expo/ui/swift-ui';
import {
  buttonStyle,
  buttonBorderShape,
  controlSize,
  labelStyle,
  padding,
  foregroundStyle,
  glassEffect,
  fixedSize,
} from '@expo/ui/swift-ui/modifiers';

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
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 14,
        gap: 10,
        flexGrow: 1,
        justifyContent: 'center',
      }}
    >
      <Host matchContents>
        <GlassEffectContainer spacing={10}>
          <HStack spacing={10}>
            {DATE_FILTERS.map((f) => {
              const isSelected = activeType === f.value;
              const hasChevron = f.value === 'week' || f.value === 'month';

              return (
                <Button
                  key={f.value}
                  label={f.label}
                  systemImage={hasChevron ? 'chevron.down' : undefined}
                  onPress={() => onPress(f.value)}
                  modifiers={[
                    buttonStyle('plain'),
                    buttonBorderShape('capsule'),
                    controlSize('regular'),
                    labelStyle(hasChevron ? 'titleAndIcon' : 'titleOnly'),
                    fixedSize({ horizontal: true, vertical: false }),
                    padding({
                      top: 8,
                      bottom: 8,
                      leading: 12,
                      trailing: hasChevron ? 12 : 14,
                    }),
                    isSelected && foregroundStyle('#ffffff'),
                    glassEffect({
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
          </HStack>
        </GlassEffectContainer>
      </Host>
    </ScrollView>
  );
};

export default ActivityFilterChips;
