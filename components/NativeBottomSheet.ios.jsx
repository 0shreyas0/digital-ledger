/**
 * NativeBottomSheet — iOS
 *
 * Uses @expo/ui/community BottomSheet (native SwiftUI sheet with system
 * glass background). No react-native-modal dependency on this platform.
 *
 * Props:
 *   isVisible          {boolean}  — controls open/closed state
 *   onClose            {fn}       — called when sheet should close
 *   snapPoint          {string}   — e.g. "50%" | "75%" | "90%"
 *   bgOpacity          {number}   — 0–1, sheet background opacity (default 0.02 = near-clear)
 *   preventNativeDismiss {boolean} — blocks swipe/backdrop dismiss so an alert can fire first
 *   children           {node}     — content rendered inside the sheet
 */

import React, { useRef } from "react";
import { StyleSheet } from "react-native";
import { BottomSheet, BottomSheetView } from "@expo/ui/community/bottom-sheet";

const NativeBottomSheet = ({
  isVisible,
  onClose,
  snapPoint = "55%",
  bgOpacity = 0.02,
  preventNativeDismiss = false,
  children,
}) => {
  const sheetRef = useRef(null);
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
      <BottomSheetView style={styles.content}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
});

export default NativeBottomSheet;
