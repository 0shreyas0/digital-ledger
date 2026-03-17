import { useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
// import * as Linking from "expo-linking";
import { Alert, TouchableOpacity } from "react-native";
import CirclePressable from "./pressables/CirclePressable";

// export const SignOutButton = ({className}) => {
export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    // try {
    //   await signOut();
    //   // Redirect to your desired page
    //   Linking.openURL(Linking.createURL("/"));
    // } catch (err) {
    //   // See https://clerk.com/docs/custom-flows/error-handling
    //   // for more info on error handling
    //   console.error(JSON.stringify(err, null, 2));
    // }
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  };
  return (
    <>
      {/* <TouchableOpacity
        className="h-25 w-25 p-3 rounded-full active:bg-accent"
        onPress={handleSignOut}
      >
        <Ionicons name="log-out-outline" size={25} />
      </TouchableOpacity> */}
      <CirclePressable name={"log-out-outline"} onPress={handleSignOut}/>
    </>
  );
  // <TouchableOpacity onPress={handleSignOut}>
  //   <Text className={`font-sansBold ${className}`}>Sign out</Text>
  // </TouchableOpacity>
};
