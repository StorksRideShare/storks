import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
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
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else if (signInAttempt.status === "needs_second_factor") {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor: any) => factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        }
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "Something went wrong.");
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
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, setActive, router, code]);

  return (
    <AuthContainer style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <AuthLogo />
        
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 32 }}>
          {showEmailCode ? (
            <>
              <AuthTitle>Verify your email</AuthTitle>
              <AuthDescription>A verification code has been sent to your email.</AuthDescription>
              <AuthError message={error} />
              <AuthInput
                value={code}
                placeholder="Enter verification code"
                onChangeText={setCode}
                keyboardType="numeric"
              />
              <AuthButton 
                title="Verify" 
                onPress={onVerifyPress} 
                isLoading={isLoading} 
                disabled={!code} 
              />
              <AuthButton 
                title="Go back" 
                onPress={() => setShowEmailCode(false)} 
                variant="secondary" 
              />
            </>
          ) : (
            <>
              <AuthTitle>Welcome Back!</AuthTitle>
              <AuthError message={error} />
              <AuthInput
                placeholder="Email"
                keyboardType="email-address"
                value={emailAddress}
                onChangeText={setEmailAddress}
              />
              <AuthInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <AuthButton 
                title="Log In" 
                onPress={onSignInPress} 
                isLoading={isLoading} 
                disabled={!emailAddress || !password} 
              />
              <Link href="/signup" asChild>
                <AuthButton title="Don't have an account yet?" onPress={() => {}} variant="secondary" />
              </Link>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </AuthContainer>
  );
}
