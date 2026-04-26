import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { PINInput } from '@/components/mobile/PINInput';
import { QRScanner } from '@/components/mobile/QRScanner';

export default function DriverVerificationDemoScreen() {
  const [showPinInput, setShowPinInput] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [status, setStatus] = useState('');

  if (showScanner) {
    return <QRScanner onScan={(data) => { setShowScanner(false); setStatus('QR Scanned: ' + data); }} onClose={() => setShowScanner(false)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0E0E' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft color="#F97316" size={28} />
        </Pressable>
        <Text style={{ color: '#F97316', fontSize: 20, fontWeight: 'bold', marginLeft: 8 }}>Verification Demo</Text>
      </View>
      <ScrollView style={{ padding: 16 }}>
        <View style={{ gap: 24, paddingBottom: 40 }}>
          <Button onPress={() => { setShowPinInput(true); setStatus(''); }} style={{ backgroundColor: '#F97316', height: 56, borderRadius: 28 }}>
            <ButtonText style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Verify PIN</ButtonText>
          </Button>

          {showPinInput && (
            <View style={{ backgroundColor: '#1A1919', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#333' }}>
              <Text style={{ color: '#aaa', marginBottom: 16, textAlign: 'center' }}>Enter PIN from Parent</Text>
              <PINInput onComplete={(pin) => { setStatus('PIN Verified Successfully: ' + pin); setShowPinInput(false); }} />
            </View>
          )}

          <Button onPress={() => { setShowScanner(true); setStatus(''); }} style={{ backgroundColor: '#F97316', height: 56, borderRadius: 28 }}>
            <ButtonText style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Scan QR Code</ButtonText>
          </Button>

          {status ? (
            <View style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.2)' }}>
              <Text style={{ color: '#F97316', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>{status}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
