import React from 'react'
import { TextInput } from 'react-native';

const OTPInput = ({code, setCode}) => {
  return (
    <>
      <TextInput 
        className="w-full bg-slate-50 px-3 py-4 rounded-2xl font-sansReg border border-slate-400"
        value={code}
        placeholder="Verification Code"
        onChangeText={setCode}
      />
    </>
  )
}

export default OTPInput;

// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Dimensions,
//   Animated,
// } from "react-native";
// import { useRef, useEffect } from "react";

// const { width } = Dimensions.get("window");

// export default function OTPInput({ code, setCode }) {
//   const inputRef = useRef(null);

//   const BOX_COUNT = 6;
//   const GAP = 8;
//   const TOTAL_GAP = GAP * (BOX_COUNT - 1);

//   const boxSize = (width - TOTAL_GAP - 32) / BOX_COUNT;

//   // blinking cursor
//   const opacity = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(opacity, {
//           toValue: 0,
//           duration: 500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(opacity, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   const handleChange = (text) => {
//     const cleaned = text.replace(/[^0-9]/g, "").slice(0, 6);
//     setCode(cleaned);
//   };

//   return (
//     <TouchableOpacity
//       activeOpacity={1}
//       onPress={() => inputRef.current.focus()}
//     >
//       <View className="w-full py-4 flex-row px-4">
//         {[...Array(BOX_COUNT)].map((_, i) => {
//           const digit = code[i] || "";
//           const isFocused = i === code.length;

//           return (
//             <View
//               key={i}
//               style={{
//                 width: boxSize,
//                 height: boxSize,
//                 marginRight: i !== BOX_COUNT - 1 ? GAP : 0,
//               }}
//               className="border border-slate-400 rounded-xl items-center justify-center bg-slate-50"
//             >
//               {digit ? (
//                 <Text className="text-lg">{digit}</Text>
//               ) : isFocused ? (
//                 <Animated.View
//                   style={{ opacity }}
//                   className="w-[2px] h-6 bg-black"
//                 />
//               ) : null}
//             </View>
//           );
//         })}
//       </View>

//       <TextInput
//         ref={inputRef}
//         value={code}
//         onChangeText={handleChange}
//         keyboardType="number-pad"
//         maxLength={6}
//         className="absolute opacity-0"
//       />
//     </TouchableOpacity>
//   );
// }
