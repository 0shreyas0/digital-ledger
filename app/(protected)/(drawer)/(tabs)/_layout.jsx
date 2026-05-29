import { View, Pressable, Platform, StyleSheet, Animated, useWindowDimensions } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { Tabs, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { PanResponder } from 'react-native';

// Tab order must match <Tabs.Screen> order below
const TAB_NAMES = ['index', 'activity', 'create', 'tags', 'category'];

const SwipeWrapper = ({ children, navigation }) => {
  const state = navigation.getState();
  const currentIndex = state?.index ?? 0;
  const routes = state?.routes ?? [];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only trigger on horizontal swipes (horizontal travel > vertical travel)
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 35 && Math.abs(dy) < 15;
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { vx, dx } = gestureState;
        if (dx < -80 && vx < -0.3) {
          // Swiped left -> Go next
          if (currentIndex < routes.length - 1) {
            const nextRoute = routes[currentIndex + 1].name;
            navigation.navigate(nextRoute);
          }
        } else if (dx > 80 && vx > 0.3) {
          // Swiped right -> Go previous
          if (currentIndex > 0) {
            const prevRoute = routes[currentIndex - 1].name;
            navigation.navigate(prevRoute);
          }
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

const AnimatedTabBarBackground = ({ selectedIndex, tabCount }) => {
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const pillAnim = useRef(new Animated.Value(0)).current;

  // Active area is the width of the tab bar minus the 16px padding on each side (32 total)
  const activeAreaWidth = tabBarWidth ? tabBarWidth - 32 : 0;
  const activeTabWidth = activeAreaWidth / tabCount;
  
  // Widen the pill by subtracting only 4px instead of 12px
  const PILL_WIDTH = activeTabWidth + 6;
  const PILL_HEIGHT = 48;
  const PILL_OFFSET_X = 13; // Centered offset: 16px padding - ((PILL_WIDTH - activeTabWidth) / 2) = 13px

  useEffect(() => {
    if (tabBarWidth > 0) {
      Animated.spring(pillAnim, {
        toValue: PILL_OFFSET_X + selectedIndex * activeTabWidth,
        useNativeDriver: true,
        tension: 68,
        friction: 11,
      }).start();
    }
  }, [selectedIndex, activeTabWidth, tabBarWidth]);

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTabBarWidth(width);
  };

  return (
    <View style={StyleSheet.absoluteFillObject} onLayout={handleLayout}>
      <BlurView
        tint='default'
        intensity={20}
        experimentalBlurMethod="dimezisBlurView"
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: 34,
          overflow: 'hidden',
        }}
      />
      {/* Sliding pill */}
      {tabBarWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: '50%',
            marginTop: -(PILL_HEIGHT / 2),
            left: 0, // Position is fully handled via translateX animation offset
            width: PILL_WIDTH,
            height: PILL_HEIGHT,
            borderRadius: PILL_HEIGHT / 2,
            overflow: 'hidden', // Clips the inner BlurView to the pill's rounded shape
            shadowColor: '#007aff',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.10,
            shadowRadius: 8,
            // Border for glass edge
            borderWidth: 1,
            borderColor: Platform.OS === 'ios'
              ? 'rgba(255,255,255,0.6)'
              : 'rgba(255,255,255,0.8)',
            transform: [{ translateX: pillAnim }],
          }}
        >
          <BlurView
            tint={Platform.OS === 'ios' ? 'systemUltraThinMaterialDark' : 'default'}
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

const TabRoot = () => {
  const pathname = usePathname();

  // Derive selected index from pathname
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
    <Tabs
      backBehavior='history'
      screenOptions={{
        headerShown: false,
        screenLayout: ({ children, navigation }) => (
          <SwipeWrapper navigation={navigation}>{children}</SwipeWrapper>
        ),
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: '#000000',
        tabBarActiveBackgroundColor: 'transparent',
        tabBarActiveIndicatorStyle: {
          backgroundColor: 'transparent',
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'sansMed',
          fontSize: 10,
          marginBottom: 2,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 68,
          borderRadius: 34,
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
          paddingHorizontal: 16, // Shift spacing inside to keep horizontal icon positions unchanged
          borderTopWidth: 1.5,
          borderTopColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.06)',
        },
        tabBarBackground: () => (
          <AnimatedTabBarBackground
            selectedIndex={selectedIndex}
            tabCount={TAB_NAMES.length}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={{ focus: () => setSelectedIndex(0) }}
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="activity"
        listeners={{ focus: () => setSelectedIndex(1) }}
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pulse" : "pulse-outline"} size={20} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="create"
        listeners={{ focus: () => setSelectedIndex(2) }}
        options={{
          title: "Create",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={20} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="tags"
        listeners={{ focus: () => setSelectedIndex(3) }}
        options={{
          title: "Tags",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pricetags" : "pricetags-outline"} size={20} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="category"
        listeners={{ focus: () => setSelectedIndex(4) }}
        options={{
          title: "Category",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={20} color={color} />
          )
        }}
      />
    </Tabs>
  )
}

export default TabRoot