import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import {
  Syne_400Regular,
  Syne_600SemiBold,
  Syne_700Bold,
} from "@expo-google-fonts/syne";
import * as ImagePicker from "expo-image-picker";
import * as React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { completeOnboarding, SecondaryPhone } from "@/utils/api";

const { width } = Dimensions.get("window");

// ------------------------------------------------------------------
// Stork SVG illustration (matches loading screen style)
// ------------------------------------------------------------------
function StorkIllustration() {
  return (
    <Svg width={200} height={220} viewBox="0 0 220 260" fill="none">
      <Path d="M10 42 L68 42" stroke="#C97A3A" strokeWidth="4" strokeLinecap="round" />
      <Path d="M68 42 Q90 42 96 56" stroke="#D4C5B5" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M96 56 Q110 90 100 130 Q92 155 105 175" stroke="#D4C5B5" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M105 175 Q130 160 155 175 Q175 188 165 215 Q155 238 130 242 Q108 245 100 228 Q88 208 105 175 Z" stroke="#D4C5B5" strokeWidth="3" fill="none" />
      <Path d="M115 242 L112 260" stroke="#D4C5B5" strokeWidth="3" strokeLinecap="round" />
      <Path d="M138 242 L140 260" stroke="#D4C5B5" strokeWidth="3" strokeLinecap="round" />
      <Path d="M150 185 Q185 172 210 180 Q195 195 165 195" stroke="#D4C5B5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

// ------------------------------------------------------------------
// Step dot indicator
// ------------------------------------------------------------------
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === current ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );
}

