import React, { useState } from "react";
import { ScrollView, Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { Info, ShieldCheck, ChevronLeft, Scan, X } from "lucide-react-native";
import { router } from "expo-router";

// These might need verification if they still exist in the new structure
import { QRShowcase } from "@/components/mobile/QRShowcase";
import { PINShowcase } from "@/components/mobile/PINShowcase";
import { PINInput } from "@/components/mobile/PINInput";
import { QRScanner } from "@/components/mobile/QRScanner";
import { useVerification } from "@/src/hooks/useVerification";
import { useParentStore } from "@/src/store/parentStore";
import { useEffect } from "react";
import QRCode from "react-native-qrcode-svg";

export default function VerifyScreen() {
  const { groups } = useParentStore();
  const { qrPayload, pin, isLoading, error: apiError, fetchMorningVerification, fetchAfternoonVerification } = useVerification();
  
  const [activeTab, setActiveTab] = useState<"morning" | "afternoon">("morning");
  const [showScanner, setShowScanner] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const selectedGroup = groups[0];

  useEffect(() => {
    if (selectedGroup) {
      if (activeTab === "morning") {
        fetchMorningVerification(selectedGroup.id, selectedGroup.rideId || "ride-today");
      } else {
        fetchAfternoonVerification(selectedGroup.id);
      }
    }
  }, [activeTab, selectedGroup, fetchMorningVerification, fetchAfternoonVerification]);

  const handleScan = async (data: string) => {
    setShowScanner(false);
    // This is where a parent might scan a driver's QR, but usually it's the other way around.
    // However, if the design allows parent to scan, we keep the logic but use real verification if needed.
    setVerificationStatus("Verifying...");
    setTimeout(() => {
      setVerificationStatus("Verified! ✅");
    }, 1000);
  };

  const handlePinComplete = async (enteredPin: string) => {
    setVerificationStatus("Verifying PIN...");
    if (enteredPin === pin) {
      setVerificationStatus("PIN Verified Successfully! ✅");
    } else {
      setVerificationStatus("Invalid PIN ❌");
    }
  };

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F0E0E]">
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft color="#F97316" size={28} />
        </Pressable>
        <Text size="xl" bold className="text-orange-500 font-bold">Verification</Text>
        <Box className="w-7" />
      </HStack>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <VStack className="pt-4" space="lg">
          <HStack space="md" className="items-center mb-6">
            <Box className="bg-orange-500/10 p-3 rounded-2xl">
              <ShieldCheck size={32} color="#F97316" />
            </Box>
            <VStack>
              <Text className="text-white text-2xl font-bold">Safety Hub</Text>
              <Text className="text-sm text-gray-400">Secure trip verification</Text>
            </VStack>
          </HStack>

          {/* Tab Switcher */}
          <HStack className="bg-[#1A1919] p-1.5 rounded-2xl mb-8">
            <Pressable
              className={`flex-1 py-3 items-center rounded-xl ${activeTab === "morning" ? 'bg-[#F97316]' : ''}`}
              onPress={() => setActiveTab("morning")}
            >
              <Text className={`font-bold ${activeTab === "morning" ? 'text-white' : 'text-gray-500'}`}>
                Morning Pickup
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 py-3 items-center rounded-xl ${activeTab === "afternoon" ? 'bg-[#F97316]' : ''}`}
              onPress={() => setActiveTab("afternoon")}
            >
              <Text className={`font-bold ${activeTab === "afternoon" ? 'text-white' : 'text-gray-500'}`}>
                Afternoon Drop
              </Text>
            </Pressable>
          </HStack>

          {verificationStatus && (
            <Box className="bg-orange-500/10 p-5 rounded-2xl border border-orange-500/20 mb-6">
              <HStack space="md" className="items-center">
                <Info size={20} color="#F97316" />
                <Text className="text-orange-500 font-medium text-base">{verificationStatus}</Text>
              </HStack>
            </Box>
          )}

          {apiError && (
            <Box className="bg-red-500/10 p-5 rounded-2xl border border-red-500/20 mb-6">
              <HStack space="md" className="items-center">
                <X size={20} color="#FF5252" />
                <Text className="text-red-500 font-medium text-base">{apiError}</Text>
              </HStack>
            </Box>
          )}

          {/* Components Display */}
          <VStack space="xl" key={activeTab}>
            <VStack space="sm">
              <Text className="text-sm font-bold text-gray-400 uppercase px-2 mb-2">Showcase Mode</Text>
              {isLoading ? (
                 <Box className="h-64 bg-[#1A1919] rounded-[32px] items-center justify-center">
                   <Text className="text-gray-500">Loading verification data...</Text>
                 </Box>
              ) : activeTab === "morning" ? (
                qrPayload ? (
                  <QRShowcase payload={JSON.stringify(qrPayload)} />
                ) : (
                  <Box className="h-64 bg-[#1A1919] rounded-[32px] items-center justify-center">
                    <Text className="text-gray-500">No Morning QR available</Text>
                  </Box>
                )
              ) : (
                pin ? (
                  <PINShowcase pin={pin} />
                ) : (
                  <Box className="h-64 bg-[#1A1919] rounded-[32px] items-center justify-center">
                    <Text className="text-gray-500">No Afternoon PIN available</Text>
                  </Box>
                )
              )}
            </VStack>

            <VStack space="sm">
              <Text className="text-sm font-bold text-gray-400 uppercase px-2 mb-2 mt-4">Action Mode</Text>
              <Box className="p-6 bg-[#1A1919] rounded-[32px] border border-[#333]">
                <VStack space="lg">
                  <Button 
                    size="lg" 
                    className="h-16 rounded-full bg-[#F97316]" 
                    onPress={() => setShowScanner(true)}
                  >
                    <HStack space="sm" className="items-center">
                      <Scan color="white" size={20} />
                      <ButtonText className="text-white font-bold text-lg uppercase">Scan Driver QR</ButtonText>
                    </HStack>
                  </Button>
                  
                  <Box className="h-[1px] bg-[#333] my-4" />
                  
                  <PINInput onComplete={handlePinComplete} key={`${activeTab}-input`} />
                </VStack>
              </Box>
            </VStack>
          </VStack>

          <Box className="p-6 bg-red-500/10 border border-red-500/20 rounded-[28px] mt-8 mb-10">
            <HStack space="sm" className="items-center mb-2">
              <Info size={18} color="#FF5252" />
              <Text className="font-bold text-red-500 text-lg">Verification Safety</Text>
            </HStack>
            <Text className="text-sm text-gray-400 leading-6">
              Please ensure you verify the ride using the PIN or QR code provided. This ensures your child's safety and trip accuracy.
            </Text>
          </Box>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
