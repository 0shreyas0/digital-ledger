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
import ErrorBanner from "@/components/ErrorBanner";
import OTPInput from "@/components/OTPInput";
import WidePressable from "@/components/pressables/WidePressable";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  // const [emailAddress, setEmailAddress] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;
    try {
      const signInAttempt = await signIn.create({
        // identifier: emailAddress,
        identifier,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else if (signInAttempt.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        // This triggers the UI change
        setPendingVerification(true);
      }
    } catch (err) {
      setError(getSignInErrorMessage(err));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    try {
      const attempt = await signIn.attemptSecondFactor({
        strategy: "email_code", // Changed from reset_password_email_code
        code,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      setError(geErrorMessage(err));
    }
  };

  // --- UI CONDITIONAL ---
  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center items-center gap-4 bg-background mx-4">
        <WidePressable name={"arrow-back"} text={"Back"} onPress={() => router.back()} />
        <Text className="text-2xl font-sansBold">Confirm this sign-in</Text>
        <Text className="font-sansReg">Please enter the code sent to your email.</Text>
        <OTPInput code={code} setCode={setCode} />
        {/* <TouchableOpacity 
          className="bg-primary w-full items-center py-4 rounded-full"
          onPress={onVerifyPress}
        >
          <Text className="text-white font-sansBold">Verify Code</Text>
        </TouchableOpacity> */}
        <WidePressable name={"checkmark"} text={"Verify Code"} onPress={onVerifyPress} />
      </View>
    );
  }

  // Standard Sign-in UI
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
          Welcome Back
        </Text>
        <ErrorBanner error={error} setError={setError} />
        <TextInput
          className="w-full font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400"
          style={{ includeFontPadding: false }}
          autoCapitalize="none"
          value={identifier} // changed from email to indentifer
          placeholder="Enter username or email"
          onChangeText={(value) => setIdentifier(value)}
        />
        <TextInput
          className="w-full font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400"
          style={{ paddingEnd: false, includeFontPadding: false }}
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
      </View>
    </KeyboardAwareScrollView>
  );
}
