import React, { useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { PINShowcase } from '@/components/mobile/PINShowcase';
import { QRShowcase } from '@/components/mobile/QRShowcase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useApiClient } from '@/middleware/apiClient';
import { useDemo } from '@/context/DemoContext';

export default function VerificationDemoScreen() {
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon">("morning");
  const [showPin, setShowPin] = useState(false);
  const [showQr, setShowQr] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [qrPayload, setQrPayload] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { verificationContext, isLoading: isContextLoading } = useDemo();
  const api = useApiClient("safety-and-verification");

  const requestPin = () => {
    if (!verificationContext) {
      setErrorMsg("No active ride context found for demo.");
      return;
    }

    const payload: any = {
      group_id: verificationContext.groupId,
    };
    if (timeOfDay === "morning") {
      payload.ride_id = verificationContext.rideId;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setShowQr(false);
    setShowPin(false);
    
    api.post(`/otp/request?type=${timeOfDay}`, payload)
      .then((response: any) => {
        setPin(response.pin);
        setShowPin(true);
      })
      .catch((error: any) => {
        let msg = error.message;
        try {
           const jsonStr = msg.replace(/^API Error \d+: /, '');
           const parsed = JSON.parse(jsonStr);
           if (parsed.error) msg = parsed.error;
        } catch(e) {}
        console.error('Error requesting PIN verification:', msg);
        setErrorMsg(msg || "Failed to request PIN");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const requestQr = () => {
    if (!verificationContext) {
      setErrorMsg("No active ride context found for demo.");
      return;
    }

    const payload: any = {
      group_id: verificationContext.groupId,
    };
    if (timeOfDay === "morning") {
      payload.ride_id = verificationContext.rideId;
    } else {
      payload.child_id = verificationContext.childId;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setShowPin(false);
    setShowQr(false);

    api.post(`/qr/request?type=${timeOfDay}`, payload)
      .then((response: any) => {
        setQrPayload(JSON.stringify(response.qr_payload));
        setShowQr(true);
      })
      .catch((error: any) => {
        let msg = error.message;
        try {
           const jsonStr = msg.replace(/^API Error \d+: /, '');
           const parsed = JSON.parse(jsonStr);
           if (parsed.error) msg = parsed.error;
        } catch(e) {}
        console.error('Error requesting QR code:', msg);
        setErrorMsg(msg || "Failed to request QR");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
          
          {/* Tab Switcher */}
          <View style={{ flexDirection: 'row', backgroundColor: '#1A1919', padding: 6, borderRadius: 16, marginBottom: 8 }}>
            <Pressable
              style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: timeOfDay === "morning" ? '#F97316' : 'transparent' }}
              onPress={() => { setTimeOfDay("morning"); setShowPin(false); setShowQr(false); setErrorMsg(null); }}
            >
              <Text style={{ fontWeight: 'bold', color: timeOfDay === "morning" ? 'white' : '#aaa' }}>
                Morning Pickup
              </Text>
            </Pressable>
            <Pressable
              style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: timeOfDay === "afternoon" ? '#F97316' : 'transparent' }}
              onPress={() => { setTimeOfDay("afternoon"); setShowPin(false); setShowQr(false); setErrorMsg(null); }}
            >
              <Text style={{ fontWeight: 'bold', color: timeOfDay === "afternoon" ? 'white' : '#aaa' }}>
                Afternoon Drop
              </Text>
            </Pressable>
          </View>

          {errorMsg && (
            <View style={{ backgroundColor: 'rgba(255, 82, 82, 0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 82, 82, 0.2)' }}>
              <Text style={{ color: '#FF5252', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>{errorMsg}</Text>
            </View>
          )}

          {isContextLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#F97316" />
              <Text style={{ color: '#aaa', marginTop: 12 }}>Loading demo context...</Text>
            </View>
          ) : (
            <>
              <Button onPress={requestPin} disabled={isLoading} className="bg-[#F97316] h-14 rounded-full">
                <ButtonText className="text-white font-bold text-lg">
                  {isLoading && !showQr ? "Requesting..." : "Request PIN Verification"}
                </ButtonText>
              </Button>
              {showPin && pin ? (
                <View className="bg-[#1A1919] p-4 rounded-3xl border border-[#333]">
                  <PINShowcase pin={pin} title={`Requested ${timeOfDay === 'morning' ? 'Morning' : 'Afternoon'} PIN`} description="Give this PIN to the driver" />
                </View>
              ) : null}

              <Button onPress={requestQr} disabled={isLoading} className="bg-[#F97316] h-14 rounded-full">
                <ButtonText className="text-white font-bold text-lg">
                  {isLoading && !showPin ? "Requesting..." : "Request QR Code"}
                </ButtonText>
              </Button>
              {showQr && qrPayload ? (
                <View className="bg-[#1A1919] p-4 rounded-3xl border border-[#333]">
                  <QRShowcase payload={qrPayload} title={`Requested ${timeOfDay === 'morning' ? 'Morning' : 'Afternoon'} QR`} description="Show this QR to the driver" />
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
