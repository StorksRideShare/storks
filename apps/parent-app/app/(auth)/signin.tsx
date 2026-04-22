import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useSignIn, useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { AuthContainer, AuthLogo, OAuthButtons } from "@/components/auth/AuthComponents";
import { Eye, EyeOff } from "lucide-react-native";

import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";

type SignInStep = "credentials" | "verify";

export default function SignInPage() {
  // v3: useSignIn no longer returns setActive or isLoaded.
  // Loading state is read from fetchStatus; session activation uses signIn.finalize().
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<SignInStep>("credentials");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // v3: fetchStatus replaces isLoaded. 'loading' means Clerk is initialising.
  const isLoading = fetchStatus === "fetching";

  useEffect(() => {
    if (isSignedIn) router.replace("/(tabs)");
  }, [isSignedIn]);

  if (isSignedIn) return null;

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const extractErrorMessage = (err: any): string => {
    const firstError = err?.errors?.[0];
    return firstError?.longMessage ?? firstError?.message ?? "Something went wrong. Please try again.";
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const onSignInPress = async () => {
    if (!signIn || !emailAddress || !password || isLoading) return;
    setError(null);

    // v3: signIn.password() replaces the old signIn.create({ identifier, password }) pattern.
    // It returns { error } and mutates signIn.status in-place.
    const { error: signInError } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (signInError) {
      setError(extractErrorMessage(signInError));
      return;
    }

    if (signIn.status === "complete") {
      // v3: signIn.finalize() replaces setActive({ session: createdSessionId }).
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session) router.replace("/(tabs)");
        },
      });
    } else if (
      signIn.status === "needs_client_trust" ||
      signIn.status === "needs_second_factor"
    ) {
      // v3: 'needs_client_trust' is the new name for what was 'needs_first_factor'
      // in password flows. It means Clerk requires an email code to verify the device.
      // 'needs_second_factor' covers explicit MFA (TOTP, etc.) — email code is also
      // supported there, so we use the same path.
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === "email_code"
      );
      if (emailCodeFactor) {
        // v3: signIn.mfa.sendEmailCode() replaces prepareFirstFactor({ strategy:'email_code', ... })
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) {
          setError(extractErrorMessage(sendError));
          return;
        }
      }
      setStep("verify");
    } else {
      setError(`Unexpected sign-in status: ${signIn.status}`);
    }
  };

  const onVerifyPress = async () => {
    if (!signIn || code.length < 6 || isLoading) return;
    setError(null);

    // v3: signIn.mfa.verifyEmailCode() replaces attemptFirstFactor({ strategy:'email_code', code })
    const { error: verifyError } = await signIn.mfa.verifyEmailCode({ code });

    if (verifyError) {
      setError(extractErrorMessage(verifyError));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session) router.replace("/(tabs)");
        },
      });
    } else {
      setError("Verification incomplete. Please try again.");
    }
  };

  const onResendCode = async () => {
    if (!signIn || isLoading) return;
    setError(null);

    // v3: same replacement as above — mfa.sendEmailCode() for resend
    const { error: resendError } = await signIn.mfa.sendEmailCode();
    if (resendError) setError(extractErrorMessage(resendError));
  };

  const onStartOver = () => {
    setStep("credentials");
    setCode("");
    setError(null);
  };

  // ── MFA / Verify Code UI ──────────────────────────────────────────────────────

  if (step === "verify") {
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
              <Text style={styles.title}>Verify your device</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to {emailAddress}.{"\n"}Enter it below.
              </Text>
            </VStack>

            {error && (
              <Box className="bg-red-400/10 border border-red-400/30 rounded-xl p-3">
                <Text className="text-red-400 text-sm text-center">{error}</Text>
              </Box>
            )}

            <FormControl isInvalid={!!error}>
              <Input
                variant="rounded"
                className="h-14 bg-transparent border-[1.5px] border-orange-600 px-2"
              >
                <InputField
                  value={code}
                  onChangeText={(val) => {
                    setCode(val);
                    setError(null);
                  }}
                  placeholder="6-digit code"
                  placeholderTextColor="#6b6b6b"
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                  className="text-white text-lg font-bold"
                  autoFocus
                />
              </Input>
              {error && (
                <FormControlError>
                  <FormControlErrorText className="text-red-400 mt-1">
                    {error}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <VStack space="md" className="mt-2">
              <Button
                className="h-14 rounded-full bg-orange-600"
                isDisabled={code.length < 6 || isLoading}
                onPress={onVerifyPress}
              >
                {isLoading ? (
                  <ButtonSpinner color="white" />
                ) : (
                  <ButtonText className="font-bold text-white text-base tracking-wide">
                    Verify
                  </ButtonText>
                )}
              </Button>

              <HStack space="md" className="justify-center mt-2">
                <Button
                  variant="link"
                  isDisabled={isLoading}
                  onPress={onResendCode}
                >
                  <ButtonText className="text-orange-600 font-semibold">
                    Resend code
                  </ButtonText>
                </Button>
                <Text className="text-neutral-500">•</Text>
                <Button
                  variant="link"
                  isDisabled={isLoading}
                  onPress={onStartOver}
                >
                  <ButtonText className="text-orange-600 font-semibold">
                    Start over
                  </ButtonText>
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </ScrollView>
      </AuthContainer>
    );
  }

  // ── Credentials UI ────────────────────────────────────────────────────────────

  const canSubmit = !!emailAddress && !!password && !isLoading;

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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your Storks account.</Text>
          </VStack>

          {error && (
            <Box className="bg-red-400/10 border border-red-400/30 rounded-xl p-3">
              <Text className="text-red-400 text-sm text-center">{error}</Text>
            </Box>
          )}

          {/* Email */}
          <FormControl>
            <FormControlLabel className="mb-1.5">
              <FormControlLabelText className="text-neutral-300 font-semibold tracking-wide">
                Email address
              </FormControlLabelText>
            </FormControlLabel>
            <Input
              variant="rounded"
              className="h-14 bg-transparent border-[1.5px] border-orange-600 px-4"
            >
              <InputField
                value={emailAddress}
                onChangeText={(val) => {
                  setEmailAddress(val);
                  setError(null);
                }}
                placeholder="you@example.com"
                placeholderTextColor="#6b6b6b"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-white text-[15px]"
              />
            </Input>
          </FormControl>

          {/* Password */}
          <FormControl>
            <FormControlLabel className="mb-1.5">
              <FormControlLabelText className="text-neutral-300 font-semibold tracking-wide">
                Password
              </FormControlLabelText>
            </FormControlLabel>
            <Input
              variant="rounded"
              className="h-14 bg-transparent border-[1.5px] border-orange-600 px-4"
            >
              <InputField
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setError(null);
                }}
                placeholder="Your password"
                placeholderTextColor="#6b6b6b"
                secureTextEntry={!passwordVisible}
                className="text-white text-[15px]"
              />
              <InputSlot
                className="pr-1"
                onPress={() => setPasswordVisible((v) => !v)}
              >
                {passwordVisible ? (
                  <EyeOff size={20} color="#ea580c" />
                ) : (
                  <Eye size={20} color="#ea580c" />
                )}
              </InputSlot>
            </Input>
          </FormControl>

          <Button
            className="mt-4 h-14 rounded-full bg-orange-600"
            isDisabled={!canSubmit}
            onPress={onSignInPress}
          >
            {isLoading ? (
              <ButtonSpinner color="white" />
            ) : (
              <ButtonText className="font-bold text-white text-base tracking-wide">
                Sign In
              </ButtonText>
            )}
          </Button>

          <OAuthButtons />

          <HStack className="justify-center mt-3 items-center space-x-1">
            <Text className="text-neutral-400 text-sm">
              Don't have an account?{" "}
            </Text>
            <Button
              variant="link"
              onPress={() => router.push("/(auth)/signup")}
              className="p-0 m-0 h-auto"
            >
              <ButtonText className="text-orange-600 font-semibold text-sm m-0 p-0">
                Sign up
              </ButtonText>
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
});