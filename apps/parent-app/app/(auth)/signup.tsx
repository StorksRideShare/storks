import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Box } from "@/components/ui/box";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  AuthContainer, 
  AuthLogo, 
  AuthTitle, 
  AuthDescription, 
  AuthInput, 
  AuthButton, 
  AuthError 
} from "@/components/auth/AuthComponents";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });
      if (signUpAttempt.status === "complete") {
        setSessionId(signUpAttempt.createdSessionId);
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

  const onAcceptTOS = async () => {
    if (!isLoaded || !sessionId) return;
    setIsLoading(true);
    setError(null);

    try {
      await setActive({ session: sessionId });
      router.replace("/");
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <AuthLogo />

        {showTOS ? (
          <View style={styles.tosContainer}>
            <Text style={styles.tosHeader}>We've confirmed that you're real! Let's take the next step</Text>
            <Text style={styles.tosDescription}>Storks thrives to be a platform where trust, credibility and safety becomes synonyms.</Text>
            <AuthError message={error} />
            <View style={styles.tosBox}>
              <ScrollView onScroll={(e) => {
                const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
                if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) setHasScrolledToBottom(true);
              }} scrollEventThrottle={16}>
                <Text style={styles.tosText}>
                  Lorem ipsum dolor sit amet consectetur adipiscing elit... (Terms and Conditions content)
                </Text>
              </ScrollView>
            </View>
            <AuthButton 
              title={hasScrolledToBottom ? "Accept" : "Scroll to bottom to accept"} 
              onPress={onAcceptTOS} 
              isLoading={isLoading} 
              disabled={!hasScrolledToBottom} 
              variant="tos" 
            />
          </View>
        ) : pendingVerification ? (
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 32 }}>
            <AuthTitle>Verify your email</AuthTitle>
            <AuthDescription>A verification code has been sent to your email.</AuthDescription>
            <AuthError message={error} />
            <AuthInput value={code} placeholder="Enter verification code" onChangeText={setCode} keyboardType="numeric" />
            <AuthButton title="Verify" onPress={onVerifyPress} isLoading={isLoading} disabled={!code} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 80 }}>
              <AuthTitle>Lets Get Started</AuthTitle>
              <AuthError message={error} />
              <AuthInput placeholder="Email" value={emailAddress} onChangeText={setEmailAddress} keyboardType="email-address" />
              <AuthInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
              <AuthButton title="Continue" onPress={onSignUpPress} isLoading={isLoading} disabled={!emailAddress || !password} />
              <Link href="/signin" asChild>
                <AuthButton title="Already have an account?" onPress={() => {}} variant="secondary" />
              </Link>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  tosContainer: { flex: 1, paddingHorizontal: 32, paddingTop: 60, paddingBottom: 40 },
  tosHeader: { fontFamily: "Syne_600SemiBold", color: "#E66B00", fontSize: 20, textAlign: "center", lineHeight: 28, marginBottom: 30 },
  tosDescription: { fontFamily: "Syne_400Regular", color: "#FFFFFF", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 20 },
  tosBox: { flex: 1, borderWidth: 1, borderColor: "#E66B00", borderRadius: 24, padding: 20, marginBottom: 30 },
  tosText: { fontFamily: "Syne_400Regular", color: "#FFFFFF", fontSize: 15, lineHeight: 24 },
});
