import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import colors from 'tailwindcss/colors';


const TabRoot = () => {
  return (
    <Tabs screenOptions={{ headerShown: false, backgroundColor: colors.green[500] }} backBehavior='history'>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => { return (<FontAwesome name="home" size={25} color={colors.blue[500]} />) } }} />
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => { return (<MaterialIcons name="dashboard" size={25} color={colors.blue[500]} />) } }} />
      <Tabs.Screen name="create" options={{ title: "Create", tabBarIcon: ({ color, size }) => { return (<FontAwesome name="plus-circle" size={25} color={colors.blue[500]} />) } }} />
      <Tabs.Screen name="activity" options={{ title: "Activity", tabBarIcon: ({ color, size }) => { return (<FontAwesome name="user" size={25} color={colors.blue[500]} />) } }} />
      <Tabs.Screen name="category" options={{ title: "Category", tabBarIcon: ({ color, size }) => { return (<FontAwesome name="list" size={25} color={colors.blue[500]} />) } }} />
    </Tabs>
  )
}

export default TabRoot
// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { Pressable, View } from "react-native";

// export default function TabsLayout() {
//   const tabs = [
//     {
//       name: "index",
//       title: "Home",
//       icon: "home",
//     },
//     {
//       name: "activity",
//       title: "Activity",
//       icon: "pulse",
//     },
//     {
//       name: "dashboard",
//       title: "Dashboard",
//       icon: "grid",
//     },
//     // You can add more tabs here and the create button will stay centered
//   ];

//   const CreateButton = (props) => (
//     <Pressable
//       onPress={props.onPress}
//       style={{
//         top: -32` `,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <View
//         style={{
//           width: 62,
//           height: 62,
//           borderRadius: 31,
//           backgroundColor: "#3b82f6", // More vibrant blue
//           justifyContent: "center",
//           alignItems: "center",
//           shadowColor: "#000",
//           shadowOffset: { width: 0, height: 4 },
//           shadowOpacity: 0.3,
//           shadowRadius: 5,
//           elevation: 8,
//           borderWidth: 4,
//           borderColor: "#fff", // White border for that premium "pop" effect
//         }}
//       >
//         <Ionicons name="add" size={32} color="#fff" />
//       </View>
//     </Pressable>
//   );

//   const centerIndex = Math.floor(tabs.length / 2);

//   return (
//     <Tabs
//       initialRouteName="index"
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: "#2563eb",
//         tabBarInactiveTintColor: "#6b7280",
//         tabBarStyle: {
//           height: 65,
//           paddingBottom: 10,
//           paddingTop: 5,
//           borderTopWidth: 1,
//           borderTopColor: "#e5e7eb",
//           backgroundColor: "#ffffff",
//         },
//       }}
//     >
//       {/* First half of the tabs */}
//       {tabs.slice(0, centerIndex).map((tab) => (
//         <Tabs.Screen
//           key={tab.name}
//           name={tab.name}
//           options={{
//             title: tab.title,
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name={tab.icon} size={size} color={color} />
//             ),
//           }}
//         />
//       ))}

//       {/* The Central Create Button */}
//       <Tabs.Screen
//         name="create"
//         options={{
//           title: "",
//           tabBarButton: (props) => <CreateButton {...props} />,
//         }}
//       />

//       {/* Second half of the tabs */}
//       {tabs.slice(centerIndex).map((tab) => (
//         <Tabs.Screen
//           key={tab.name}
//           name={tab.name}
//           options={{
//             title: tab.title,
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name={tab.icon} size={size} color={color} />
//             ),
//           }}
//         />
//       ))}
//     </Tabs>
//   );
// }
