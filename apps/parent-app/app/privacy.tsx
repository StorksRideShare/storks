import React, { useState, useEffect } from 'react';
import { View, Switch, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Collapsible } from '@/components/ui/collapsible';
import { useApiClient } from '../middleware/apiClient';

// You can replace this with your actual auth hook
// import { useAuth } from '@/hooks/useAuth';

interface PrivacySettings {
  shareLocationOnlyActiveRide: boolean;
  maskFullAddress: boolean;
  allowSilentPresence: boolean;
  allowAudioStream: boolean;
}

export default function PrivacySettingsScreen() {
  // --- State Management ---
  const [shareLocationOnlyActive, setShareLocationOnlyActive] = useState(true);
  const [maskFullAddress, setMaskFullAddress] = useState(true);
  const [allowSilentPresence, setAllowSilentPresence] = useState(false);
  const [allowAudioStream, setAllowAudioStream] = useState(false);
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
      const settings = await apiClient.get<Partial<PrivacySettings>>('/api/privacy/settings');

      setShareLocationOnlyActive(settings.shareLocationOnlyActiveRide ?? true);
      setMaskFullAddress(settings.maskFullAddress ?? true);
      setAllowSilentPresence(settings.allowSilentPresence ?? false);
      setAllowAudioStream(settings.allowAudioStream ?? false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert(
        'Error',
        'Failed to load privacy settings. Using default values.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Save Settings ---
  const handleSave = async () => {
    const payload: PrivacySettings = {
      shareLocationOnlyActiveRide: shareLocationOnlyActive,
      maskFullAddress: maskFullAddress,
      allowSilentPresence: allowSilentPresence,
      allowAudioStream: allowAudioStream,
    };

    try {
      setIsSaving(true);
      await apiClient.post('/api/privacy/settings', payload);

      Alert.alert(
        'Success',
        'Your privacy settings have been saved successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert(
        'Error',
        'Failed to save privacy settings. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- Helper Component for Setting Rows ---
  const SettingRow = ({
    label,
    value,
    onValueChange,
    disabled = false,
    description
  }: {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    description?: string;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.rowLabel}>{label}</ThemedText>
        {description && (
          <ThemedText style={styles.rowDescription}>{description}</ThemedText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || isLoading}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#81b0ff" />
        <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.header}>
          Privacy Settings
        </ThemedText>

        <ThemedText type="subtitle" style={styles.description}>
          Control what information is shared and how your data is handled during rides.
        </ThemedText>

        {/* Location Section */}
        <Collapsible title="Location Sharing">
          <SettingRow
            label="Share live location only during active ride"
            description="Your location will only be shared when you're on an active ride"
            value={shareLocationOnlyActive}
            onValueChange={setShareLocationOnlyActive}
          />
        </Collapsible>

        {/* Data Masking Section */}
        <Collapsible title="Data Masking">
          <SettingRow
            label="Mask full address"
            description="Show only neighborhood to drivers, not your exact address"
            value={maskFullAddress}
            onValueChange={setMaskFullAddress}
          />
        </Collapsible>

        {/* Monitoring Section */}
        <Collapsible title="Monitoring Requests">
          <SettingRow
            label="Allow silent presence requests"
            description="Allow requests for photo verification during rides"
            value={allowSilentPresence}
            onValueChange={setAllowSilentPresence}
          />
          <SettingRow
            label="Allow audio stream requests"
            description="Allow requests for audio monitoring during rides"
            value={allowAudioStream}
            onValueChange={setAllowAudioStream}
          />
        </Collapsible>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <ThemedText
            type="link"
            onPress={handleSave}
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </ThemedText>

          <ThemedText
            type="link"
            onPress={loadSettings}
            style={styles.resetButton}
            disabled={isSaving}
          >
            Reset to Saved
          </ThemedText>
        </View>

        {/* Last Updated Info */}
        <ThemedText style={styles.footerNote}>
          Changes are applied immediately after saving
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    opacity: 0.7,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowDescription: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 16,
  },
  saveButton: {
    fontSize: 18,
    fontWeight: '600',
    color: '#81b0ff',
  },
  resetButton: {
    fontSize: 14,
    opacity: 0.6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  footerNote: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.4,
    paddingBottom: 20,
  },
});