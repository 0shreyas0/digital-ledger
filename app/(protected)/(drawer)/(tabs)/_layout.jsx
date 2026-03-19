import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="compose"
        options={{
          title: "",
          tabBarButton: () => (
            <Pressable
              onPress={() => router.push("/create")}
              style={{
                top: -12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: "#2563eb",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.18,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Ionicons name="add" size={30} color="#fff" />
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";

// export default function TabsLayout() {
//   return (
//     <Tabs screenOptions={{ headerShown: false }}>
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="home" size={size} color={color} />
//           ),
//         }}
//       />
//       {/* <Tabs.Screen
//         name="transactions"
//         options={{
//           title: "Transactions",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="list" size={size} color={color} />
//           ),
//         }}
//       /> */}
//       <Tabs.Screen
//         name="create"
//         options={{
//           title: "Transactions",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="list" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="settings"
//         options={{
//           title: "Transactions",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="setting" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="person" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
