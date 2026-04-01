import React, { useState, useEffect } from "react";
import { Switch, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Spinner } from "@/components/ui/spinner";
import { Collapsible } from "@/components/ui/collapsible";

// useApiClient replaces axios — auto-injects Clerk JWT, logs, handles errors
import { useApiClient } from "@/middleware/apiClient";

interface PrivacySettings {
  shareLocationOnlyActiveRide: boolean;
  maskFullAddress: boolean;
  allowSilentPresence: boolean;
  allowAudioStream: boolean;
}

const DEFAULTS: PrivacySettings = {
  shareLocationOnlyActiveRide: true,
  maskFullAddress: true,
  allowSilentPresence: false,
  allowAudioStream: false,
};

export default function PrivacySettingsScreen() {
  const api = useApiClient(); // token injected automatically from active Clerk session

  const [settings, setSettings] = useState<PrivacySettings>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const apiClient = useApiClient("booking-and-payment");

  // --- Load Settings ---
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<PrivacySettings>("/api/privacy/settings");
      setSettings({
        shareLocationOnlyActiveRide:
          data.shareLocationOnlyActiveRide ??
          DEFAULTS.shareLocationOnlyActiveRide,
        maskFullAddress: data.maskFullAddress ?? DEFAULTS.maskFullAddress,
        allowSilentPresence:
          data.allowSilentPresence ?? DEFAULTS.allowSilentPresence,
        allowAudioStream: data.allowAudioStream ?? DEFAULTS.allowAudioStream,
      });
    } catch {
      Alert.alert("Error", "Failed to load privacy settings. Using defaults.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.post("/api/privacy/settings", payload);

      Alert.alert(
        "Success",
        "Your privacy settings have been saved successfully!",
        [{ text: "OK" }],
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
      Alert.alert(
        "Error",
        "Failed to save privacy settings. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const update = (key: keyof PrivacySettings) => (value: boolean) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  // ── Setting row ────────────────────────────────────────────────
  const SettingRow = ({
    label,
    description,
    value,
    onValueChange,
  }: {
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
  }) => (
    <HStack style={styles.settingRow}>
      <VStack style={styles.labelContainer}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description && (
          <Text style={styles.rowDescription}>{description}</Text>
        )}
      </VStack>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={isLoading || isSaving}
        trackColor={{ false: "#3E3834", true: "#E66B00" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#3E3834"
      />
    </HStack>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <VStack style={styles.loadingContainer}>
          <Spinner size="large" color="#E66B00" />
          <Text style={styles.loadingText}>Loading settings…</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Privacy Settings</Text>
        <Text style={styles.description}>
          Control what information is shared and how your data is handled during
          rides.
        </Text>

        <Collapsible title="Location Sharing">
          <SettingRow
            label="Share live location only during active ride"
            description="Your location is shared only when you're on an active ride"
            value={settings.shareLocationOnlyActiveRide}
            onValueChange={update("shareLocationOnlyActiveRide")}
          />
        </Collapsible>

        <Collapsible title="Data Masking">
          <SettingRow
            label="Mask full address"
            description="Show only neighbourhood to drivers, not your exact address"
            value={settings.maskFullAddress}
            onValueChange={update("maskFullAddress")}
          />
        </Collapsible>

        <Collapsible title="Monitoring Requests">
          <SettingRow
            label="Allow silent presence requests"
            description="Allow photo verification requests during rides"
            value={settings.allowSilentPresence}
            onValueChange={update("allowSilentPresence")}
          />
          <SettingRow
            label="Allow audio stream requests"
            description="Allow audio monitoring requests during rides"
            value={settings.allowAudioStream}
            onValueChange={update("allowAudioStream")}
          />
        </Collapsible>

        <VStack style={styles.footer}>
          <Button
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            isDisabled={isSaving}
          >
            {isSaving ? (
              <ButtonSpinner color="#FFFFFF" />
            ) : (
              <ButtonText style={styles.saveButtonText}>
                Save All Changes
              </ButtonText>
            )}
          </Button>

          <Button variant="link" onPress={loadSettings} isDisabled={isSaving}>
            <ButtonText style={styles.resetText}>Reset to Saved</ButtonText>
          </Button>
        </VStack>

        <Text style={styles.footerNote}>
          Changes are applied immediately after saving
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#171412" },
  scrollContent: { padding: 24 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    fontFamily: "Syne_400Regular",
    marginTop: 12,
    fontSize: 16,
    color: "#7A726E",
  },
  header: {
    fontFamily: "Syne_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  description: {
    fontFamily: "Syne_400Regular",
    fontSize: 14,
    color: "#7A726E",
    marginBottom: 24,
    lineHeight: 20,
  },
  settingRow: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.1)",
  },
  labelContainer: { flex: 1, marginRight: 16 },
  rowLabel: { fontFamily: "Syne_600SemiBold", fontSize: 15, color: "#FFFFFF" },
  rowDescription: {
    fontFamily: "Syne_400Regular",
    fontSize: 13,
    color: "#7A726E",
    marginTop: 2,
  },
  footer: { marginTop: 40, alignItems: "center", gap: 16 },
  saveButton: {
    height: 56,
    backgroundColor: "#E66B00",
    borderRadius: 28,
    paddingHorizontal: 32,
  },
  saveButtonText: {
    fontFamily: "Syne_700Bold",
    color: "#FFFFFF",
    fontSize: 16,
  },
  disabledButton: { opacity: 0.5 },
  resetText: { fontFamily: "Syne_400Regular", color: "#7A726E", fontSize: 14 },
  footerNote: {
    fontFamily: "Syne_400Regular",
    marginTop: 24,
    textAlign: "center",
    fontSize: 12,
    color: "#3E3834",
    paddingBottom: 20,
  },
});
