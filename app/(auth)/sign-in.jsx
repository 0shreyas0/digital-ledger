import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getSignInErrorMessage } from "@/lib/clerkErrorMessage";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  const [error, setError] = useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // arnd redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else if (signInAttempt.status === "needs_second_factor") {
        setPendingVerification(true);
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(getSignInErrorMessage(err));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(getSignInErrorMessage(err));
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center items-center gap-4 bg-background mx-4">
        <Image
          source={require("@/assets/images/revenue-i1.png")}
          style={{ height: 310, width: 300 }}
          contentFit="contain"
        />
        <Text className="text-primary text-3xl font-sansBold">
          {pendingVerification ? "Verify Login" : "Welcome Back"}
        </Text>
        {error ? (
          <View className="border-l-4 border-l-red-500 bg-red-200 flex-row items-center px-3 py-4 rounded-2xl">
            <Ionicons name="alert-circle" size={20} color={"#ef4444"} />
            <Text
              className="flex-1 font-sansReg text-red-800 pl-3"
              style={{ includeFontPadding: false }}
            >
              {error}
            </Text>
            <Pressable onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={"#ef4444"} />
            </Pressable>
          </View>
        ) : null}

        {pendingVerification ? (
          <>
            <TextInput
              className="w-full font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400"
              style={{ includeFontPadding: false }}
              value={code}
              placeholder="Enter verification code"
              onChangeText={(code) => setCode(code)}
            />
            <TouchableOpacity
              className="bg-primary w-full items-center py-4 rounded-full"
              style={{ includeFontPadding: false }}
              onPress={onVerifyPress}
            >
              <Text className="font-sansBold text-2xl text-white">Verify</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              className="w-full font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400"
              style={{ includeFontPadding: false }}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
            />
            <TextInput
              className="w-full font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400"
              style={{ includeFontPadding: false }}
              value={password}
              placeholder="Enter password"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
            <TouchableOpacity
              className="bg-primary w-full items-center py-4 rounded-full"
              style={{ includeFontPadding: false }}
              onPress={onSignInPress}
            >
              <Text className="font-sansBold text-2xl text-white">Sign In</Text>
            </TouchableOpacity>
            <View className="gap-3 flex-row items-center">
              <Text className="font-sansReg">Dont&apos;t have an account?</Text>
              <TouchableOpacity
                onPress={() => {
                  router.push("/sign-up");
                }}
                className="px-2 py-1" // padding so text has touch area
                activeOpacity={0.6} // optional for feedback
              >
                <Text className="font-sansReg text-blue-700 underline">
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}
