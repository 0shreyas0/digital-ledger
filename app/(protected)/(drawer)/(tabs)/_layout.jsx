import { View, Platform, StyleSheet, Animated, Pressable, Easing, Dimensions } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { usePathname, withLayoutContext } from 'expo-router'
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import { createMaterialTopTabNavigator } from "expo-router/js-top-tabs";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

const TAB_NAMES = ['index', 'activity', 'create', 'social', 'fields'];

// const AnimatedTabBarBackground = ({ selectedIndex, tabCount }) => {
//   const [tabBarWidth, setTabBarWidth] = useState(0);
//   const pillAnim = useRef(new Animated.Value(0)).current;

//   // Active area is the width minus the 16px padding on each side (32 total)
//   const activeAreaWidth = tabBarWidth ? tabBarWidth - 32 : 0;
//   const activeTabWidth = activeAreaWidth / tabCount;

//   const EXTRA_WIDTH = 26;

//   const PILL_WIDTH = activeTabWidth + EXTRA_WIDTH;
//   const PILL_HEIGHT = 62;

//   // FIXED: Changed 14 back to 16 to match paddingHorizontal perfectly
//   // Centered offset: 16px padding - (20 / 2) = 16 - 10 = 6px
//   const PILL_OFFSET_X = 16 - (EXTRA_WIDTH / 2); 

//   useEffect(() => {
//     if (tabBarWidth > 0) {
//       Animated.spring(pillAnim, {
//         toValue: PILL_OFFSET_X + selectedIndex * activeTabWidth,
//         useNativeDriver: true,
//         tension: 68,
//         friction: 11,
//       }).start();
//     }
//   }, [selectedIndex, activeTabWidth, tabBarWidth]);

//   const handleLayout = (event) => {
//     const { width } = event.nativeEvent.layout;
//     setTabBarWidth(width);
//   };

//   return (
//     <View style={StyleSheet.absoluteFillObject} onLayout={handleLayout}>
//       <BlurView
//         tint='default'
//         intensity={20}
//         experimentalBlurMethod="dimezisBlurView"
//         style={{
//           ...StyleSheet.absoluteFillObject,
//           borderRadius: 36, // Match outer container
//           overflow: 'hidden',
//         }}
//       />
//       {tabBarWidth > 0 && (
//         <Animated.View
//           pointerEvents="none"
//           style={{
//             position: 'absolute',
//             top: '50%',
//             marginTop: -(PILL_HEIGHT / 2),
//             left: 0, 
//             width: PILL_WIDTH,
//             height: PILL_HEIGHT,
//             borderRadius: PILL_HEIGHT / 2,
//             overflow: 'hidden', 
//             shadowColor: '#007aff',
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.10,
//             shadowRadius: 8,
//             borderWidth: 1,
//             borderColor: Platform.OS === 'ios'
//               ? 'rgba(255,255,255,0.6)'
//               : 'rgba(255,255,255,0.8)',
//             transform: [{ translateX: pillAnim }],
//           }}
//         >
//           <BlurView
//             tint= 'systemUltraThinMaterialDark'
//             intensity={30}
//             experimentalBlurMethod="dimezisBlurView"
//             style={StyleSheet.absoluteFillObject}
//           />
//           <View
//             style={[
//               StyleSheet.absoluteFillObject,
//               {
//                 backgroundColor: Platform.OS === 'ios'
//                   ? 'rgba(255,255,255,0.1)'
//                   : 'rgba(255,255,255,0.25)',
//               }
//             ]}
//           />
//         </Animated.View>
//       )}
//     </View>
//   );
// };

