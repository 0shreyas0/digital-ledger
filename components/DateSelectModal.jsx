import React from "react";
import { View, Text } from "react-native";
import Modal from "react-native-modal";
import { Calendar } from "react-native-calendars";
import colors from "tailwindcss/colors";
import CloseButton from "./CloseButton";

const DateSelectModal = ({
  isVisible,
  onClose,
  date,
  onSelectDate,
}) => {
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
      <View className="bg-white  h-[465px] rounded-t-3xl p-6 pb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-sansBold text-2xl text-slate-800">Select Date</Text>
          <CloseButton onPress={onClose} />
        </View>
        <Calendar
          current={date}
          onDayPress={(day) => {
            onSelectDate(day.dateString);
            onClose();
          }}
          markedDates={{
            [date]: { selected: true, selectedColor: colors.slate[700] },
          }}
          theme={{
            todayTextColor: colors.blue[600],
            arrowColor: colors.blue[600],
            monthTextColor: colors.slate[800],
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
