import { View, Platform, StyleSheet, Animated, Pressable, Text } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { usePathname, withLayoutContext } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

// Tab order must match <MaterialTopTabs.Screen> order below
const TAB_NAMES = ['index', 'activity', 'create', 'tags', 'category'];

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

const CustomTabBar = ({ state, descriptors, navigation, position }) => {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 4,
        right: 4,
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
        paddingHorizontal: 16,
        borderTopWidth: 1.5,
        borderTopColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.06)',
      }}
    >
      <AnimatedTabBarBackground
        selectedIndex={state.index}
        tabCount={state.routes.length}
      />
      <View style={{ flexDirection: 'row', flex: 1, zIndex: 1 }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

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

          // Interpolate opacities for smooth cross-fading
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

          // Text color interpolation still works since Animated.Text supports it in the style prop
          const textColor = position.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: ['#000000', '#007aff', '#000000'],
            extrapolate: 'clamp',
          });

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Animated.View style={{ position: 'absolute', opacity: inactiveOpacity }}>
                  {options.tabBarIcon && options.tabBarIcon({ focused: false, color: '#000000' })}
                </Animated.View>
                <Animated.View style={{ position: 'absolute', opacity: activeOpacity }}>
                  {options.tabBarIcon && options.tabBarIcon({ focused: true, color: '#007aff' })}
                </Animated.View>
              </View>
              <Animated.Text style={{ 
                color: textColor, 
                fontFamily: 'sansMed', 
                fontSize: 10, 
                marginTop: 2 
              }}>
                {label}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
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
        tabBarIndicatorStyle: { display: 'none' }, // Hide default material swipe line
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
        name="tags"
        listeners={{ focus: () => setSelectedIndex(3) }}
        options={{
          title: "Tags",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pricetags" : "pricetags-outline"} size={20} color={color} />
          )
        }}
      />
      <MaterialTopTabs.Screen
        name="category"
        listeners={{ focus: () => setSelectedIndex(4) }}
        options={{
          title: "Category",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={20} color={color} />
          )
        }}
      />
    </MaterialTopTabs>
  )
}

export default TabRoot