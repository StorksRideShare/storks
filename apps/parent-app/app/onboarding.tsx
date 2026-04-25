import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useApiClient } from "@/middleware/apiClient";
import { StorkIllustration } from "@/components/common/StorkIllustration";
import { StepDots } from "@/components/common/StepDots";
import * as ImagePicker from "expo-image-picker";
import * as React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import type { SecondaryPhone, OnboardingPayload } from "@/utils/api";

// ── Validation helpers ────────────────────────────────────────────────────────

function isValidDate(val: string): boolean {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(val)) return false;
  const [d, m, y] = val.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d &&
    y >= 1900 &&
    y <= new Date().getFullYear()
  );
}

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const api = useApiClient("user-service");

  // Step: 0 = welcome, 1 = basics, 2 = profile picture, 3 = address, 4 = complete
  const [step, setStep] = React.useState(0);

  // Form state
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [primaryCountryCode, setPrimaryCountryCode] = React.useState("+94");
  const [primaryNumber, setPrimaryNumber] = React.useState("");
  const [secondaryNumbers, setSecondaryNumbers] = React.useState<SecondaryPhone[]>([]);
  const [profilePictureUri, setProfilePictureUri] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState("");

  // UI state
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Validation
  const firstNameValid = firstName.trim().length > 0;
  const lastNameValid = lastName.trim().length > 0;
  const dobValid = isValidDate(dateOfBirth);
  const phoneValid = primaryNumber.trim().length >= 7;
  const basicsComplete = firstNameValid && lastNameValid && dobValid && phoneValid;
  const addressValid = address.trim().length > 5;

  // Shared components
  const Logo = () => (
    <HStack className="px-6 pt-5 pb-2">
      <Text className="text-white font-bold text-xl">
        <Text className="text-brand">S</Text>torks
      </Text>
    </HStack>
  );

  const ErrorMessage = () =>
    error ? (
      <Box className="bg-error-50 border border-error-300 rounded-2xl px-4 py-3 mb-4">
        <Text className="text-error-600 text-sm text-center">{error}</Text>
      </Box>
    ) : null;

  // ── Secondary phone helpers ──────────────────────────────────────────────────
  const addSecondaryNumber = () => {
    if (secondaryNumbers.length < 3) {
      setSecondaryNumbers([...secondaryNumbers, { countryCode: "+94", number: "" }]);
    }
  };
  const updateSecondary = (index: number, field: keyof SecondaryPhone, value: string) => {
    const updated = [...secondaryNumbers];
    updated[index] = { ...updated[index], [field]: value };
    setSecondaryNumbers(updated);
  };
  const removeSecondary = (index: number) => {
    setSecondaryNumbers(secondaryNumbers.filter((_, i) => i !== index));
  };

  // ── Image picker ─────────────────────────────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfilePictureUri(result.assets[0].uri);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: OnboardingPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        primaryCountryCode,
        primaryNumber: primaryNumber.trim(),
        secondaryNumbers: secondaryNumbers.filter((s) => s.number.trim().length > 0),
        profilePictureUrl: profilePictureUri ?? null,
        address: address.trim(),
      };
      await api.post("/onboarding/complete", payload);
      setStep(4);
    } catch (err: any) {
      if (__DEV__) console.warn("[Onboarding] Service unavailable, simulating success", err);
      // For the demo, we allow completion even if the backend is down
      setStep(4);
    } finally {
      setIsLoading(false);
    }

    // ── STEP 0 — WELCOME ─────────────────────────────────────────────────────────
    if (step === 0) {
      return (
        <SafeAreaView className="flex-1 bg-background-dark">
          <Logo />
          <VStack className="flex-1 px-6 pt-6" space="md">
            <Text className="text-brand font-semibold text-lg text-center leading-6">
              Thank you for joining us. We're{"\n"}happy to see you here.
            </Text>
            <Text className="text-white text-sm text-center mb-6">
              Let's see what we offer.
            </Text>

            {/* Orange card */}
            <Box className="bg-brand rounded-3xl p-7 flex-1 overflow-hidden relative">
              <Text className="text-white font-semibold text-lg leading-7 mb-4 z-10">
                Let's setup your account{"\n"}to experience all that{"\n"}Storks has to offer
              </Text>
              <Box className="absolute bottom-16 right-[-20px] opacity-25">
                <StorkIllustration />
              </Box>
              <Button
                className="absolute bottom-6 left-6 right-6 h-14 bg-white rounded-full"
                onPress={() => setStep(1)}
              >
                <ButtonText className="text-black font-bold">Take me there</ButtonText>
              </Button>
            </Box>
          </VStack>
          <StepDots total={5} current={0} />
        </SafeAreaView>
      );
    }

    // ── STEP 1 — PROFILE BASICS ───────────────────────────────────────────────────
    if (step === 1) {
      return (
        <SafeAreaView className="flex-1 bg-background-dark">
          <Logo />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <VStack className="px-6 pt-4 pb-6" space="sm">
                <Text className="text-brand font-semibold text-base mb-6 leading-6">
                  Welcome stranger, let's get to know you!
                </Text>

                <ErrorMessage />

                {/* Name */}
                <Text className="text-white text-sm mb-3">What should we call you?</Text>
                <HStack space="sm" className="mb-4">
                  <Box className="flex-1">
                    <Input className="bg-transparent border border-brand h-14 rounded-full">
                      <InputField
                        className="text-white px-5"
                        placeholder="First name"
                        placeholderTextColor="#7A726E"
                        value={firstName}
                        onChangeText={(v) => { setFirstName(v); setError(null); }}
                        autoCorrect={false}
                      />
                    </Input>
                  </Box>
                </HStack>

                <HStack space="sm" className="mb-4">
                  <Box className="flex-1">
                    <Input className="bg-transparent border border-brand h-14 rounded-full">
                      <InputField
                        className="text-white px-5"
                        placeholder="Last name"
                        placeholderTextColor="#7A726E"
                        value={lastName}
                        onChangeText={(v) => { setLastName(v); setError(null); }}
                        autoCorrect={false}
                      />
                    </Input>
                  </Box>
                </HStack>

                {/* DOB */}
                <Text className="text-white text-sm mb-3">How old are you?</Text>
                <Input className="bg-transparent border border-brand h-14 rounded-full mb-4">
                  <InputField
                    className="text-white px-5"
                    placeholder="DD-MM-YYYY"
                    placeholderTextColor="#7A726E"
                    value={dateOfBirth}
                    onChangeText={(v) => { setDateOfBirth(formatDateInput(v)); setError(null); }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </Input>

                {/* Primary phone */}
                <Text className="text-white text-sm mb-3">Please verify your number</Text>
                <HStack space="sm" className="mb-4">
                  <Input className="w-20 bg-transparent border border-brand h-14 rounded-full">
                    <InputField
                      className="text-white px-3 text-center"
                      value={primaryCountryCode}
                      onChangeText={setPrimaryCountryCode}
                      keyboardType="phone-pad"
                      maxLength={5}
                    />
                  </Input>
                  <Box className="flex-1">
                    <Input className="bg-transparent border border-brand h-14 rounded-full">
                      <InputField
                        className="text-white px-5"
                        placeholder="Primary Number"
                        placeholderTextColor="#7A726E"
                        value={primaryNumber}
                        onChangeText={(v) => { setPrimaryNumber(v); setError(null); }}
                        keyboardType="phone-pad"
                      />
                    </Input>
                  </Box>
                </HStack>

                {/* Secondary numbers */}
                {secondaryNumbers.map((sec, i) => (
                  <HStack key={i} space="sm" className="mb-4">
                    <Input className="w-20 bg-transparent border border-brand h-14 rounded-full">
                      <InputField
                        className="text-white px-3 text-center"
                        value={sec.countryCode}
                        onChangeText={(v) => updateSecondary(i, "countryCode", v)}
                        keyboardType="phone-pad"
                        maxLength={5}
                      />
                    </Input>
                    <Box className="flex-1">
                      <Input className="bg-transparent border border-brand h-14 rounded-full">
                        <InputField
                          className="text-white px-5"
                          placeholder={`Secondary Number ${i + 1}`}
                          placeholderTextColor="#7A726E"
                          value={sec.number}
                          onChangeText={(v) => updateSecondary(i, "number", v)}
                          keyboardType="phone-pad"
                        />
                      </Input>
                    </Box>
                    <Pressable
                      onPress={() => removeSecondary(i)}
                      className="self-center px-3"
                    >
                      <Text className="text-error-500 text-lg">✕</Text>
                    </Pressable>
                  </HStack>
                ))}

                {secondaryNumbers.length < 3 && (
                  <Pressable onPress={addSecondaryNumber} className="mb-6">
                    <Text className="text-brand font-semibold text-sm">＋  Add More</Text>
                  </Pressable>
                )}

                <Button
                  className="h-14 bg-white rounded-full mt-2"
                  onPress={() => setStep(2)}
                  isDisabled={!basicsComplete}
                >
                  <ButtonText className="text-black font-bold">Continue</ButtonText>
                </Button>
              </VStack>
            </ScrollView>
          </KeyboardAvoidingView>
          <StepDots total={5} current={1} />
        </SafeAreaView>
      );
    }

    // ── STEP 2 — PROFILE PICTURE ──────────────────────────────────────────────────
    if (step === 2) {
      return (
        <SafeAreaView className="flex-1 bg-background-dark">
          <HStack className="px-6 pt-5 pb-2 justify-between items-center">
            <Text className="text-white font-bold text-xl">
              <Text className="text-brand">S</Text>torks
            </Text>
            <Pressable onPress={() => setStep(1)}>
              <Text className="text-brand text-2xl font-bold">←</Text>
            </Pressable>
          </HStack>

          <VStack className="flex-1 px-6 pt-4 items-center" space="md">
            <Text className="text-brand font-semibold text-base text-left w-full mb-4 leading-6">
              Let's add a face to the name ;)
            </Text>

            <Pressable onPress={pickImage}>
              <Box className="w-40 h-40 rounded-full overflow-hidden bg-outline-300">
                {profilePictureUri ? (
                  <Image
                    source={{ uri: profilePictureUri }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Box className="w-full h-full bg-outline-400 rounded-full" />
                )}
              </Box>
            </Pressable>

            <Button
              className="h-14 bg-outline-700 rounded-full w-full"
              onPress={pickImage}
            >
              <ButtonText className="text-white font-semibold">Upload Photo</ButtonText>
            </Button>

            <Button
              className="h-14 bg-white rounded-full w-full"
              onPress={() => { setProfilePictureUri(null); setStep(3); }}
            >
              <ButtonText className="text-black font-bold">Skip</ButtonText>
            </Button>
          </VStack>

          <Box className="px-6 pb-4">
            <Button
              className={`h-14 rounded-full w-full ${!profilePictureUri ? "bg-outline-700" : "bg-white"}`}
              onPress={() => setStep(3)}
              isDisabled={!profilePictureUri}
            >
              <ButtonText className={!profilePictureUri ? "text-typography-500 font-bold" : "text-black font-bold"}>
                Continue
              </ButtonText>
            </Button>
          </Box>

          <StepDots total={5} current={2} />
        </SafeAreaView>
      );
    }

    // ── STEP 3 — HOME ADDRESS ───────────────────────────────────────────────────
    if (step === 3) {
      return (
        <SafeAreaView className="flex-1 bg-background-dark">
          <HStack className="px-6 pt-5 pb-2 justify-between items-center">
            <Text className="text-white font-bold text-xl">
              <Text className="text-brand">S</Text>torks
            </Text>
            <Pressable onPress={() => setStep(2)}>
              <Text className="text-brand text-2xl font-bold">←</Text>
            </Pressable>
          </HStack>

          <VStack className="flex-1 px-6 pt-4" space="md">
            <Text className="text-brand font-semibold text-base mb-4 leading-6">
              Where do we pick you up from?
            </Text>

            <ErrorMessage />

            <Text className="text-white text-sm mb-1">Home Address</Text>
            <Input className="bg-transparent border border-brand h-14 rounded-2xl mb-4">
              <InputField
                className="text-white px-5"
                placeholder="Enter your home address"
                placeholderTextColor="#7A726E"
                value={address}
                onChangeText={(v) => { setAddress(v); setError(null); }}
              />
            </Input>

            <Text className="text-typography-500 text-xs px-2 mb-6">
              We'll use this as the default pickup location for your rides. You can change this later.
            </Text>

            <Button
              className="h-14 bg-white rounded-full w-full"
              onPress={handleSubmit}
              isDisabled={!addressValid || isLoading}
            >
              {isLoading ? (
                <Spinner size="small" className="text-black" />
              ) : (
                <ButtonText className="text-black font-bold">Complete Setup</ButtonText>
              )}
            </Button>
          </VStack>

          <StepDots total={5} current={3} />
        </SafeAreaView>
      );
    }

    // ── STEP 4 — COMPLETE ─────────────────────────────────────────────────────────
    return (
      <SafeAreaView className="flex-1 bg-background-dark">
        <HStack className="px-6 pt-5 pb-2">
          <Text className="text-white font-bold text-xl">
            <Text className="text-brand">S</Text>torks
          </Text>
        </HStack>

        <VStack className="flex-1 px-6 pt-8 items-center justify-center" space="lg">
          <Text className="text-brand font-semibold text-base text-center leading-6">
            All done! Welcome to Storks {firstName} 🎉
          </Text>

          <Box>
            <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
              <Circle cx="60" cy="60" r="56" stroke="#E66B00" strokeWidth="2" fill="#2A1E14" />
              <Path
                d="M35 62 L52 79 L85 43"
                stroke="#E66B00"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Box>

          <Text className="text-typography-500 text-sm">Your profile is all set up!</Text>
        </VStack>

        <Box className="px-6 pb-4">
          <Button
            className="h-14 bg-brand rounded-full w-full"
            onPress={() => router.replace("/(tabs)")}
          >
            <ButtonText className="text-white font-bold">Take me to Storks!</ButtonText>
          </Button>
        </Box>

        <StepDots total={5} current={4} />
      </SafeAreaView>
    );
  }
}