import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import CloseButton from "./CloseButton";
import NativeBottomSheet from "./NativeBottomSheet";
import { useTheme } from "@/context/ThemeContext";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const dialYears = Array.from({ length: 11 }, (_, i) => 2020 + i);

const MonthPickerModal = ({
  isVisible,
  onClose,
  onSelectMonth,
  activeDateRange,
}) => {
  const { colors } = useTheme();

  // Pre-calculate initial year and offset synchronously
  let initialYear = new Date().getFullYear();
  if (activeDateRange?.type === "month" && activeDateRange?.start) {
    const parts = activeDateRange.start.split("-");
    if (parts[0]) {
      const parsed = parseInt(parts[0], 10);
      if (!isNaN(parsed)) {
        initialYear = parsed;
      }
    }
  }
  const initialIndex = dialYears.indexOf(initialYear);
  const initialOffset = initialIndex !== -1 ? initialIndex * 40 : 0;

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const yearScrollRef = useRef(null);
  const scrollY = useRef(new Animated.Value(initialOffset)).current;

  useEffect(() => {
    if (isVisible) {
      setSelectedYear(initialYear);
      scrollY.setValue(initialOffset);
      if (yearScrollRef.current) {
        setTimeout(() => {
          yearScrollRef.current?.scrollTo({ y: initialOffset, animated: false });
        }, 50);
      }
    }
  }, [isVisible, activeDateRange]);

  return (
    <NativeBottomSheet isVisible={isVisible} onClose={onClose} snapPoint="60%">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="font-sansBold text-xl text-textMain">Select Month & Year</Text>
        <CloseButton onPress={onClose} />
      </View>

      <View className="items-center mb-6">
        <View style={{ height: 120 }} className="w-full items-center justify-center relative">
          {/* Framed selection indicator pill in center */}
          <View
            style={{
              position: "absolute",
              height: 40,
              top: 40,
              left: "25%",
              right: "25%",
              backgroundColor: colors.primary + "15",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.primary + "30",
            }}
            className="pointer-events-none"
          />
          <Animated.ScrollView
            key={`${isVisible}-${initialYear}`}
            ref={yearScrollRef}
            contentOffset={{ x: 0, y: initialOffset }}
            showsVerticalScrollIndicator={false}
            snapToInterval={40}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: true,
                listener: (e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.y / 40);
                  const year = dialYears[index];
                  if (year && year !== selectedYear) setSelectedYear(year);
                },
              }
            )}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / 40);
              const year = dialYears[index];
              if (year) setSelectedYear(year);
            }}
            contentContainerStyle={{ paddingVertical: 40 }}
          >
            {dialYears.map((y, index) => {
              const itemOffset = index * 40;

              // Interpolate for 3D wheel curvature effect
              const rotateX = scrollY.interpolate({
                inputRange: [
                  itemOffset - 120,
                  itemOffset - 80,
                  itemOffset - 40,
                  itemOffset,
                  itemOffset + 40,
                  itemOffset + 80,
                  itemOffset + 120,
                ],
                outputRange: [
                  "60deg",
                  "45deg",
                  "25deg",
                  "0deg",
                  "-25deg",
                  "-45deg",
                  "-60deg",
                ],
                extrapolate: "clamp",
              });

              const scale = scrollY.interpolate({
                inputRange: [
                  itemOffset - 80,
                  itemOffset - 40,
                  itemOffset,
                  itemOffset + 40,
                  itemOffset + 80,
                ],
                outputRange: [0.8, 0.95, 1.1, 0.95, 0.8],
                extrapolate: "clamp",
              });

              const opacity = scrollY.interpolate({
                inputRange: [
                  itemOffset - 80,
                  itemOffset - 40,
                  itemOffset,
                  itemOffset + 40,
                  itemOffset + 80,
                ],
                outputRange: [0.15, 0.45, 1, 0.45, 0.15],
                extrapolate: "clamp",
              });

              const translateY = scrollY.interpolate({
                inputRange: [
                  itemOffset - 80,
                  itemOffset - 40,
                  itemOffset,
                  itemOffset + 40,
                  itemOffset + 80,
                ],
                outputRange: [12, 5, 0, -5, -12],
                extrapolate: "clamp",
              });

              return (
                <Animated.View
                  key={y}
                  style={{
                    height: 40,
                    opacity,
                    transform: [
                      { perspective: 400 },
                      { rotateX },
                      { scale },
                      { translateY },
                    ],
                  }}
                  className="items-center justify-center w-40"
                >
                  <Animated.Text
                    style={{
                      color: selectedYear === y ? colors.primary : colors.textMain,
                    }}
                    className="font-sansBold text-2xl"
                  >
                    {y}
                  </Animated.Text>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {months.map((m, i) => {
          const isSelected =
            activeDateRange?.type === "month" &&
            activeDateRange?.start?.split("-")[1] ==
              String(i + 1).padStart(2, "0") &&
            activeDateRange?.start?.split("-")[0] == selectedYear;

          return (
            <TouchableOpacity
              key={m}
              onPress={() => onSelectMonth(i, selectedYear)}
              className={`w-[31%] p-4 rounded-2xl items-center border ${
                isSelected
                  ? "bg-segmentedControl border-segmentedControl"
                  : "bg-surface border-borderSubtle"
              }`}
            >
              <Text
                className={`font-sansMed ${
                  isSelected ? "text-white" : "text-textMain"
                }`}
              >
                {m.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </NativeBottomSheet>
  );
};

export default MonthPickerModal;
