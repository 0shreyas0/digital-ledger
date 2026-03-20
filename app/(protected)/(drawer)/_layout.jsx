import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      initialRouteName="(tabs)"
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