const AnimatedTabBarBackground = ({ selectedIndex, tabCount, position, pressAnim }) => {
  const { glassOpacity } = useTheme();
  const [tabBarWidth, setTabBarWidth] = useState(Dimensions.get('window').width - 32);

  // Expand active area to increase per-step travel distance (pill starts at -5, so needs wider steps)
  const activeAreaWidth = tabBarWidth ? tabBarWidth - 2 : 0;
  const activeTabWidth = activeAreaWidth / tabCount;

  const EXTRA_WIDTH = 10; // Positive overhang to create a distinct capsule/pill shape
  const PILL_WIDTH = activeTabWidth + EXTRA_WIDTH;
  const PILL_HEIGHT = 46; // Shorter height for a sleeker profile
  const TAB_BAR_HEIGHT = 72; // must match outer container height
  const PILL_TOP = 5; // Centered vertically

  // Centered offset: adjusted left offset to align horizontally with the icons
  const PILL_OFFSET_X = -4;

  // Local spring animation for active tab sliding (guarantees 100% reliability and smooth iOS motion)
  const slideAnim = useRef(new Animated.Value(selectedIndex)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selectedIndex,
      useNativeDriver: true,
      tension: 160,
      friction: 16,
    }).start();
  }, [selectedIndex]);

  // Dynamically generate the interpolation arrays based on tabCount
  const positionInput = [];
  const translateXOutput = [];

  for (let i = 0; i < tabCount; i++) {
    positionInput.push(i);
    translateXOutput.push(PILL_OFFSET_X + i * activeTabWidth);
  }

  // Create the exact values linked to the spring gesture
  const translateX = slideAnim.interpolate({
    inputRange: positionInput,
    outputRange: translateXOutput,
    extrapolate: 'clamp',
  });

  // Simple linear scaling: 0 (rest) -> 1, 1 (fully pressed) -> 1.15 (scaled up)
  const pillPressScale = pressAnim ? pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
    extrapolate: 'clamp',
  }) : 1;

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTabBarWidth(width);
  };

  return (
    <View style={StyleSheet.absoluteFillObject} onLayout={handleLayout} pointerEvents="none">
      {/* iOS only: full-tab BlurView glass background */}
      {Platform.OS === 'ios' && (
        <BlurView
          tint='default'
          intensity={Math.round(10 + glassOpacity * 80)}
          experimentalBlurMethod="dimezisBlurView"
          style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: 36,
            overflow: 'hidden',
          }}
        />
      )}

      {tabBarWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: PILL_TOP,
            left: 0,
            width: PILL_WIDTH,
            height: PILL_HEIGHT,
            borderRadius: PILL_HEIGHT / 2,
            overflow: 'hidden',
            borderWidth: Platform.OS === 'ios' ? 1 : 0,
            borderColor: Platform.OS === 'ios'
              ? 'rgba(255,255,255,0.6)'
              : 'transparent',
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(0, 122, 255, 0.22)',
            transform: [{ translateX }, { scale: pillPressScale }],
          }}
        >
          {Platform.OS === 'ios' && (
            // iOS: glass blur pill
            <>
              <BlurView
                tint='systemUltraThinMaterialDark'
                intensity={Math.round(10 + glassOpacity * 90)}
                experimentalBlurMethod="dimezisBlurView"
                style={StyleSheet.absoluteFillObject}
              />
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  { backgroundColor: `rgba(255,255,255,${glassOpacity * 0.2})` }
                ]}
              />
            </>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation, position }) => {
  const { glassOpacity, colors } = useTheme();
  const insets = useSafeAreaInsets();
  // Drives the pill scale-up/scale-down animation
  const pressAnim = useRef(new Animated.Value(0)).current;
  // Sit 12px above the system nav bar on iOS; on Android, optimize for gesture/3-button modes
  const bottomOffset = Platform.OS === 'ios'
    ? insets.bottom + 12
    : insets.bottom > 30
      ? insets.bottom + 6   // 3-button navigation (e.g. 48px inset): sit tightly above buttons
      : Math.max(insets.bottom, 12); // gesture navigation (e.g. 16-24px inset): match side margin (16px) for corner concentricity

  return (
    <View
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: 0,
        right: 0,
        height: 72, // FIXED: 60px pill + 6px top pad + 6px bottom pad = 72
        borderRadius: 36, // FIXED: Keep it perfectly rounded (72/2)
        backgroundColor: Platform.OS === 'ios'
          ? 'transparent'
          : colors.card === '#FFFFFF'
            ? '#FFFFFF'   // light mode: pure white
            : 'rgba(22, 27, 40, 0.98)',      // dark mode: near-opaque dark navy
        borderWidth: Platform.OS === 'ios' ? 1.5 : 1,
        borderColor: Platform.OS === 'ios'
          ? `rgba(255, 255, 255, ${glassOpacity * 0.3})`
          : colors.card === '#FFFFFF'
            ? 'rgba(0, 0, 0, 0.08)'
            : 'rgba(255, 255, 255, 0.08)',
        shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0,
        elevation: 0,
        paddingTop: 6,
        paddingBottom: 6,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        borderTopWidth: 1.5,
        borderTopColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.06)',
      }}
    >
      <AnimatedTabBarBackground
        selectedIndex={state.index}
        tabCount={state.routes.length}
        position={position}
        pressAnim={pressAnim}
      />
      <View style={{ flexDirection: 'row', flex: 1, zIndex: 1 }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPressIn = () => {
            Animated.spring(pressAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 250,
              friction: 15,
            }).start();
          };

          const onPressOut = () => {
            Animated.spring(pressAnim, {
              toValue: 0,
              useNativeDriver: true,
              tension: 200,
              friction: 15,
            }).start();
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const activeOpacity = position.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });

          const inactiveOpacity = position.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [1, 0, 1],
            extrapolate: 'clamp',
          });

          const iconScale = position.interpolate({
            inputRange: [
              index - 1,
              index - 0.75,
              index - 0.25,
              index,
              index + 0.25,
              index + 0.75,
              index + 1
            ],
            outputRange: [1, 1.15, 0.75, 1, 0.75, 1.15, 1],
            extrapolate: 'clamp',
          });

          return (
            <Pressable
              key={route.key}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={onPress}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Animated.View style={{
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: iconScale }]
              }}>
                <Animated.View style={{ position: 'absolute', opacity: inactiveOpacity }}>
                  {options.tabBarIcon && options.tabBarIcon({ focused: false, color: colors.textMain })}
                </Animated.View>
                <Animated.View style={{ position: 'absolute', opacity: activeOpacity }}>
                  {options.tabBarIcon && options.tabBarIcon({ focused: true, color: '#007aff' })}
                </Animated.View>
              </Animated.View>
              <View style={{ marginTop: 2, alignItems: 'center', justifyContent: 'center' }}>
                <Animated.Text style={{
                  color: colors.textMain,
                  fontFamily: 'sansMed',
                  fontSize: 10,
                  opacity: inactiveOpacity
                }}>
                  {label}
                </Animated.Text>
                <Animated.Text style={{
                  position: 'absolute',
                  color: '#007aff',
                  fontFamily: 'sansMed',
                  fontSize: 10,
                  opacity: activeOpacity
                }}>
                  {label}
                </Animated.Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const AndroidTabs = () => {
  const pathname = usePathname();

  const getIndex = (path) => {
    if (path === '/' || path === '/index') return 0;
    const found = TAB_NAMES.findIndex(n => path.includes(n));
    return found >= 0 ? found : 0;
  };

  const [selectedIndex, setSelectedIndex] = useState(getIndex(pathname));

  useEffect(() => {
    setSelectedIndex(getIndex(pathname));
  }, [pathname]);

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      backBehavior="history"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: '#000000',
        tabBarShowLabel: true,
        tabBarShowIcon: true,
        tabBarIndicatorStyle: { display: 'none' },
        tabBarLabelStyle: {
          fontFamily: 'sansMed',
          fontSize: 10,
          marginBottom: 2,
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        listeners={{ focus: () => setSelectedIndex(0) }}
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />
          )
        }}
      />
      <MaterialTopTabs.Screen
        name="activity"
        listeners={{ focus: () => setSelectedIndex(1) }}
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pulse" : "pulse-outline"} size={20} color={color} />
          )
        }}
      />
      <MaterialTopTabs.Screen
        name="create"
        listeners={{ focus: () => setSelectedIndex(2) }}
        options={{
          title: "Create",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={20} color={color} />
          )
        }}
      />
      <MaterialTopTabs.Screen
        name="social"
        listeners={{ focus: () => setSelectedIndex(3) }}
        options={{
          title: "Social",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={20} color={color} />
          )
        }}
      />
      <MaterialTopTabs.Screen
        name="fields"
        listeners={{ focus: () => setSelectedIndex(4) }}
        options={{
          title: "Fields",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={20} color={color} />
          )
        }}
      />
    </MaterialTopTabs>
  )
}

const IosTabs = () => {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity">
        <NativeTabs.Trigger.Label>Activity</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="waveform.path.ecg" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="create">
        <NativeTabs.Trigger.Label>Create</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus.circle.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="social">
        <NativeTabs.Trigger.Label>Social</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="fields">
        <NativeTabs.Trigger.Label>Fields</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="square.grid.3x3.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

const TabRoot = () => {
  if (Platform.OS === 'ios') {
    return <IosTabs />;
  }
  return <AndroidTabs />;
}

export default TabRoot