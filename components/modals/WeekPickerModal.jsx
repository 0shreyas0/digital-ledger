import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Dimensions, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CloseButton from "../CloseButton";
import NativeBottomSheet from "../NativeBottomSheet";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

const WeekPickerModal = ({
  isVisible,
  onClose,
  onSelectWeek,
  markedWeekDates,
  colors,
}) => {
  // Get screen layout dimensions mathematically safely
  const { width: screenWidth } = Dimensions.get("window");
  const gridWidth = Math.floor(screenWidth - 48); // 24 padding each side from NativeBottomSheet
  const cellWidth = Math.floor(gridWidth / 7);
  const cellHeight = 44; 

  // Animated values for Segment 1 (first row portion of range selection)
  const seg1Left = useRef(new Animated.Value(0)).current;
  const seg1Top = useRef(new Animated.Value(0)).current;
  const seg1Width = useRef(new Animated.Value(0)).current;
  const seg1Opacity = useRef(new Animated.Value(0)).current;

  // Animated values for Segment 2 (second row portion if range wraps)
  const seg2Left = useRef(new Animated.Value(0)).current;
  const seg2Top = useRef(new Animated.Value(0)).current;
  const seg2Width = useRef(new Animated.Value(0)).current;
  const seg2Opacity = useRef(new Animated.Value(0)).current;

  const initialDateStr = useMemo(() => {
    const keys = Object.keys(markedWeekDates || {});
    return keys.length > 0 ? keys[0] : new Date().toISOString().split("T")[0];
  }, [markedWeekDates]);

  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(initialDateStr));

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Generate 42 days grid cells (6 rows)
  const gridCells = useMemo(() => {
    const cells = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    // 1. Previous month padded days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const date = new Date(year, month - 1, dayNum);
      cells.push({
        dateStr: formatDate(date),
        dayNum,
        isCurrentMonth: false,
      });
    }

    // 2. Current month days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      cells.push({
        dateStr: formatDate(date),
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // 3. Next month padded days
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      cells.push({
        dateStr: formatDate(date),
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month]);

  const { startIndex, endIndex } = useMemo(() => {
    const keys = Object.keys(markedWeekDates || {});
    if (keys.length === 0) return { startIndex: -1, endIndex: -1 };

    const startStr = keys.find((k) => markedWeekDates[k].startingDay) || keys[0];
    const endStr = keys.find((k) => markedWeekDates[k].endingDay) || keys[keys.length - 1];

    const startIdx = gridCells.findIndex((c) => c.dateStr === startStr);
    const endIdx = gridCells.findIndex((c) => c.dateStr === endStr);

    return { startIndex: startIdx, endIndex: endIdx };
  }, [markedWeekDates, gridCells]);

  // Spring animation logic for smooth sliding/stretching transition
  const animateSelection = (startIdx, endIdx) => {
    let targetSeg1 = { left: 0, top: 0, width: 0, opacity: 0 };
    let targetSeg2 = { left: 0, top: 0, width: 0, opacity: 0 };

    const row1 = startIdx !== -1 ? Math.floor(startIdx / 7) : -1;
    const col1 = startIdx !== -1 ? startIdx % 7 : 0;
    const row2 = endIdx !== -1 ? Math.floor(endIdx / 7) : -1;
    const col2 = endIdx !== -1 ? endIdx % 7 : 0;

    if (startIdx !== -1 && endIdx !== -1) {
      if (row1 === row2) {
        // Single row selection
        targetSeg1 = {
          left: col1 * cellWidth,
          top: row1 * cellHeight + 2,
          width: (col2 - col1 + 1) * cellWidth,
          opacity: 1,
        };
      } else {
        // Wraps across two rows
        targetSeg1 = {
          left: col1 * cellWidth,
          top: row1 * cellHeight + 2,
          width: (7 - col1) * cellWidth,
          opacity: 1,
        };
        targetSeg2 = {
          left: 0,
          top: row2 * cellHeight + 2,
          width: (col2 + 1) * cellWidth,
          opacity: 1,
        };
      }
    }

    // Smooth L-shaped slide: Y-axis slides first (150ms), followed immediately by X-axis slither (220ms)
    Animated.sequence([
      Animated.parallel([
        Animated.timing(seg1Top, { toValue: targetSeg1.top, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(seg2Top, { toValue: targetSeg2.top, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.timing(seg1Left, { toValue: targetSeg1.left, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(seg1Width, { toValue: targetSeg1.width, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(seg1Opacity, { toValue: targetSeg1.opacity, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false }),

        Animated.timing(seg2Left, { toValue: targetSeg2.left, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(seg2Width, { toValue: targetSeg2.width, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(seg2Opacity, { toValue: targetSeg2.opacity, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      ]),
    ]).start();
  };

  useEffect(() => {
    animateSelection(startIndex, endIndex);
  }, [startIndex, endIndex]);

  return (
    <NativeBottomSheet isVisible={isVisible} onClose={onClose} snapPoint="60%">
      {/* Modal Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="font-sansBold text-xl text-textMain">Select Start of Week</Text>
        <CloseButton onPress={onClose} />
      </View>

      {/* Calendar Controller */}
      <View className="flex-row justify-between items-center px-4 mb-4">
        <TouchableOpacity onPress={handlePrevMonth} className="p-2">
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text className="font-sansBold text-lg text-textMain">
          {months[month]} {year}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} className="p-2">
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Weekdays Row */}
      <View className="flex-row mb-2">
        {weekdays.map((day) => (
          <View key={day} style={{ width: cellWidth }} className="items-center justify-center">
            <Text className="font-sansMed text-textMuted text-xs uppercase">{day}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid Container */}
      <View style={{ width: gridWidth, height: 6 * cellHeight }} className="relative">
        {/* Animated Segment 1 (Slithering Selection Pill) */}
        <Animated.View
          style={{
            position: "absolute",
            left: seg1Left,
            top: seg1Top,
            width: seg1Width,
            height: 40,
            opacity: seg1Opacity,
            backgroundColor: colors.primary,
            borderRadius: 20,
          }}
        />

        {/* Animated Segment 2 (Wrapped selection pill) */}
        <Animated.View
          style={{
            position: "absolute",
            left: seg2Left,
            top: seg2Top,
            width: seg2Width,
            height: 40,
            opacity: seg2Opacity,
            backgroundColor: colors.primary,
            borderRadius: 20,
          }}
        />

        {/* Days Touchable Layer */}
        <View className="flex-row flex-wrap">
          {gridCells.map((cell) => {
            const isSelected = !!markedWeekDates?.[cell.dateStr];

            return (
              <TouchableOpacity
                key={cell.dateStr}
                activeOpacity={0.7}
                onPress={() => onSelectWeek({ dateString: cell.dateStr })}
                style={{ width: cellWidth, height: cellHeight }}
                className="items-center justify-center relative"
              >
                <Text
                  className={`font-sansMed text-base ${
                    isSelected
                      ? "text-white font-sansBold"
                      : cell.isCurrentMonth
                      ? "text-textMain"
                      : "text-borderSubtle"
                  }`}
                >
                  {cell.dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </NativeBottomSheet>
  );
};

export default WeekPickerModal;
