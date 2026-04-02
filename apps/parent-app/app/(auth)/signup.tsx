import { useSignUp } from "@clerk/clerk-expo";
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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Syne_400Regular,
    Syne_600SemiBold,
    Syne_700Bold,
  });

  // Form States
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  // Navigation States
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [showTOS, setShowTOS] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // TOS State
  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
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

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        setSessionId(signUpAttempt.createdSessionId);
        setPendingVerification(false);
        setShowTOS(true);
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
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

  // Handle TOS acceptance and final login
  const onAcceptTOS = async () => {
    if (!isLoaded || !sessionId) return;
    setIsLoading(true);
    setError(null);

    try {
      await setActive({
        session: sessionId,
        navigate: async ({ session }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          router.replace("/");
        },
      });
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

  // Handle scroll-to-bottom detection
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      setHasScrolledToBottom(true);
    }
  };

  if (!fontsLoaded) return null;

  // ------------------------------------------------------------------
  // UI: STEP 3 - TERMS AND CONDITIONS
  // ------------------------------------------------------------------
  if (showTOS) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoHighlight}>S</Text>torks
          </Text>
        </View>

        <View style={styles.tosContainer}>
          <Text style={styles.tosHeader}>
            We've confirmed that you're{"\n"}real! Let's take the next step
          </Text>

          <Text style={styles.tosDescription}>
            Storks thrives to be a platform where trust, credibility and safety
            becomes synonyms. And for that we need to make sure you understand
            what we provide and what we do not.
          </Text>

          <Text style={styles.tosSubDescription}>
            Please go through our terms and conditions carefully before
            accepting!
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.tosBox}>
            <ScrollView
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={true}
              indicatorStyle="white"
            >
              <Text style={styles.tosText}>
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
                faucibus ex sapien vitae pellentesque sem placerat. In id cursus
                mi pretium tellus duis convallis. Tempus leo eu aenean sed diam
                urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum
                egestas. Iaculis massa nisl malesuada lacinia integer nunc
                posuere. Ut hendrerit semper vel class aptent taciti sociosqu.
                Ad litora torquent per conubia nostra inceptos himenaeos.
                {"\n\n"}
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
                faucibus ex sapien vitae pellentesque sem placerat. In id cursus
                mi pretium tellus duis convallis. Tempus leo eu aenean sed diam
                urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum
                egestas. Iaculis massa nisl malesuada lacinia integer nunc
                posuere. Ut hendrerit semper vel class aptent taciti sociosqu.
                Ad litora torquent per conubia nostra inceptos himenaeos.
                {"\n\n"}
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
                faucibus ex sapien vitae pellentesque sem placerat. In id cursus
                mi pretium tellus duis convallis. Tempus leo eu aenean sed diam
                urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum
                egestas.
              </Text>
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.tosButton,
              hasScrolledToBottom && !isLoading
                ? styles.tosButtonActive
                : styles.tosButtonInactive,
            ]}
            activeOpacity={0.8}
            onPress={onAcceptTOS}
            disabled={!hasScrolledToBottom || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.tosButtonText,
                  hasScrolledToBottom
                    ? styles.tosButtonTextActive
                    : styles.tosButtonTextInactive,
                ]}
              >
                {hasScrolledToBottom ? "Accept" : "Scroll to bottom to accept"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------------
  // UI: STEP 2 - EMAIL VERIFICATION
  // ------------------------------------------------------------------
  if (pendingVerification) {
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
                styles.primaryButton,
                (!code || isLoading) && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={onVerifyPress}
              disabled={!code || isLoading}
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
  // UI: STEP 1 - MAIN SIGN UP
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
            <Text style={styles.title}>Lets Get Started</Text>

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
              onPress={onSignUpPress}
              disabled={!emailAddress || !password || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Footer Link */}
            <Link href="/signin" asChild>
              <TouchableOpacity
                style={styles.footerContainer}
                activeOpacity={0.6}
              >
                <Text style={styles.footerText}>Already have an account?</Text>
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

  // --- TOS Styles ---
  tosContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  tosHeader: {
    fontFamily: "Syne_600SemiBold",
    color: "#E66B00",
    fontSize: 20,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 30,
  },
  tosDescription: {
    fontFamily: "Syne_400Regular",
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  tosSubDescription: {
    fontFamily: "Syne_400Regular",
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  tosBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E66B00",
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
  },
  tosText: {
    fontFamily: "Syne_400Regular",
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 24,
  },
  tosButton: {
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  tosButtonInactive: {
    backgroundColor: "#686461",
  },
  tosButtonActive: {
    backgroundColor: "#E66B00",
  },
  tosButtonText: {
    fontSize: 16,
  },
  tosButtonTextInactive: {
    fontFamily: "Syne_600SemiBold",
    color: "#FFFFFF",
  },
  tosButtonTextActive: {
    fontFamily: "Syne_700Bold",
    color: "#FFFFFF",
  },
});
