import { useFonts, Syne_400Regular, Syne_600SemiBold, Syne_700Bold } from "@expo-google-fonts/syne";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useApiClient } from "@/middleware/apiClient";
import { childFormStore } from "@/utils/childFormStore";
import type { CreateChildPayload } from "@/utils/api";

const { width } = Dimensions.get("window");

// ── Validation icons ─────────────────────────────────────────────────────────
function ValidIcon({ valid }: { valid: boolean }) {
  return (
    <View style={[styles.validCircle, valid ? styles.validOk : styles.validErr]}>
      <Text style={[styles.validMark, valid ? styles.validMarkOk : styles.validMarkErr]}>
        {valid ? "✓" : "✗"}
      </Text>
    </View>
  );
}

// ── Image picker circle ──────────────────────────────────────────────────────
function PhotoPicker({
  uri,
  label,
  onPick,
}: {
  uri: string | null;
  label: string;
  onPick: () => void;
}) {
  return (
    <TouchableOpacity style={styles.photoWrap} onPress={onPick} activeOpacity={0.8}>
      <View style={styles.photoCircle}>
        {uri ? (
          <Image source={{ uri }} style={styles.photoImage} />
        ) : (
          <View style={styles.photoPlaceholder} />
        )}
        <View style={styles.photoPlusBadge}>
          <Text style={styles.photoPlusText}>＋</Text>
        </View>
      </View>
      <Text style={styles.photoLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Format date input DD-MM-YYYY ─────────────────────────────────────────────
function formatDob(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4)}`;
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function AddChildScreen() {
  const router = useRouter();
  const api = useApiClient();
  const [fontsLoaded] = useFonts({ Syne_400Regular, Syne_600SemiBold, Syne_700Bold });

  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [preferred, setPreferred]   = useState("");
  const [dob, setDob]               = useState("");
  const [school, setSchool]         = useState("");
  const [disabilities, setDisabilities] = useState<string[]>([]);
  const [medicalNotes, setMedicalNotes] = useState<string[]>([]);

  const [frontUri, setFrontUri]     = useState<string | null>(null);
  const [sideUri, setSideUri]       = useState<string | null>(null);

  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const firstValid   = firstName.trim().length > 0;
  const lastValid    = lastName.trim().length > 0;
  const prefTouched  = preferred.length > 0;
  const canSubmit    = firstValid && lastValid && !isLoading;

  const pickPhoto = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const openListInput = (
    title: string,
    current: string[],
    setter: (v: string[]) => void
  ) => {
    Alert.prompt(
      title,
      "Enter items separated by commas",
      (text) => {
        if (text) setter(text.split(",").map((s) => s.trim()).filter(Boolean));
      },
      "plain-text",
      current.join(", ")
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const schedule = childFormStore
        .getSchedule()
        .filter((d) => d.customDropoffAddress.trim() || d.customPickupAddress.trim())
        .map((d) => ({
          dayOfWeek: d.day,
          customDropoffAddress: d.customDropoffAddress || undefined,
          customPickupAddress: d.customPickupAddress || undefined,
        }));

      const payload: CreateChildPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        preferredName: preferred.trim() || undefined,
        dateOfBirth: dob || undefined,
        schoolName: school.trim() || undefined,
        frontPictureUrl: frontUri ?? undefined,
        sidePictureUrl: sideUri ?? undefined,
        disabilities: disabilities.length ? disabilities : undefined,
        medicalNotes: medicalNotes.length ? medicalNotes : undefined,
        weeklySchedule: schedule.length ? schedule : undefined,
      };

      await api.post("/api/children", payload);
      childFormStore.reset();
      router.back();
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
      console.error("[AddChild]", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Add Child</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Name inputs */}
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="First name"
              placeholderTextColor="#7A726E"
              value={firstName}
              onChangeText={(v) => { setFirstName(v); setError(null); }}
              autoCorrect={false}
            />
            {firstName.length > 0 && <ValidIcon valid={firstValid} />}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Last name"
              placeholderTextColor="#7A726E"
              value={lastName}
              onChangeText={(v) => { setLastName(v); setError(null); }}
              autoCorrect={false}
            />
            {lastName.length > 0 && <ValidIcon valid={lastValid} />}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Preferred name"
              placeholderTextColor="#7A726E"
              value={preferred}
              onChangeText={setPreferred}
              autoCorrect={false}
            />
            {prefTouched && <ValidIcon valid={preferred.trim().length > 0} />}
          </View>

          {/* Photo pickers */}
          <View style={styles.photoRow}>
            <PhotoPicker
              uri={frontUri}
              label="Front Picture"
              onPick={() => pickPhoto(setFrontUri)}
            />
            <PhotoPicker
              uri={sideUri}
              label="Left Side"
              onPick={() => pickPhoto(setSideUri)}
            />
            <PhotoPicker
              uri={null}
              label="Right Side"
              onPick={() => pickPhoto(setSideUri)}
            />
          </View>

          {/* Birthday */}
          <TextInput
            style={[styles.input, styles.centeredInput]}
            placeholder="Add Birthday  DD-MM-YYYY"
            placeholderTextColor="#7A726E"
            value={dob}
            onChangeText={(v) => setDob(formatDob(v))}
            keyboardType="numeric"
            maxLength={10}
          />

          {/* School */}
          <Text style={styles.sectionLabel}>Please add the child's school</Text>
          <TextInput
            style={[styles.input, styles.centeredInput]}
            placeholder="School"
            placeholderTextColor="#7A726E"
            value={school}
            onChangeText={setSchool}
            autoCorrect={false}
          />

          {/* Action buttons */}
          <TouchableOpacity
            style={styles.whiteBtn}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/children/schedule")}
          >
            <Text style={styles.whiteBtnText}>Customize schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whiteBtn}
            activeOpacity={0.85}
            onPress={() => openListInput("Add Disabilities", disabilities, setDisabilities)}
          >
            <Text style={styles.whiteBtnText}>
              {disabilities.length > 0
                ? `Disabilities (${disabilities.length})`
                : "Add Disabilities"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whiteBtn}
            activeOpacity={0.85}
            onPress={() => openListInput("Add Health Concerns", medicalNotes, setMedicalNotes)}
          >
            <Text style={styles.whiteBtnText}>
              {medicalNotes.length > 0
                ? `Health Concerns (${medicalNotes.length})`
                : "Add Health Concerns"}
            </Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Add a child</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171412",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 48,
    gap: 16,
  },
  pageTitle: {
    fontFamily: "Syne_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  errorText: {
    fontFamily: "Syne_400Regular",
    color: "#FF6B6B",
    fontSize: 13,
    textAlign: "center",
  },
  sectionLabel: {
    fontFamily: "Syne_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E66B00",
    borderRadius: 28,
    paddingHorizontal: 20,
    color: "#FFFFFF",
    fontFamily: "Syne_400Regular",
    fontSize: 15,
    backgroundColor: "transparent",
  },
  centeredInput: {
    textAlign: "center",
  },
  validCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  validOk: {
    borderColor: "#FFFFFF",
  },
  validErr: {
    borderColor: "#E63946",
  },
  validMark: {
    fontSize: 14,
    fontWeight: "700",
  },
  validMarkOk: {
    color: "#FFFFFF",
  },
  validMarkErr: {
    color: "#E63946",
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  photoWrap: {
    alignItems: "center",
    gap: 8,
  },
  photoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    backgroundColor: "#D9D9D9",
    position: "relative",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2A2420",
    borderRadius: 45,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoPlusBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#E66B00",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlusText: {
    color: "#E66B00",
    fontSize: 14,
    lineHeight: 20,
  },
  photoLabel: {
    fontFamily: "Syne_400Regular",
    fontSize: 12,
    color: "#FFFFFF",
  },
  whiteBtn: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  whiteBtnText: {
    fontFamily: "Syne_700Bold",
    fontSize: 15,
    color: "#000000",
  },
  submitBtn: {
    height: 56,
    backgroundColor: "#3E3834",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontFamily: "Syne_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
