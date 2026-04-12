import React, { useState, useEffect } from "react";
import { Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "react-native";
import { Spinner } from "@/components/ui/spinner";
import { Collapsible } from "@/components/ui/collapsible";
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
  const api = useApiClient("user-service");
  const apiClient = useApiClient("booking-and-payment");

  const [settings, setSettings] = useState<PrivacySettings>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<PrivacySettings>("/privacy/settings");
      setSettings({
        shareLocationOnlyActiveRide: data.shareLocationOnlyActiveRide ?? DEFAULTS.shareLocationOnlyActiveRide,
        maskFullAddress: data.maskFullAddress ?? DEFAULTS.maskFullAddress,
        allowSilentPresence: data.allowSilentPresence ?? DEFAULTS.allowSilentPresence,
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
      await api.patch("/privacy/settings", settings);
      Alert.alert("Success", "Your privacy settings have been saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      Alert.alert("Error", "Failed to save privacy settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const update = (key: keyof PrivacySettings) => (value: boolean) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

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
    <HStack className="justify-between items-center py-3 border-b border-outline-800/10">
      <VStack className="flex-1 mr-4">
        <Text className="text-white font-semibold text-base">{label}</Text>
        {description && (
          <Text className="text-typography-500 text-xs mt-0.5">{description}</Text>
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
      <SafeAreaView className="flex-1 bg-background-950 items-center justify-center">
        <VStack className="items-center" space="md">
          <Spinner size="large" />
          <Text className="text-typography-500 text-base">Loading settings…</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-950">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-white font-bold text-2xl mt-6 mb-2">Privacy Settings</Text>
        <Text className="text-typography-500 text-sm mb-8 leading-5">
          Control what information is shared and how your data is handled during rides.
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

        <VStack className="mt-10 items-center" space="lg">
          <Button
            className={`h-14 bg-brand rounded-full px-8 ${isSaving ? "opacity-50" : ""}`}
            onPress={handleSave}
            isDisabled={isSaving}
          >
            {isSaving ? <ButtonSpinner /> : <ButtonText className="text-white font-bold text-base">Save All Changes</ButtonText>}
          </Button>

          <Button variant="link" onPress={loadSettings} isDisabled={isSaving}>
            <ButtonText className="text-typography-500 text-sm">Reset to Saved</ButtonText>
          </Button>
        </VStack>

        <Text className="text-typography-600 text-[10px] text-center mt-6 mb-10">
          Changes are applied immediately after saving
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
