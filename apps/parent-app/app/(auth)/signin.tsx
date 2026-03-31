import { useAuth } from "@clerk/expo";
import { useSignUp } from "@clerk/expo/legacy";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Pressable } from "@/components/ui/pressable";

import { useApiClient } from "@/middleware/apiClient";
import type { UserInitPayload } from "@/utils/api";

// ─── Logo ────────────────────────────────────────────────────────
function Logo({ size = 24 }: { size?: number }) {
  return (
    <Box style={styles.logoContainer}>
      <Text style={[styles.logoText, { fontSize: size }]}>
        <Text style={[styles.logoHighlight, { fontSize: size }]}>S</Text>torks
      </Text>
    </Box>
  );
}

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken }                    = useAuth();
  const api                             = useApiClient();
  const router                          = useRouter();

  // Form
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword]         = React.useState("");
  const [code, setCode]                 = React.useState("");

  // Navigation
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [showTOS, setShowTOS]                         = React.useState(false);
  const [sessionId, setSessionId]                     = React.useState<string | null>(null);

  // UI
  const [isLoading, setIsLoading]               = React.useState(false);
  const [error, setError]                       = React.useState<string | null>(null);
  const [hasScrolledToBottom, setScrolledToBottom] = React.useState(false);

  // ── STEP 1: Create Clerk account ────────────────────────────────
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── STEP 2: Verify email → save sessionId, show TOS ─────────────
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        setSessionId(attempt.createdSessionId);
        setPendingVerification(false);
        setShowTOS(true);
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "Invalid code.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── STEP 3: Accept TOS → activate session → init DB → onboarding ─
  const onAcceptTOS = async () => {
    if (!isLoaded || !sessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Activate Clerk session
      await setActive({ session: sessionId });

      // 2. Get JWT (only available after setActive)
      const token = await getToken();
      if (!token) throw new Error("No token after activation");

      // 3. Create user record in PostgreSQL (linked to Clerk ID)
      await api.post<void>("/api/users/init", {
        email: emailAddress,
        roleType: "PARENT",
      } satisfies UserInitPayload);

      // 4. Route to onboarding — not tabs, user is not onboarded yet
      router.replace("/onboarding");
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      setScrolledToBottom(true);
    }
  };

  // ================================================================
  // STEP 3 — TERMS AND CONDITIONS
  // ================================================================
  if (showTOS) {
    return (
      <SafeAreaView style={styles.container}>
        <Logo />
        <VStack style={styles.tosContainer}>
          <Text style={styles.tosHeader}>
            We've confirmed that you're{"\n"}real! Let's take the next step
          </Text>
          <Text style={styles.tosDescription}>
            Storks thrives to be a platform where trust, credibility and safety
            becomes synonyms. And for that we need to make sure you understand
            what we provide and what we do not.
          </Text>
          <Text style={styles.tosSubDescription}>
            Please go through our terms and conditions carefully before accepting!
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Box style={styles.tosBox}>
            <ScrollView
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator
            >
              <Text style={styles.tosText}>
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
                faucibus ex sapien vitae pellentesque sem placerat. In id cursus
                mi pretium tellus duis convallis. Tempus leo eu aenean sed diam
                urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum
                egestas. Iaculis massa nisl malesuada lacinia integer nunc
                posuere. Ut hendrerit semper vel class aptent taciti sociosqu.
                Ad litora torquent per conubia nostra inceptos himenaeos.{"\n\n"}
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
                faucibus ex sapien vitae pellentesque sem placerat. In id cursus
                mi pretium tellus duis convallis. Tempus leo eu aenean sed diam
                urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum
                egestas. Iaculis massa nisl malesuada lacinia integer nunc
                posuere. Ut hendrerit semper vel class aptent taciti sociosqu.
                Ad litora torquent per conubia nostra inceptos himenaeos.{"\n\n"}
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
                faucibus ex sapien vitae pellentesque sem placerat. In id cursus
                mi pretium tellus duis convallis. Tempus leo eu aenean sed diam
                urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
              </Text>
            </ScrollView>
          </Box>

          <Button
            style={[
              styles.tosBtn,
              hasScrolledToBottom && !isLoading ? styles.tosBtnActive : styles.tosBtnInactive,
            ]}
            onPress={onAcceptTOS}
            isDisabled={!hasScrolledToBottom || isLoading}
          >
            {isLoading
              ? <ButtonSpinner color="#FFFFFF" />
              : <ButtonText style={hasScrolledToBottom ? styles.tosBtnTextActive : styles.tosBtnTextInactive}>
                  {hasScrolledToBottom ? "Accept" : "Scroll to bottom to accept"}
                </ButtonText>
            }
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  // ================================================================
  // STEP 2 — EMAIL VERIFICATION
  // ================================================================
  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Logo />
          <VStack style={styles.verificationContainer}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.description}>
              A verification code has been sent to your email.
            </Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Input style={styles.inputWrapper} variant="outline">
              <InputField
                style={styles.inputField}
                value={code}
                placeholder="Enter verification code"
                placeholderTextColor="#7A726E"
                keyboardType="numeric"
                onChangeText={(v) => { setCode(v); setError(null); }}
              />
            </Input>

            <Button
              style={[styles.primaryBtn, (!code || isLoading) && styles.btnDisabled]}
              onPress={onVerifyPress}
              isDisabled={!code || isLoading}
            >
              {isLoading ? <ButtonSpinner color="#000" /> : <ButtonText style={styles.primaryBtnText}>Verify</ButtonText>}
            </Button>
          </VStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ================================================================
  // STEP 1 — SIGN UP FORM
  // ================================================================
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Logo size={24} />
          <VStack style={styles.formContainer}>
            <Text style={styles.title}>Lets Get Started</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Input style={styles.inputWrapper} variant="outline">
              <InputField
                style={styles.inputField}
                placeholder="Email"
                placeholderTextColor="#7A726E"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={emailAddress}
                onChangeText={(v) => { setEmailAddress(v); setError(null); }}
              />
            </Input>

            <Input style={styles.inputWrapper} variant="outline">
              <InputField
                style={styles.inputField}
                placeholder="Password"
                placeholderTextColor="#7A726E"
                secureTextEntry
                value={password}
                onChangeText={(v) => { setPassword(v); setError(null); }}
              />
            </Input>

            <Button
              style={[styles.primaryBtn, (!emailAddress || !password || isLoading) && styles.btnDisabled]}
              onPress={onSignUpPress}
              isDisabled={!emailAddress || !password || isLoading}
            >
              {isLoading ? <ButtonSpinner color="#000" /> : <ButtonText style={styles.primaryBtnText}>Continue</ButtonText>}
            </Button>

            <Link href="/signin" asChild>
              <Pressable style={styles.footerContainer}>
                <Text style={styles.footerText}>Already have an account?</Text>
              </Pressable>
            </Link>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: "#171412" },
  logoContainer:       { paddingTop: Platform.OS === "android" ? 50 : 20, paddingLeft: 24 },
  logoText:            { fontFamily: "Syne_700Bold", color: "#FFFFFF", letterSpacing: 0.5 },
  logoHighlight:       { fontFamily: "Syne_700Bold", color: "#E66B00" },
  formContainer:       { flex: 1, paddingHorizontal: 32, paddingTop: 80, paddingBottom: 40 },
  verificationContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 32 },
  title:               { fontFamily: "Syne_400Regular", fontSize: 18, color: "#FFFFFF", textAlign: "center", marginBottom: 48 },
  description:         { fontFamily: "Syne_400Regular", fontSize: 14, color: "#7A726E", textAlign: "center", marginBottom: 32, lineHeight: 20 },
  errorText:           { fontFamily: "Syne_400Regular", color: "#FF6B6B", fontSize: 13, textAlign: "center", marginBottom: 16 },
  inputWrapper:        { height: 60, borderColor: "#E66B00", borderRadius: 30, marginBottom: 20, backgroundColor: "transparent" },
  inputField:          { fontFamily: "Syne_400Regular", fontSize: 16, color: "#FFFFFF", paddingHorizontal: 24 },
  primaryBtn:          { height: 60, backgroundColor: "#FFFFFF", borderRadius: 30, justifyContent: "center", alignItems: "center", marginTop: 8, marginBottom: 40 },
  btnDisabled:         { opacity: 0.5 },
  primaryBtnText:      { fontFamily: "Syne_700Bold", color: "#000000", fontSize: 16 },
  footerContainer:     { marginTop: 32, alignItems: "center" },
  footerText:          { fontFamily: "Syne_600SemiBold", color: "#E66B00", fontSize: 15 },
  // TOS
  tosContainer:        { flex: 1, paddingHorizontal: 32, paddingTop: 60, paddingBottom: 40 },
  tosHeader:           { fontFamily: "Syne_600SemiBold", color: "#E66B00", fontSize: 20, textAlign: "center", lineHeight: 28, marginBottom: 30 },
  tosDescription:      { fontFamily: "Syne_400Regular", color: "#FFFFFF", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 20 },
  tosSubDescription:   { fontFamily: "Syne_400Regular", color: "#FFFFFF", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 30 },
  tosBox:              { flex: 1, borderWidth: 1, borderColor: "#E66B00", borderRadius: 24, padding: 20, marginBottom: 30 },
  tosText:             { fontFamily: "Syne_400Regular", color: "#FFFFFF", fontSize: 15, lineHeight: 24 },
  tosBtn:              { height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center" },
  tosBtnInactive:      { backgroundColor: "#686461" },
  tosBtnActive:        { backgroundColor: "#E66B00" },
  tosBtnTextInactive:  { fontFamily: "Syne_600SemiBold", color: "#FFFFFF", fontSize: 16 },
  tosBtnTextActive:    { fontFamily: "Syne_700Bold", color: "#FFFFFF", fontSize: 16 },
});