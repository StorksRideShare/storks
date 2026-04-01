import React, { useState, useEffect } from 'react';
import { View, Switch, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';

// ✅ Correct relative imports (this will remove all red/yellow underlines)
import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { Collapsible } from '../components/ui/collapsible';
import axios from 'axios';

interface PrivacySettings {
  shareLocationOnlyActiveRide: boolean;
  maskFullAddress: boolean;
  allowSilentPresence: boolean;
  allowAudioStream: boolean;
}

export default function PrivacySettingsScreen() {
  const [shareLocationOnlyActive, setShareLocationOnlyActive] = useState(true);
  const [maskFullAddress, setMaskFullAddress] = useState(true);
  const [allowSilentPresence, setAllowSilentPresence] = useState(false);
  const [allowAudioStream, setAllowAudioStream] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // TODO: Replace this with real auth token later
  const token = "YOUR_JWT_TOKEN_HERE";

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8081/api/privacy/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const settings = response.data;
      setShareLocationOnlyActive(settings.shareLocationOnlyActiveRide ?? true);
      setMaskFullAddress(settings.maskFullAddress ?? true);
      setAllowSilentPresence(settings.allowSilentPresence ?? false);
      setAllowAudioStream(settings.allowAudioStream ?? false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert('Error', 'Failed to load privacy settings. Using defaults.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const payload: PrivacySettings = {
      shareLocationOnlyActiveRide: shareLocationOnlyActive,
      maskFullAddress: maskFullAddress,
      allowSilentPresence: allowSilentPresence,
      allowAudioStream: allowAudioStream,
    };

    try {
      setIsSaving(true);
      await axios.post('http://localhost:8081/api/privacy/settings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Privacy settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
        {description && <ThemedText style={styles.rowDescription}>{description}</ThemedText>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || isLoading}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
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
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title" style={styles.header}>Privacy Settings</ThemedText>
        <ThemedText type="subtitle" style={styles.description}>
          Control what information is shared during rides.
        </ThemedText>

        <Collapsible title="Location Sharing">
          <SettingRow 
            label="Share live location only during active ride" 
            description="Your location will only be shared when on an active ride"
            value={shareLocationOnlyActive} 
            onValueChange={setShareLocationOnlyActive} 
          />
        </Collapsible>

        <Collapsible title="Data Masking">
          <SettingRow 
            label="Mask full address" 
            description="Show only neighborhood to drivers"
            value={maskFullAddress} 
            onValueChange={setMaskFullAddress} 
          />
        </Collapsible>

        <Collapsible title="Monitoring Requests">
          <SettingRow 
            label="Allow silent presence requests" 
            value={allowSilentPresence} 
            onValueChange={setAllowSilentPresence} 
          />
          <SettingRow 
            label="Allow audio stream requests" 
            value={allowAudioStream} 
            onValueChange={setAllowAudioStream} 
          />
        </Collapsible>

        <View style={styles.footer}>
          <ThemedText type="link" onPress={handleSave} style={styles.saveButton}>
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  header: { marginBottom: 8 },
  description: { marginBottom: 24, opacity: 0.7 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  labelContainer: { flex: 1, marginRight: 16 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowDescription: { fontSize: 13, opacity: 0.6, marginTop: 2 },
  footer: { marginTop: 40, alignItems: 'center' },
  saveButton: { fontSize: 18, fontWeight: '600', color: '#81b0ff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, opacity: 0.7 },
});