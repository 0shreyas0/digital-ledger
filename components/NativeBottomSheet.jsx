/**
 * NativeBottomSheet
 *
 * A reusable bottom sheet wrapper that uses:
 *   - iOS: @expo/ui community BottomSheet (native SwiftUI sheet with system glass background)
 *   - Android/Web: react-native-modal (standard bottom slide-up)
 *
 * Props:
 *   isVisible  {boolean}  — controls open/closed state
 *   onClose    {fn}       — called when sheet should close (swipe, backdrop tap)
 *   snapPoint  {string}   — e.g. "50%" | "75%" | "90%"  (iOS only, ignored on Android)
 *   bgOpacity  {number}   — 0–1, sheet background opacity (iOS only, default 0.02 = near-clear)
 *   children   {node}     — content rendered inside the sheet
 */

import React, { useRef } from "react";
import { View, Platform, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";

// Platform-split imports
let BottomSheet, BottomSheetView;
if (Platform.OS === "ios") {
  const mod = require("@expo/ui/community/bottom-sheet");
  BottomSheet = mod.BottomSheet;
  BottomSheetView = mod.BottomSheetView;
}

let Modal;
if (Platform.OS !== "ios") {
  Modal = require("react-native-modal").default;
}

const NativeBottomSheet = ({
  isVisible,
  onClose,
  snapPoint = "55%",
  bgOpacity = 0.02,
  // When true: disables native swipe/backdrop dismiss on iOS so an alert
  // can fire first while the sheet stays open. Pass hasUnsavedChanges here.
  preventNativeDismiss = false,
  children,
}) => {
  const { colors } = useTheme();
  const sheetRef = useRef(null);

  if (Platform.OS === "ios") {
    const bgRgba = `rgba(255, 255, 255, ${bgOpacity})`;
    return (
      <BottomSheet
        ref={sheetRef}
        index={isVisible ? 0 : -1}
        snapPoints={[snapPoint]}
        enablePanDownToClose={!preventNativeDismiss}
        enableDynamicSizing={false}
        onClose={onClose}
        backgroundStyle={{ backgroundColor: bgRgba }}
      >
        <BottomSheetView style={styles.iosContent}>
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  }

  // Android / Web fallback
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
          styles.androidSheet,
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
  iosContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  modalStyle: {
    justifyContent: "flex-end",
    margin: 0,
  },
  androidSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 24,
  },
});

export default NativeBottomSheet;
