import { useSignIn } from "@clerk/expo/legacy";
import type { EmailCodeFactor } from "@clerk/shared/types";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import {
  Syne_400Regular,
  Syne_600SemiBold,
  Syne_700Bold,
} from "@expo-google-fonts/syne";
import { useFonts } from "expo-font";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Syne_400Regular,
    Syne_600SemiBold,
    Syne_700Bold,
  });

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            router.replace("/");
          },
        });
      } else if (signInAttempt.status === "needs_second_factor") {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor =>
            factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        }
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError("Sign in failed. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const message =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, setActive, router, emailAddress, password]);

  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            router.replace("/");
          },
        });
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError("Invalid code. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const message =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, setActive, router, code]);

  if (!fontsLoaded) return null;

  // ------------------------------------------------------------------
  // UI: EMAIL VERIFICATION STEP
  // ------------------------------------------------------------------
  if (showEmailCode) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              <Text style={styles.logoHighlight}>S</Text>torks
            </Text>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.description}>
              A verification code has been sent to your email.
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              value={code}
              placeholder="Enter verification code"
              placeholderTextColor="#7A726E"
              onChangeText={(val) => {
                setCode(val);
                setError(null);
              }}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[
                styles.loginButton,
                (!code || isLoading) && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={onVerifyPress}
              disabled={!code || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.loginButtonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerContainer}
              activeOpacity={0.6}
              onPress={() => {
                setShowEmailCode(false);
                setCode("");
                setError(null);
              }}
            >
              <Text style={styles.footerText}>Go back</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------------
  // UI: MAIN SIGN IN STEP
  // ------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoHighlight}>S</Text>torks
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Welcome Back!</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#7A726E"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={emailAddress}
            onChangeText={(val) => {
              setEmailAddress(val);
              setError(null);
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#7A726E"
            secureTextEntry
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setError(null);
            }}
          />

          <TouchableOpacity
            style={[
              styles.loginButton,
              (!emailAddress || !password || isLoading) &&
                styles.buttonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={onSignInPress}
            disabled={!emailAddress || !password || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <Link href="/signup" asChild>
            <TouchableOpacity
              style={styles.footerContainer}
              activeOpacity={0.6}
            >
              <Text style={styles.footerText}>Don't have an account yet?</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171412",
  },
  keyboardView: {
    flex: 1,
  },
  logoContainer: {
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingLeft: 24,
  },
  logoText: {
    fontFamily: "Syne_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  logoHighlight: {
    fontFamily: "Syne_700Bold",
    color: "#E66B00",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: "Syne_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 48,
  },
  description: {
    fontFamily: "Syne_400Regular",
    fontSize: 14,
    color: "#7A726E",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  errorText: {
    fontFamily: "Syne_400Regular",
    color: "#FF6B6B",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#E66B00",
    borderRadius: 28,
    paddingHorizontal: 24,
    color: "#FFFFFF",
    fontFamily: "Syne_400Regular",
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  loginButton: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontFamily: "Syne_700Bold",
    color: "#000000",
    fontSize: 15,
  },
  footerContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Syne_600SemiBold",
    color: "#E66B00",
    fontSize: 14,
  },
});
