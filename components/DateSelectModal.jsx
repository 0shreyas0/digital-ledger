import React from "react";
import { View, Text } from "react-native";
import Modal from "react-native-modal";
import { Calendar } from "react-native-calendars";
import { useTheme } from "@/context/ThemeContext";
import CloseButton from "./CloseButton";

const DateSelectModal = ({
  isVisible,
  onClose,
  date,
  onSelectDate,
}) => {
  const { colors } = useTheme();
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      animationOutTiming={300}
      avoidKeyboard={true}
    >
      <View className="bg-card h-[465px] rounded-t-3xl p-6 pb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-sansBold text-2xl text-textMain">Select Date</Text>
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
          }}
        />
      </View>
    </Modal>
  );
};

export default DateSelectModal;
