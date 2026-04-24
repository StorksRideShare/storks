import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ChevronLeft, CheckCircle2, XCircle, Plus, Calendar } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import { useApiClient } from "@/middleware/apiClient";

// ── Validated input pill ───────────────────────────────────────────────────────
function PillInput({
  placeholder,
  value,
  onChange,
  valid,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  valid: boolean | null;
}) {
  return (
    <Box className="border border-brand rounded-full h-14 flex-row items-center px-4 mb-3">
      <Input className="flex-1 bg-transparent border-0 h-full">
        <InputField
          placeholder={placeholder}
          placeholderTextColor="#7A726E"
          className="text-white text-base"
          value={value}
          onChangeText={onChange}
        />
      </Input>
      {valid === true && <CheckCircle2 size={20} color="#22c55e" />}
      {valid === false && <XCircle size={20} color="#ef4444" />}
    </Box>
  );
}

// ── Photo upload circle ────────────────────────────────────────────────────────
function PhotoCircle({
  label,
  uri,
  onPick,
}: {
  label: string;
  uri: string | null;
  onPick: () => void;
}) {
  return (
    <VStack className="items-center" style={{ flex: 1 }}>
      <TouchableOpacity onPress={onPick}>
        <Box
          className="rounded-full overflow-hidden items-center justify-center bg-outline-800 border border-outline-600"
          style={{ width: 88, height: 88 }}
        >
          {uri ? (
            <Image
              source={{ uri }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Box className="w-7 h-7 rounded-full border-2 border-brand items-center justify-center">
              <Plus size={14} color="#E66B00" />
            </Box>
          )}
        </Box>
      </TouchableOpacity>
      <Text className="text-typography-400 text-xs mt-2">{label}</Text>
    </VStack>
  );
}

// ── Secondary action button ────────────────────────────────────────────────────
function ActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Box className="bg-white rounded-full h-14 items-center justify-center mb-3">
        <Text className="text-black font-semibold text-base">{label}</Text>
      </Box>
    </TouchableOpacity>
  );
}

// ── Add Child Screen ───────────────────────────────────────────────────────────
export default function AddChildScreen() {
  const api = useApiClient("user-service");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [school, setSchool] = useState("");
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [leftUri, setLeftUri] = useState<string | null>(null);
  const [rightUri, setRightUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const firstNameValid =
    firstName.trim().length > 0 ? true : firstName.length > 0 ? false : null;
  const lastNameValid =
    lastName.trim().length > 0 ? true : lastName.length > 0 ? false : null;
  const preferredNameValid =
    preferredName.trim().length > 0
      ? true
      : preferredName.length > 0
      ? false
      : null;

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    school.trim().length > 0;

  const pickPhoto = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/parent/children", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        preferredName: preferredName.trim() || null,
        birthday: birthday.trim() || null,
        schoolName: school.trim(),
        frontPhotoUrl: frontUri,
        leftPhotoUrl: leftUri,
        rightPhotoUrl: rightUri,
      });
      router.replace("/(children)");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "Could not add child. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#E66B00" />
        </Pressable>
        <Text className="text-brand font-bold text-xl">My children</Text>
        <Box className="w-8" />
      </HStack>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-white font-bold text-2xl mb-6">Add Child</Text>

          {/* Name fields */}
          <PillInput
            placeholder="First name"
            value={firstName}
            onChange={setFirstName}
            valid={firstNameValid}
          />
          <PillInput
            placeholder="Last name"
            value={lastName}
            onChange={setLastName}
            valid={lastNameValid}
          />
          <PillInput
            placeholder="Preferred name"
            value={preferredName}
            onChange={setPreferredName}
            valid={preferredNameValid}
          />

          {/* Photo uploads */}
          <HStack className="mt-2 mb-6 justify-between" space="sm">
            <PhotoCircle
              label="Front Picture"
              uri={frontUri}
              onPick={() => pickPhoto(setFrontUri)}
            />
            <PhotoCircle
              label="Left Side"
              uri={leftUri}
              onPick={() => pickPhoto(setLeftUri)}
            />
            <PhotoCircle
              label="Right Side"
              uri={rightUri}
              onPick={() => pickPhoto(setRightUri)}
            />
          </HStack>

          {/* Birthday */}
          <TouchableOpacity
            onPress={() => {
              /* TODO: date picker */
            }}
          >
            <Box className="border border-brand/50 bg-background-900 rounded-full h-14 items-center justify-center mb-4 flex-row px-5">
              <Calendar size={16} color="#7A726E" />
              <Text className="text-typography-500 text-base ml-2">
                {birthday || "Add Birthday"}
              </Text>
            </Box>
          </TouchableOpacity>

          {/* School */}
          <Text className="text-white text-sm mb-2">
            Please add the child's school
          </Text>
          <Box className="border border-brand/50 rounded-full h-14 px-4 mb-5 flex-row items-center">
            <Input className="flex-1 bg-transparent border-0 h-full">
              <InputField
                placeholder="School"
                placeholderTextColor="#7A726E"
                className="text-white text-base"
                value={school}
                onChangeText={setSchool}
              />
            </Input>
          </Box>

          {/* Secondary actions */}
          <ActionButton
            label="Customize schedule"
            onPress={() => router.push("/(children)/schedule")}
          />
          <ActionButton label="Add Disabilities" />
          <ActionButton label="Add Health Concerns" />

          <Box className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit button */}
      <Box className="px-5 pb-6 pt-2">
        <Button
          className={`h-14 rounded-full ${canSubmit ? "bg-brand" : "bg-outline-600"}`}
          isDisabled={!canSubmit || loading}
          onPress={handleSubmit}
        >
          {loading ? (
            <Spinner className="text-white" />
          ) : (
            <ButtonText className="text-white font-bold text-base">
              Add a child
            </ButtonText>
          )}
        </Button>
      </Box>
    </SafeAreaView>
  );
}
