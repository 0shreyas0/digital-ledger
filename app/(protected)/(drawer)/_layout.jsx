// import { View, Text } from 'react-native'
// import React from 'react'
// import { Drawer } from 'expo-router/drawer';


// const DrawerRoot = () => {
//   return (
//     // <GestureHandlerRootView>

//     // </GestureHandlerRootView>
//     <Drawer>
//       <Drawer.Screen name="index"/>
//       <Drawer.Screen name="settings"/>
//     </Drawer>
//   )
// }

// export default DrawerRoot

import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        overlayColor: "transparent",
        swipeEdgeWidth: 60,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{ drawerLabel: "Home", title: "Home" }}
      />
      <Drawer.Screen name="settings" options={{ title: "Settings" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="contact" options={{ title: "Contact" }} />
    </Drawer>
  );
}
