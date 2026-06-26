import React from "react";
import { View, Text } from "react-native";
import { Calendar } from "react-native-calendars";
import { useTheme } from "@/context/ThemeContext";
import CloseButton from "../CloseButton";
import NativeBottomSheet from "../NativeBottomSheet";

const DateSelectModal = ({
  isVisible,
  onClose,
  date,
  onSelectDate,
}) => {
  const { colors } = useTheme();

  return (
    <NativeBottomSheet isVisible={isVisible} onClose={onClose} snapPoint="60%">
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ fontFamily: "GoogleSans-Bold", fontSize: 22, color: colors.textMain }}>
          Select Date
        </Text>
        <CloseButton onPress={onClose} />
      </View>
      <Calendar
        current={date}
        onDayPress={(day) => {
          onSelectDate(day.dateString);
          onClose();
        }}
        markedDates={{
          [date]: { selected: true, selectedColor: colors.textMain },
        }}
        theme={{
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          monthTextColor: colors.textMain,
          textDayFontFamily: "GoogleSans-Regular",
          textMonthFontFamily: "GoogleSans-Bold",
          textDayHeaderFontFamily: "GoogleSans-Medium",
          backgroundColor: "transparent",
          calendarBackground: "transparent",
        }}
      />
    </NativeBottomSheet>
  );
};

export default DateSelectModal;
