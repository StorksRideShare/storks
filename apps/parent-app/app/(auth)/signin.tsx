import { useSignIn } from "@clerk/expo/legacy";
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
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Syne_400Regular,
    Syne_600SemiBold,
    Syne_700Bold,
  });

  // Form States
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [secondFactorCode, setSecondFactorCode] = React.useState("");

  // Loading & Error States
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Navigation States
  const [pendingSecondFactor, setPendingSecondFactor] = React.useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log("Session task required:", session.currentTask);
              return;
            }
            router.replace("/");
          },
        });
      } else if (result.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setPendingSecondFactor(true);
      } else {
        console.error("Sign in status:", result.status, JSON.stringify(result, null, 2));
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
  };

  const onVerifySecondFactor = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: secondFactorCode,
      });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log("Session task required:", session.currentTask);
              return;
            }
            router.replace("/");
          },
        });
      } else {
        console.error("Second factor status:", result.status, JSON.stringify(result, null, 2));
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const message =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        "Invalid code. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  // ------------------------------------------------------------------
  // UI: SECOND FACTOR — EMAIL VERIFICATION
  // ------------------------------------------------------------------
  if (pendingSecondFactor) {
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

          <View style={styles.verificationContainer}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.description}>
              We sent a verification code to{"\n"}{emailAddress}
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              value={secondFactorCode}
              placeholder="Enter verification code"
              placeholderTextColor="#7A726E"
              onChangeText={(val) => {
                setSecondFactorCode(val);
                setError(null);
              }}
              keyboardType="numeric"
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!secondFactorCode || isLoading) && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={onVerifySecondFactor}
              disabled={!secondFactorCode || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------------
  // UI: MAIN SIGN IN
  // ------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              <Text style={styles.logoHighlight}>S</Text>torks
            </Text>
          </View>

          {/* Main Form Content */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>

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
                styles.primaryButton,
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
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Footer Link */}
            <Link href="/signup" asChild>
              <TouchableOpacity
                style={styles.footerContainer}
                activeOpacity={0.6}
              >
                <Text style={styles.footerText}>Don't have an account?</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
  },
  logoContainer: {
    paddingTop: Platform.OS === "android" ? 50 : 20,
    paddingLeft: 24,
  },
  logoText: {
    fontFamily: "Syne_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  logoHighlight: {
    fontFamily: "Syne_700Bold",
    color: "#E66B00",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  verificationContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: "Syne_400Regular",
    fontSize: 18,
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
    height: 60,
    borderWidth: 1,
    borderColor: "#E66B00",
    borderRadius: 30,
    paddingHorizontal: 24,
    color: "#FFFFFF",
    fontFamily: "Syne_400Regular",
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  primaryButton: {
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontFamily: "Syne_700Bold",
    color: "#000000",
    fontSize: 16,
  },
  footerContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Syne_600SemiBold",
    color: "#E66B00",
    fontSize: 15,
  },
});
