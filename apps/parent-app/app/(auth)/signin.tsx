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
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";

export default function SignInPage() {
  const { signIn, setActive, errors, fetchStatus } = useSignIn() as any;
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Component state
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (isSignedIn) router.replace("/(tabs)");
  }, [isSignedIn]);

  if (isSignedIn) return null;

  const onSignInPress = async () => {
    if (!emailAddress || !password) return;

    // Utilize official API which resolves instead of throwing
    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      console.error("[SignIn Error]", JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await setActive({ session: signIn.createdSessionId });
      router.replace("/(tabs)");
    } else if (
      signIn.status === "needs_first_factor" ||
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      // MFA / Trust requires verification code
      if (signIn.status === "needs_first_factor") {
        const emailFactor = signIn.supportedFirstFactors?.find((f: any) => f.strategy === "email_code");
        if (emailFactor && emailFactor.emailAddressId) {
          await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId: emailFactor.emailAddressId });
        }
      } else {
        await signIn.prepareSecondFactor({ strategy: "email_code" });
      }
    } else {
      console.error("[SignIn API] Unexpected sign in status:", signIn.status);
    }
  };

  const onVerifyPress = async () => {
    if (code.length < 6) return;

    let result;
    if (signIn.status === "needs_first_factor") {
      // Attempt verification for the first factor
      result = await signIn.attemptFirstFactor({ strategy: "email_code", code });
    } else {
      result = await signIn.attemptSecondFactor({ strategy: "email_code", code });
    }

    if (result && result.status === "complete") {
      await setActive({ session: result.createdSessionId });
      router.replace("/(tabs)");
    } else {
      console.error("[Verify Error] Verification not complete:", result?.status);
    }
  };

  const onResendCode = async () => {
    if (signIn.status === "needs_first_factor") {
      const emailFactor = signIn.supportedFirstFactors?.find((f: any) => f.strategy === "email_code");
      if (emailFactor && emailFactor.emailAddressId) {
        await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId: emailFactor.emailAddressId });
      }
    } else {
      await signIn.prepareSecondFactor({ strategy: "email_code" });
    }
  };

  const onStartOver = () => {
    // Reset to start
    signIn.reset();
  };

  const isFetching = fetchStatus === "fetching";

  // ── MFA / Verify Code Display ────────────────────────────────────────────────
  if (signIn?.status === "needs_first_factor" || signIn?.status === "needs_second_factor" || signIn?.status === "needs_client_trust") {
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
                {isFetching ? <ButtonSpinner color="white" /> : <ButtonText className="font-bold text-white text-base tracking-wide">Verify</ButtonText>}
              </Button>

              <HStack space="md" className="justify-center mt-2">
                <Button
                  variant="link"
                  disabled={isFetching}
                  isDisabled={isFetching}
                  onPress={onResendCode}
                >
                  <ButtonText className="text-orange-600 font-semibold">Resend code</ButtonText>
                </Button>
                <Text className="text-neutral-500">•</Text>
                <Button
                  variant="link"
                  disabled={isFetching}
                  isDisabled={isFetching}
                  onPress={onStartOver}
                >
                  <ButtonText className="text-orange-600 font-semibold">Start over</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </ScrollView>
      </AuthContainer>
    );
  }

  // ── Main Form UI ─────────────────────────────────────────────────────────────
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

          {/* Non-field global errors */}
          {errors?.globalError && (
            <Box className="bg-red-400/10 border border-red-400/30 rounded-xl p-3">
              <Text className="text-red-400 text-sm text-center">{errors.globalError.message}</Text>
            </Box>
          )}

          {/* Email field */}
          <FormControl isInvalid={!!errors?.fields?.identifier || !!errors?.fields?.emailAddress}>
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
            {(errors?.fields?.identifier || errors?.fields?.emailAddress) && (
              <FormControlError>
                <FormControlErrorText className="text-red-400 mt-1">
                  {errors.fields.identifier?.message || errors.fields.emailAddress?.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Password field */}
          <FormControl isInvalid={!!errors?.fields?.password}>
            <FormControlLabel className="mb-1.5"><FormControlLabelText className="text-neutral-300 font-semibold tracking-wide">Password</FormControlLabelText></FormControlLabel>
            <Input variant="rounded" className="h-14 bg-transparent border-[1.5px] border-orange-600 px-4">
              <InputField
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
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

          <Button
            className="mt-4 h-14 rounded-full bg-orange-600"
            isDisabled={!emailAddress || !password || isFetching}
            disabled={!emailAddress || !password || isFetching}
            onPress={onSignInPress}
          >
            {isFetching ? <ButtonSpinner color="white" /> : <ButtonText className="font-bold text-white text-base tracking-wide">Sign In</ButtonText>}
          </Button>

          <OAuthButtons />

          <HStack className="justify-center mt-3 items-center space-x-1">
            <Text className="text-neutral-400 text-sm">Don't have an account? </Text>
            <Button variant="link" onPress={() => router.push("/(auth)/signup")} className="p-0 m-0 h-auto">
              <ButtonText className="text-orange-600 font-semibold text-sm m-0 p-0">Sign up</ButtonText>
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
