/**
 * NativeBottomSheet — Android
 *
 * Uses react-native-modal for a standard bottom slide-up sheet.
 * No @expo/ui dependency on this platform.
 *
 * Props:
 *   isVisible          {boolean}  — controls open/closed state
 *   onClose            {fn}       — called when backdrop is tapped
 *   snapPoint          {string}   — ignored on Android (modal fills content height)
 *   bgOpacity          {number}   — ignored on Android
 *   preventNativeDismiss {boolean} — ignored on Android (backdrop tap always calls onClose)
 *   children           {node}     — content rendered inside the sheet
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { useTheme } from "@/context/ThemeContext";

const NativeBottomSheet = ({
  isVisible,
  onClose,
  snapPoint,      // unused on Android
  bgOpacity,      // unused on Android
  preventNativeDismiss, // unused on Android
  children,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropColor="transparent"
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      animationOutTiming={300}
      style={styles.modalStyle}
      avoidKeyboard={true}
    >
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalStyle: {
    justifyContent: "flex-end",
    margin: 0,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 24,
  },
});

export default NativeBottomSheet;
