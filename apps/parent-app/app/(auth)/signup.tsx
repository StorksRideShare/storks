import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSignUp, useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContainer, AuthLogo, OAuthButtons } from "@/components/auth/AuthComponents";
import { Eye, EyeOff, ShieldCheck } from "lucide-react-native";

import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";

type SignUpStep = "form" | "verify" | "tos";

const TOS_TEXT = `Terms of Service & Privacy Policy

By creating an account with Storks, you agree to our Terms of Service and acknowledge our Privacy Policy.

Last updated: April 2025

1. Acceptance of Terms
By accessing or using the Storks platform, you agree to be bound by these Terms of Service.

2. Use of Service
You agree to use Storks only for lawful purposes and in accordance with these Terms.

3. Privacy Policy
We collect and process personal data as described in our Privacy Policy. Your data is used to provide and improve our services.

4. Children's Safety
Storks is committed to the safety of children. All drivers are background-checked and verified.

For questions, please contact us at legal@storks.app`;

export default function SignUpPage() {
  const { signUp, setActive, errors, fetchStatus } = useSignUp() as any;
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Component states
  const [step, setStep] = useState<SignUpStep>("form");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Local validation error state
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isSignedIn) router.replace("/(tabs)");
  }, [isSignedIn]);

  if (isSignedIn) return null;

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/\d/.test(pwd)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain at least one special character.";
    return null;
  };

  const onSignUpPress = async () => {
    setLocalError("");
    
    // Local Password Validation
    const pwdError = validatePassword(password);
    if (pwdError) {
      setLocalError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      console.error("[SignUp Error]", JSON.stringify(error, null, 2));
      return;
    }

    // Prepare email verification natively via the expo structure
    await signUp.verifications.sendEmailCode();
    setStep("verify");
  };

  const onVerifyPress = async () => {
    if (code.length < 6) return;
    setLocalError("");

    await signUp.verifications.verifyEmailCode({
      code,
    });

    if (signUp.status === "complete") {
      setStep("tos");
    } else {
      console.error("[Verify Error] Sign-up attempt not complete:", signUp);
    }
  };

  const onResendCode = async () => {
    setLocalError("");
    await signUp.verifications.sendEmailCode();
  };

  const onAcceptTOS = async () => {
    setLocalError("");
    try {
      await signUp.finalize({
        navigate: ({ session }: any) => {
          if (session) {
            router.replace("/(tabs)");
          } else {
            setLocalError("Failed to build session tasks");
          }
        }
      });
    } catch (err: any) {
      console.error("[Finalize Error]", err);
      setLocalError("Failed to finalize account creation.");
    }
  };

  const isFetching = fetchStatus === "fetching";

  // ── Step 3: Terms of Service ─────────────────────────────────────────────────
  if (step === "tos") {
    return (
      <AuthContainer>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <VStack style={[styles.card, { paddingTop: insets.top + 16 }]} space="md">
            <Box style={styles.iconRing}>
              <ShieldCheck color="#22c55e" size={32} />
            </Box>
            <Text style={styles.title}>Almost there!</Text>
            <Text style={styles.subtitle}>
              Please review and accept our Terms of Service to complete registration.
            </Text>

            {localError ? (
              <Box className="bg-red-400/10 border border-red-400/30 rounded-xl p-3 mb-2">
                <Text className="text-red-400 text-sm text-center">{localError}</Text>
              </Box>
            ) : null}

            <ScrollView
              style={styles.tosBox}
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
                if (isAtBottom) setHasScrolledToBottom(true);
              }}
              scrollEventThrottle={16}
            >
              <Text style={styles.tosText}>{TOS_TEXT}</Text>
            </ScrollView>

            {!hasScrolledToBottom && (
              <Text style={styles.scrollHint}>↓ Scroll to bottom to accept</Text>
            )}

            <Button
              className="mt-2 h-14 rounded-full bg-orange-600"
              isDisabled={!hasScrolledToBottom || isFetching}
              disabled={!hasScrolledToBottom || isFetching}
              onPress={onAcceptTOS}
            >
              {isFetching ? <ButtonSpinner color="white" /> : <ButtonText className="font-bold text-white text-base tracking-wide">I Accept & Create Account</ButtonText>}
            </Button>
          </VStack>
        </KeyboardAvoidingView>
      </AuthContainer>
    );
  }

  // ── Step 2: Verify email code ─────────────────────────────────────────────────
  // If the status goes to missing requirements, fallback to our verification view
  if (step === "verify" || (signUp?.status === "missing_requirements" && signUp?.unverifiedFields?.includes("email_address"))) {
    return (
      <AuthContainer>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthLogo />
          <VStack style={styles.card} space="xl">
            <VStack space="sm">
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to {emailAddress}.{"\n"}Enter it below to verify your account.
              </Text>
            </VStack>

            <FormControl isInvalid={!!errors?.fields?.code}>
              <Input variant="rounded" className="h-14 bg-transparent border-[1.5px] border-orange-600 px-2">
                <InputField
                  value={code}
                  onChangeText={setCode}
                  placeholder="6-digit code"
                  placeholderTextColor="#6b6b6b"
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                  className="text-white text-lg font-bold"
                  autoFocus
                />
              </Input>
              {errors?.fields?.code && (
                <FormControlError>
                  <FormControlErrorText className="text-red-400 mt-1">{errors.fields.code.message}</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <VStack space="md" className="mt-2">
              <Button
                className="h-14 rounded-full bg-orange-600"
                isDisabled={code.length < 6 || isFetching}
                disabled={code.length < 6 || isFetching}
                onPress={onVerifyPress}
              >
                {isFetching ? <ButtonSpinner color="white" /> : <ButtonText className="font-bold text-white text-base tracking-wide">Verify Email</ButtonText>}
              </Button>

              <Button
                variant="link"
                disabled={isFetching}
                isDisabled={isFetching}
                onPress={onResendCode}
              >
                <ButtonText className="text-orange-600 font-semibold">Resend code</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ScrollView>
      </AuthContainer>
    );
  }

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = emailAddress.length > 0 && password.length >= 8 && confirmPassword === password && !isFetching;
  
  // ── Step 1: Sign up form ──────────────────────────────────────────────────────
  return (
    <AuthContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthLogo />
        <VStack style={styles.card} space="xl">
          <VStack space="sm" className="mb-2">
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Sign up to get started with Storks.</Text>
          </VStack>

          {/* Local errors */}
          {localError ? (
            <Box className="bg-red-400/10 border border-red-400/30 rounded-xl p-3 mb-2">
              <Text className="text-red-400 text-sm text-center">{localError}</Text>
            </Box>
          ) : null}

          {/* Global Clerk Errors */}
          {errors?.globalError && (
            <Box className="bg-red-400/10 border border-red-400/30 rounded-xl p-3 mb-2">
              <Text className="text-red-400 text-sm text-center">{errors.globalError.message}</Text>
            </Box>
          )}

          {/* Email field */}
          <FormControl isInvalid={!!errors?.fields?.emailAddress}>
            <FormControlLabel className="mb-1.5"><FormControlLabelText className="text-neutral-300 font-semibold tracking-wide">Email address</FormControlLabelText></FormControlLabel>
            <Input variant="rounded" className="h-14 bg-transparent border-[1.5px] border-orange-600 px-4">
              <InputField
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="you@example.com"
                placeholderTextColor="#6b6b6b"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-white text-[15px]"
              />
            </Input>
            {errors?.fields?.emailAddress && (
              <FormControlError>
                <FormControlErrorText className="text-red-400 mt-1">{errors.fields.emailAddress.message}</FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Password field */}
          <FormControl isInvalid={passwordMismatch || !!errors?.fields?.password}>
            <FormControlLabel className="mb-1.5"><FormControlLabelText className="text-neutral-300 font-semibold tracking-wide">Password</FormControlLabelText></FormControlLabel>
            <Input variant="rounded" className="h-14 bg-transparent border-[1.5px] border-orange-600 px-4">
              <InputField
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 chars, 1 number, 1 symbol"
                placeholderTextColor="#6b6b6b"
                secureTextEntry={!passwordVisible}
                className="text-white text-[15px]"
              />
              <InputSlot className="pr-1" onPress={() => setPasswordVisible(!passwordVisible)}>
                {passwordVisible ? <EyeOff size={20} color="#ea580c" /> : <Eye size={20} color="#ea580c" />}
              </InputSlot>
            </Input>
            {errors?.fields?.password && (
              <FormControlError>
                <FormControlErrorText className="text-red-400 mt-1">{errors.fields.password.message}</FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Confirm Password field */}
          <FormControl isInvalid={passwordMismatch || !!errors?.fields?.password}>
            <FormControlLabel className="mb-1.5"><FormControlLabelText className="text-neutral-300 font-semibold tracking-wide">Confirm password</FormControlLabelText></FormControlLabel>
            <Input variant="rounded" className={`h-14 bg-transparent border-[1.5px] px-4 ${(passwordMismatch || errors?.fields?.password) ? "border-red-400" : "border-orange-600"}`}>
              <InputField
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor="#6b6b6b"
                secureTextEntry={!confirmPasswordVisible}
                className="text-white text-[15px]"
              />
              <InputSlot className="pr-1" onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                {confirmPasswordVisible ? <EyeOff size={20} color={(passwordMismatch || errors?.fields?.password) ? "#f87171" : "#ea580c"} /> : <Eye size={20} color={(passwordMismatch || errors?.fields?.password) ? "#f87171" : "#ea580c"} />}
              </InputSlot>
            </Input>
            {(passwordMismatch) && (
              <FormControlError>
                <FormControlErrorText className="text-red-400 mt-1">Passwords do not match</FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          <Button
            className="mt-4 h-14 rounded-full bg-orange-600"
            isDisabled={!canSubmit}
            disabled={!canSubmit}
            onPress={onSignUpPress}
          >
             {isFetching ? <ButtonSpinner color="white" /> : <ButtonText className="font-bold text-white text-base tracking-wide">Create Account</ButtonText>}
          </Button>

          <OAuthButtons />

          <HStack className="justify-center mt-3 items-center space-x-1">
            <Text className="text-neutral-400 text-sm">Already have an account? </Text>
            <Button variant="link" onPress={() => router.push("/(auth)/signin")} className="p-0 m-0 h-auto">
              <ButtonText className="text-orange-600 font-semibold text-sm m-0 p-0">Sign in</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  card: {
    width: "100%",
  },
  iconRing: {
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(34,197,94,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    color: "#a3a3a3",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  tosBox: {
    maxHeight: 280,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  tosText: {
    color: "#a3a3a3",
    fontSize: 13,
    lineHeight: 20,
  },
  scrollHint: {
    color: "#737373",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
});
