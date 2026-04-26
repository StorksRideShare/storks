import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ChevronLeft, AlertTriangle, ShieldCheck, Info, Car } from 'lucide-react-native';
import { useApiClient } from '@/middleware/apiClient';

export default function EmergencyDemoScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const api = useApiClient("safety-and-verification");

  const sendEvent = (eventType: string) => {
    setIsLoading(true);
    setStatusMsg(null);
    
    const payload = {
      user_id: "b5bbdba0-7c71-4a0a-b1e7-8691e5b08e01",
      ride_id: "f8820855-3a0e-4734-bdd9-8b3d5b938c1e",
      group_id: "e7303649-db50-4091-98c4-3e30266366f7",
      event_type: eventType
    };

    api.post("/emergency/new", payload)
      .then((response: any) => {
        setStatusMsg({ text: response.message || `Event ${eventType} Broadcasted Successfully`, type: 'success' });
      })
      .catch((error: any) => {
        let msg = error.message;
        try {
           const jsonStr = msg.replace(/^API Error \d+: /, '');
           const parsed = JSON.parse(jsonStr);
           if (parsed.error) msg = parsed.error;
        } catch(e) {}
        console.error('Error sending event:', msg);
        setStatusMsg({ text: msg || `Failed to send ${eventType}`, type: 'error' });
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
        <Text style={{ color: '#F97316', fontSize: 20, fontWeight: 'bold', marginLeft: 8 }}>Emergency Events Demo</Text>
      </View>

      <ScrollView style={{ padding: 16 }}>
        <View style={{ gap: 20, paddingBottom: 40 }}>
          <Text style={{ color: '#aaa', fontSize: 16, marginBottom: 8 }}>
            Trigger real-time safety events to test the system's broadcast capabilities.
          </Text>

          {statusMsg && (
            <View style={{ 
              backgroundColor: statusMsg.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)', 
              padding: 16, 
              borderRadius: 16, 
              borderWidth: 1, 
              borderColor: statusMsg.type === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 82, 82, 0.3)' 
            }}>
              <Text style={{ 
                color: statusMsg.type === 'success' ? '#4CAF50' : '#FF5252', 
                textAlign: 'center', 
                fontSize: 16, 
                fontWeight: 'bold' 
              }}>
                {statusMsg.text}
              </Text>
            </View>
          )}

          <Button 
            onPress={() => sendEvent("SOS")} 
            disabled={isLoading} 
            style={{ backgroundColor: '#DC2626', height: 64, borderRadius: 16, justifyContent: 'flex-start', paddingHorizontal: 20 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AlertTriangle color="white" size={24} />
              <ButtonText style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Trigger SOS Emergency</ButtonText>
            </View>
          </Button>

          <Button 
            onPress={() => sendEvent("Accident")} 
            disabled={isLoading} 
            style={{ backgroundColor: '#EA580C', height: 64, borderRadius: 16, justifyContent: 'flex-start', paddingHorizontal: 20 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Car color="white" size={24} />
              <ButtonText style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Report Accident</ButtonText>
            </View>
          </Button>

          <Button 
            onPress={() => sendEvent("CheckIn")} 
            disabled={isLoading} 
            style={{ backgroundColor: '#16A34A', height: 64, borderRadius: 16, justifyContent: 'flex-start', paddingHorizontal: 20 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ShieldCheck color="white" size={24} />
              <ButtonText style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Safe Check-In</ButtonText>
            </View>
          </Button>

          <Button 
            onPress={() => sendEvent("Other")} 
            disabled={isLoading} 
            style={{ backgroundColor: '#4B5563', height: 64, borderRadius: 16, justifyContent: 'flex-start', paddingHorizontal: 20 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Info color="white" size={24} />
              <ButtonText style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Other Event</ButtonText>
            </View>
          </Button>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
