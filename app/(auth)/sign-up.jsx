import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { COLORS } from "@/constants/colors.js";
import { getSignUpErrorMessage } from "@/lib/clerkErrorMessage";
import ErrorBanner from "@/components/ErrorBanner";
import OTPInput from "@/components/OTPInput";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const { colorScheme, toggleColorScheme } = useColorScheme();

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        username,
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      setError(getSignUpErrorMessage(err));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      setError(getSignUpErrorMessage(err));
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 items-center justify-center bg-background mx-4 gap-4">
        <Text className="text-primary text-3xl font-sansBold">
          Verify your email
        </Text>
          <ErrorBanner error={error} setError={setError}/>
        {/* <TextInput
          style={{ includeFontPadding: false }}
          className="w-full font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400"
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        /> */}
        <OTPInput code={code} setCode={setCode} />
        <TouchableOpacity
          className="bg-blue-500 hover:bg-lime-400 w-full items-center py-3 rounded-full"
          onPress={onVerifyPress}
        >
          <Text className="text-slate-50 font-sansBold text-lg">Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // {/* <TouchableOpacity onPress={toggleColorScheme}>
  //   <Text>Toggle Theme</Text>
  // </TouchableOpacity> */}

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
          source={require("@/assets/images/revenue-i3.png")}
          style={{ height: 310, width: 300 }}
          contentFit="contain"
        />
        <Text className="text-primary text-3xl font-sansBold">
          Create Account
        </Text>
          <ErrorBanner error={error} setError={setError}/>
        <TextInput
          className="w-full font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400"
          style={{ includeFontPadding: false }}
          autoCapitalize="none"
          value={username}
          placeholder="Enter username"
          onChangeText={(value) => setUsername(value)}
        />
        <TextInput
          className="w-full font-sansReg bg-slate-50 px-3 py-4 rounded-2xl border border-slate-400"
          style={{ includeFontPadding: false }}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
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
          onPress={onSignUpPress}
        >
          <Text className="font-sansBold text-2xl text-white">Sign Up</Text>
        </TouchableOpacity>
        <View className="gap-3 flex-row items-center">
          <Text className="font-sansReg">Already have an account?</Text>
          <TouchableOpacity
            onPress={() => {
              router.push("/sign-in");
            }}
            className="px-2 py-1" // padding so text has touch area
            activeOpacity={0.6} // optional for feedback
          >
            <Text className="font-sansReg text-blue-700 underline">
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
