import { View, Platform, StyleSheet, Animated, Pressable, Easing } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { usePathname, withLayoutContext } from 'expo-router'
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { createMaterialTopTabNavigator } from "expo-router/js-top-tabs";

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
  const [tabBarWidth, setTabBarWidth] = useState(0);

  // Active area is the width minus the 16px padding on each side (32 total)
  const activeAreaWidth = tabBarWidth ? tabBarWidth - 32 : 0;
  const activeTabWidth = activeAreaWidth / tabCount;

  const EXTRA_WIDTH = 26;
  const PILL_WIDTH = activeTabWidth + EXTRA_WIDTH;
  const PILL_HEIGHT = 62;
  
  // Centered offset: 16px padding - (20 / 2) = 16 - 10 = 6px
  const PILL_OFFSET_X = 16 - (EXTRA_WIDTH / 2); 

  // Dynamically generate the interpolation arrays based on tabCount
  const positionInput = [];
  const translateXOutput = [];
  const scaleXOutput = [];

  for (let i = 0; i < tabCount; i++) {
    // Resting points (Exactly on a tab)
    positionInput.push(i);
    translateXOutput.push(PILL_OFFSET_X + i * activeTabWidth);
    scaleXOutput.push(1); // Normal width at rest

    if (i < tabCount - 1) {
      // Quarter-ramp up: pill starts widening early
      positionInput.push(i + 0.25);
      translateXOutput.push(PILL_OFFSET_X + (i + 0.25) * activeTabWidth);
      scaleXOutput.push(1.25);

      // Peak stretch at the halfway point between tabs
      positionInput.push(i + 0.5);
      translateXOutput.push(PILL_OFFSET_X + (i + 0.5) * activeTabWidth);
      scaleXOutput.push(1.5); // Stretch 50% wider at peak drag

      // Quarter-ramp down: pill narrows as it lands
      positionInput.push(i + 0.75);
      translateXOutput.push(PILL_OFFSET_X + (i + 0.75) * activeTabWidth);
      scaleXOutput.push(1.25);
    }
  }

  // Create the exact values linked to the user's swipe gesture
  const translateX = position && positionInput.length ? position.interpolate({
    inputRange: positionInput,
    outputRange: translateXOutput,
    extrapolate: 'clamp',
  }) : 0;

  const scaleX = position && positionInput.length ? position.interpolate({
    inputRange: positionInput,
    outputRange: scaleXOutput,
    extrapolate: 'clamp',
  }) : 1;

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
      <BlurView
        tint='default'
        intensity={20}
        experimentalBlurMethod="dimezisBlurView"
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: 36, 
          overflow: 'hidden',
        }}
      />
      
      {tabBarWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: '50%',
            marginTop: -(PILL_HEIGHT / 2),
            left: 0, 
            width: PILL_WIDTH,
            height: PILL_HEIGHT,
            borderRadius: PILL_HEIGHT / 2,
            overflow: 'hidden', 
            shadowColor: '#007aff',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.10,
            shadowRadius: 8,
            borderWidth: 1,
            borderColor: Platform.OS === 'ios'
              ? 'rgba(255,255,255,0.6)'
              : 'rgba(255,255,255,0.8)',
            // scaleX = swipe stretch on drag; pillPressScale = responsive hold/tap scale
            transform: [{ translateX }, { scaleX }, { scale: pillPressScale }],
          }}
        >
          <BlurView
            tint= 'systemUltraThinMaterialDark'
            intensity={30}
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFillObject}
          />
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: Platform.OS === 'ios'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.25)',
              }
            ]}
          />
        </Animated.View>
      )}
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation, position }) => {
  // Drives the pill scale-up/scale-down animation
  const pressAnim = useRef(new Animated.Value(0)).current;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        height: 72, // FIXED: 60px pill + 6px top pad + 6px bottom pad = 72
        borderRadius: 36, // FIXED: Keep it perfectly rounded (72/2)
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.4)',
        borderWidth: 1.5,
        borderColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.06)',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
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
                  {options.tabBarIcon && options.tabBarIcon({ focused: false, color: '#000000' })}
                </Animated.View>
                <Animated.View style={{ position: 'absolute', opacity: activeOpacity }}>
                  {options.tabBarIcon && options.tabBarIcon({ focused: true, color: '#007aff' })}
                </Animated.View>
              </Animated.View>
              <View style={{ marginTop: 2, alignItems: 'center', justifyContent: 'center' }}>
                <Animated.Text style={{
                  color: '#000000',
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