import { View, Pressable, Platform, StyleSheet, Animated, useWindowDimensions } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { Tabs, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Tab order must match <Tabs.Screen> order below
const TAB_NAMES = ['index', 'activity', 'create', 'tags', 'category'];

const AnimatedTabBarBackground = ({ selectedIndex, tabCount }) => {
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const pillAnim = useRef(new Animated.Value(0)).current;

  const tabWidth = tabBarWidth ? tabBarWidth / tabCount : 0;
  const PILL_WIDTH = tabWidth ? tabWidth-12 : 0;
  const PILL_HEIGHT = 48;
  const PILL_INSET = 6; // horizontal offset within the tab slot

  useEffect(() => {
    if (tabBarWidth > 0) {
      Animated.spring(pillAnim, {
        toValue: selectedIndex * tabWidth,
        useNativeDriver: true,
        tension: 68,
        friction: 11,
      }).start();
    }
  }, [selectedIndex, tabWidth, tabBarWidth]);

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTabBarWidth(width);
  };

  return (
    <View style={StyleSheet.absoluteFillObject} onLayout={handleLayout}>
      <BlurView
        tint={Platform.OS === 'ios' ? 'default' : 'light'}
        intensity={20}
        experimentalBlurMethod="dimezisBlurView"
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: 36,
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
            left: PILL_INSET,
            width: PILL_WIDTH,
            height: PILL_HEIGHT,
            borderRadius: PILL_HEIGHT / 2,
            backgroundColor: Platform.OS === 'ios'
              ? 'rgba(255,255,255,0.55)'
              : 'rgba(255,255,255,0.70)',
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
        />
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
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: '#000000',
        tabBarActiveBackgroundColor: 'transparent',
        tabBarActiveIndicatorStyle: {
          backgroundColor: 'transparent',
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'sansMed',
          fontSize: 11,
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 72,
          borderRadius: 36,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.4)',
          borderWidth: 1.5,
          borderColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.06)',
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 0,
          paddingTop: 8,
          paddingBottom: 8,
          marginHorizontal: 16,
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
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="activity"
        listeners={{ focus: () => setSelectedIndex(1) }}
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pulse" : "pulse-outline"} size={22} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="create"
        listeners={{ focus: () => setSelectedIndex(2) }}
        options={{
          title: "Create",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={22} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="tags"
        listeners={{ focus: () => setSelectedIndex(3) }}
        options={{
          title: "Tags",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pricetags" : "pricetags-outline"} size={22} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="category"
        listeners={{ focus: () => setSelectedIndex(4) }}
        options={{
          title: "Category",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
          )
        }}
      />
    </Tabs>
  )
}

export default TabRoot