// ------------------------------------------------------------------
// Validation helpers
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
export default function OnboardingPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [fontsLoaded] = useFonts({ Syne_400Regular, Syne_600SemiBold, Syne_700Bold });

  // Step: 0 = welcome, 1 = basics form, 2 = profile picture, 3 = complete
  const [step, setStep] = React.useState(0);

  // Form state
  const [firstName, setFirstName]               = React.useState("");
  const [lastName, setLastName]                 = React.useState("");
  const [dateOfBirth, setDateOfBirth]           = React.useState("");
  const [primaryCountryCode, setPrimaryCountryCode] = React.useState("+94");
  const [primaryNumber, setPrimaryNumber]       = React.useState("");
  const [secondaryNumbers, setSecondaryNumbers] = React.useState<SecondaryPhone[]>([]);
  const [profilePictureUri, setProfilePictureUri] = React.useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError]         = React.useState<string | null>(null);

  // Field-level validation state
  const firstNameValid  = firstName.trim().length > 0;
  const lastNameValid   = lastName.trim().length > 0;
  const dobValid        = isValidDate(dateOfBirth);
  const phoneValid      = primaryNumber.trim().length >= 7;
  const basicsComplete  = firstNameValid && lastNameValid && dobValid && phoneValid;

  // ------------------------------------------------------------------
  // Add / remove secondary number rows
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Image picker
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Submit to backend
  // ------------------------------------------------------------------
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await completeOnboarding(token, {
        firstName:          firstName.trim(),
        lastName:           lastName.trim(),
        dateOfBirth,                           // already in DD-MM-YYYY
        primaryCountryCode,
        primaryNumber:      primaryNumber.trim(),
        secondaryNumbers:   secondaryNumbers.filter(s => s.number.trim().length > 0),
        profilePictureUrl:  profilePictureUri ?? null,
      });

      setStep(3); // go to completion screen
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  // ================================================================
  // STEP 0 — WELCOME SCREEN
  // ================================================================
  if (step === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoHighlight}>S</Text>torks
          </Text>
        </View>

        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeHeadline}>
            Thank you for joining us. We're{"\n"}happy to see you here.
          </Text>
          <Text style={styles.welcomeSub}>Let's see what we offer.</Text>

          {/* Orange card with stork */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeCardText}>
              Let's setup your account{"\n"}to experience all that{"\n"}Storks has to offer
            </Text>
            <View style={styles.storkWrap}>
              <StorkIllustration />
            </View>
            <TouchableOpacity
              style={styles.welcomeCardButton}
              activeOpacity={0.85}
              onPress={() => setStep(1)}
            >
              <Text style={styles.welcomeCardButtonText}>Take me there</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StepDots total={4} current={0} />
      </SafeAreaView>
    );
  }

  // ================================================================
  // STEP 1 — PROFILE BASICS
  // ================================================================
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>
                <Text style={styles.logoHighlight}>S</Text>torks
              </Text>
            </View>

            <View style={styles.formContent}>
              <Text style={styles.orangeHeadline}>
                Welcome stranger, let's get to know you!
              </Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Name */}
              <Text style={styles.sectionLabel}>What should we call you?</Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="First name"
                  placeholderTextColor="#7A726E"
                  value={firstName}
                  onChangeText={v => { setFirstName(v); setError(null); }}
                  autoCorrect={false}
                />
                {firstName.length > 0 && (
                  <View style={[styles.validDot, firstNameValid ? styles.validGreen : styles.validRed]} />
                )}
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Last name"
                  placeholderTextColor="#7A726E"
                  value={lastName}
                  onChangeText={v => { setLastName(v); setError(null); }}
                  autoCorrect={false}
                />
                {lastName.length > 0 && (
                  <View style={[styles.validDot, lastNameValid ? styles.validGreen : styles.validRed]} />
                )}
              </View>

              {/* DOB */}
              <Text style={styles.sectionLabel}>How old are you?</Text>
              <TextInput
                style={styles.input}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#7A726E"
                value={dateOfBirth}
                onChangeText={v => { setDateOfBirth(formatDateInput(v)); setError(null); }}
                keyboardType="numeric"
                maxLength={10}
              />

              {/* Phone */}
              <Text style={styles.sectionLabel}>Please verify your number</Text>
              <View style={styles.phoneRow}>
                <TextInput
                  style={[styles.input, styles.countryCodeInput]}
                  value={primaryCountryCode}
                  onChangeText={setPrimaryCountryCode}
                  keyboardType="phone-pad"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Primary Number"
                  placeholderTextColor="#7A726E"
                  value={primaryNumber}
                  onChangeText={v => { setPrimaryNumber(v); setError(null); }}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Secondary numbers */}
              {secondaryNumbers.map((sec, i) => (
                <View key={i} style={styles.phoneRow}>
                  <TextInput
                    style={[styles.input, styles.countryCodeInput]}
                    value={sec.countryCode}
                    onChangeText={v => updateSecondary(i, "countryCode", v)}
                    keyboardType="phone-pad"
                    maxLength={5}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={`Secondary Number ${i + 1}`}
                    placeholderTextColor="#7A726E"
                    value={sec.number}
                    onChangeText={v => updateSecondary(i, "number", v)}
                    keyboardType="phone-pad"
                  />
                  <TouchableOpacity onPress={() => removeSecondary(i)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {secondaryNumbers.length < 3 && (
                <TouchableOpacity style={styles.addMoreRow} onPress={addSecondaryNumber}>
                  <Text style={styles.addMoreText}>＋  Add More</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, !basicsComplete && styles.buttonDisabled]}
                activeOpacity={0.85}
                onPress={() => setStep(2)}
                disabled={!basicsComplete}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <StepDots total={4} current={1} />
      </SafeAreaView>
    );
  }

  // ================================================================
  // STEP 2 — PROFILE PICTURE
  // ================================================================
  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>
            <Text style={styles.logoHighlight}>S</Text>torks
          </Text>
          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pictureContent}>
          <Text style={styles.orangeHeadline}>Let's add a face to the name ;)</Text>

          <Text style={styles.sectionLabel}>Upload a profile picture?</Text>

          {/* Avatar circle */}
          <TouchableOpacity style={styles.avatarCircle} onPress={pickImage}>
            {profilePictureUri ? (
              <Image source={{ uri: profilePictureUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage} activeOpacity={0.8}>
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => { setProfilePictureUri(null); handleSubmit(); }}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Continue — only active if image picked */}
        <View style={styles.bottomButton}>
          <TouchableOpacity
            style={[styles.primaryButton, (!profilePictureUri || isLoading) && styles.buttonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={!profilePictureUri || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        <StepDots total={4} current={2} />
      </SafeAreaView>
    );
  }

  // ================================================================
  // STEP 3 — COMPLETE
  // ================================================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoRow}>
        <Text style={styles.logoText}>
          <Text style={styles.logoHighlight}>S</Text>torks
        </Text>
      </View>

      <View style={styles.completeContent}>
        <Text style={styles.orangeHeadline}>
          All done! Welcome to Storks {firstName} 🎉
        </Text>

        {/* Completion illustration placeholder */}
        <View style={styles.completeIllustration}>
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
          <Text style={styles.completeSubText}>Your profile is all set up!</Text>
        </View>
      </View>

      <View style={styles.bottomButton}>
        <TouchableOpacity
          style={styles.orangeButton}
          activeOpacity={0.85}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.orangeButtonText}>Take me to Storks!</Text>
        </TouchableOpacity>
      </View>

      <StepDots total={4} current={3} />
    </SafeAreaView>
  );
}

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171412",
  },
  logoContainer: {
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingLeft: 24,
    paddingBottom: 8,
  },
  logoRow: {
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
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
  backArrow: {
    fontFamily: "Syne_700Bold",
    fontSize: 22,
    color: "#E66B00",
  },

  // ── Welcome ──────────────────────────────────────────────────────
  welcomeContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  welcomeHeadline: {
    fontFamily: "Syne_600SemiBold",
    fontSize: 18,
    color: "#E66B00",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 10,
  },
  welcomeSub: {
    fontFamily: "Syne_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 28,
  },
  welcomeCard: {
    backgroundColor: "#E66B00",
    borderRadius: 24,
    padding: 28,
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  welcomeCardText: {
    fontFamily: "Syne_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    lineHeight: 26,
    marginBottom: 16,
    zIndex: 2,
  },
  storkWrap: {
    position: "absolute",
    bottom: 70,
    right: -20,
    opacity: 0.25,
  },
  welcomeCardButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeCardButtonText: {
    fontFamily: "Syne_700Bold",
    fontSize: 15,
    color: "#000000",
  },

  // ── Form (Step 1) ────────────────────────────────────────────────
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  orangeHeadline: {
    fontFamily: "Syne_600SemiBold",
    fontSize: 16,
    color: "#E66B00",
    marginBottom: 28,
    lineHeight: 24,
  },
  sectionLabel: {
    fontFamily: "Syne_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 12,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#E66B00",
    borderRadius: 28,
    paddingHorizontal: 20,
    color: "#FFFFFF",
    fontFamily: "Syne_400Regular",
    fontSize: 15,
    backgroundColor: "transparent",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  countryCodeInput: {
    width: 72,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  validDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  validGreen: { backgroundColor: "#4CAF50" },
  validRed:   { backgroundColor: "#FF6B6B" },
  addMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    marginTop: 4,
  },
  addMoreText: {
    fontFamily: "Syne_600SemiBold",
    fontSize: 14,
    color: "#E66B00",
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeBtnText: {
    color: "#FF6B6B",
    fontSize: 16,
  },
  errorText: {
    fontFamily: "Syne_400Regular",
    color: "#FF6B6B",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },

  // ── Profile Picture (Step 2) ─────────────────────────────────────
  pictureContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "center",
  },
  avatarCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
    marginBottom: 32,
    marginTop: 16,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#D9D9D9",
    borderRadius: 80,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  uploadButton: {
    width: width - 48,
    height: 56,
    backgroundColor: "#3E3834",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadButtonText: {
    fontFamily: "Syne_600SemiBold",
    color: "#FFFFFF",
    fontSize: 15,
  },
  skipButton: {
    width: width - 48,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  skipButtonText: {
    fontFamily: "Syne_700Bold",
    color: "#000000",
    fontSize: 15,
  },

  // ── Complete (Step 3) ────────────────────────────────────────────
  completeContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: "center",
  },
  completeIllustration: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  completeSubText: {
    fontFamily: "Syne_400Regular",
    fontSize: 14,
    color: "#7A726E",
  },

  // ── Shared ───────────────────────────────────────────────────────
  primaryButton: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  primaryButtonText: {
    fontFamily: "Syne_700Bold",
    color: "#000000",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  orangeButton: {
    height: 56,
    backgroundColor: "#E66B00",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  orangeButtonText: {
    fontFamily: "Syne_700Bold",
    color: "#FFFFFF",
    fontSize: 15,
  },
  bottomButton: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: "#E66B00",
  },
  dotInactive: {
    backgroundColor: "#FFFFFF",
  },
});