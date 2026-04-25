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
import { PINInput } from "@/components/mobile/PINInput";
import { QRScanner } from "@/components/mobile/QRScanner";
import { useEffect } from "react";

export default function VerifyScreen() {
  const [activeTab, setActiveTab] = useState<"morning" | "afternoon">("morning");
  const [showScanner, setShowScanner] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  // Mock group for the driver's perspective (to trigger API calls without stores)
  const mockGroup = { id: "group-123", rideId: "ride-today" };

  const handleScan = async (data: string) => {
    setShowScanner(false);
    setVerificationStatus("Verifying...");
    setTimeout(() => {
      setVerificationStatus("Verified! ✅");
    }, 1000);
  };

  const handlePinComplete = async (enteredPin: string) => {
    setVerificationStatus("Verifying PIN...");
    // Mock success
    setTimeout(() => {
      setVerificationStatus("PIN Verified Successfully! ✅");
    }, 1000);
  };

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0E0E" }}>
      <HStack style={{ paddingHorizontal: 20, paddingVertical: 16, alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: "#F97316", fontWeight: "bold", fontSize: 20 }}>Verification</Text>
        <Box style={{ width: 28 }} />
      </HStack>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <VStack style={{ paddingTop: 16, gap: 16 }}>
          <HStack style={{ alignItems: "center", marginBottom: 24, gap: 16 }}>
            <Box style={{ backgroundColor: "rgba(249, 115, 22, 0.1)", padding: 12, borderRadius: 16 }}>
              <ShieldCheck size={32} color="#F97316" />
            </Box>
            <VStack>
              <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>Safety Hub</Text>
              <Text style={{ color: "#aaa", fontSize: 14 }}>Secure trip verification</Text>
            </VStack>
          </HStack>

          {/* Tab Switcher */}
          <HStack style={{ backgroundColor: "#1A1919", padding: 6, borderRadius: 16, marginBottom: 32 }}>
            <Pressable
              style={{ flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: activeTab === "morning" ? "#F97316" : "transparent" }}
              onPress={() => setActiveTab("morning")}
            >
              <Text style={{ fontWeight: "bold", color: activeTab === "morning" ? "white" : "#aaa" }}>
                Morning Pickup
              </Text>
            </Pressable>
            <Pressable
              style={{ flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: activeTab === "afternoon" ? "#F97316" : "transparent" }}
              onPress={() => setActiveTab("afternoon")}
            >
              <Text style={{ fontWeight: "bold", color: activeTab === "afternoon" ? "white" : "#aaa" }}>
                Afternoon Drop
              </Text>
            </Pressable>
          </HStack>

          {verificationStatus && (
            <Box style={{ backgroundColor: "rgba(249, 115, 22, 0.1)", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "rgba(249, 115, 22, 0.2)", marginBottom: 24 }}>
              <HStack style={{ alignItems: "center", gap: 12 }}>
                <Info size={20} color="#F97316" />
                <Text style={{ color: "#F97316", fontWeight: "500", fontSize: 16 }}>{verificationStatus}</Text>
              </HStack>
            </Box>
          )}

          {/* Components Display */}
          <VStack style={{ gap: 24 }} key={activeTab}>
            <VStack style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: "#aaa", textTransform: "uppercase", paddingHorizontal: 8, marginBottom: 8 }}>Action Mode</Text>
              <Box style={{ padding: 24, backgroundColor: "#1A1919", borderRadius: 32, borderWidth: 1, borderColor: "#333" }}>
                <VStack style={{ gap: 16 }}>
                  {activeTab === "morning" ? (
                    <Button 
                      size="lg" 
                      style={{ height: 64, borderRadius: 32, backgroundColor: "#F97316" }} 
                      onPress={() => setShowScanner(true)}
                    >
                      <HStack style={{ alignItems: "center", gap: 8 }}>
                        <Scan color="white" size={20} />
                        <ButtonText style={{ color: "white", fontWeight: "bold", fontSize: 18, textTransform: "uppercase" }}>Scan Parent QR</ButtonText>
                      </HStack>
                    </Button>
                  ) : (
                    <>
                      <PINInput onComplete={handlePinComplete} key={`${activeTab}-input`} />
                      <Text style={{ color: "#aaa", fontSize: 12, textAlign: "center", marginTop: 12 }}>Enter Parent PIN</Text>
                    </>
                  )}
                </VStack>
              </Box>
            </VStack>
          </VStack>

          <Box style={{ padding: 24, backgroundColor: "rgba(255, 82, 82, 0.1)", borderWidth: 1, borderColor: "rgba(255, 82, 82, 0.2)", borderRadius: 28, marginTop: 32, marginBottom: 40 }}>
            <HStack style={{ alignItems: "center", marginBottom: 8, gap: 8 }}>
              <Info size={18} color="#FF5252" />
              <Text style={{ fontWeight: "bold", color: "#FF5252", fontSize: 18 }}>Verification Safety</Text>
            </HStack>
            <Text style={{ fontSize: 14, color: "#aaa", lineHeight: 24 }}>
              Please ensure you verify the ride using the PIN or QR code provided. This ensures child safety and trip accuracy.
            </Text>
          </Box>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
