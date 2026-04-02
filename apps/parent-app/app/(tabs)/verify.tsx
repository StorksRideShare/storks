import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { QRShowcase } from "@/components/mobile/QRShowcase";
import { PINShowcase } from "@/components/mobile/PINShowcase";
import { PINInput } from "@/components/mobile/PINInput";
import { QRScanner } from "@/components/mobile/QRScanner";
import { Card } from "@/components/ui/card";
import { useApiClient } from "@/middleware/apiClient";
import { Info, ShieldCheck } from "lucide-react-native";

export default function VerifyScreen() {
  const [activeTab, setActiveTab] = useState<"morning" | "afternoon">("morning");
  const [showScanner, setShowScanner] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const apiClient = useApiClient(true); // Use verification service

  // Mock data for testing
  const mockMorningQR = JSON.stringify({
    type: "morning",
    ride_id: "ride-123",
    group_id: "group-456",
    expires_at: Math.floor(Date.now() / 1000) + 300,
    hash: "mock-hash"
  });

  const mockAfternoonPIN = "123456";

  const handleScan = async (data: string) => {
    setShowScanner(false);
    try {
      const payload = JSON.parse(data);
      setVerificationStatus("Verifying QR...");
      // Simulating API verification delay
      setTimeout(() => {
        setVerificationStatus(`QR [${payload.type}] Verified Successfully! ✅`);
      }, 1000);
    } catch (error) {
      setVerificationStatus("Invalid QR Code ❌");
    }
  };

  const handlePinComplete = async (pin: string) => {
    try {
      setVerificationStatus("Verifying PIN...");
      // Simulating API verification delay
      setTimeout(() => {
        setVerificationStatus(`PIN [${pin}] Verified Successfully! ✅`);
      }, 1000);
    } catch (error) {
      setVerificationStatus("Invalid PIN ❌");
    }
  };

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <ScrollView className="flex-1 bg-background-0">
      <VStack className="p-4 pt-12" space="lg">
        <HStack space="md" className="items-center mb-4">
          <ShieldCheck size={32} color="#f97316" />
          <VStack>
            <Text className="text-2xl font-bold">Safety Hub</Text>
            <Text className="text-sm text-typography-500">Verification Components Test</Text>
          </VStack>
        </HStack>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "morning" && styles.activeTab]}
            onPress={() => setActiveTab("morning")}
          >
            <Text style={[styles.tabText, activeTab === "morning" && styles.activeTabText]}>
              Morning (Pickup)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "afternoon" && styles.activeTab]}
            onPress={() => setActiveTab("afternoon")}
          >
            <Text style={[styles.tabText, activeTab === "afternoon" && styles.activeTabText]}>
              Afternoon (Drop)
            </Text>
          </TouchableOpacity>
        </View>

        {verificationStatus && (
          <Card className="m-4 p-4 bg-orange-50 border-orange-100">
            <HStack space="md" className="items-center">
              <Info size={20} color="#f97316" />
              <Text className="text-orange-800 font-medium">{verificationStatus}</Text>
            </HStack>
          </Card>
        )}

        {/* Components Display */}
        <VStack space="xl" key={activeTab}>
          <VStack space="sm">
            <Text className="text-sm font-semibold text-typography-500 uppercase px-6">Showcase Mode</Text>
            {activeTab === "morning" ? (
              <QRShowcase payload={mockMorningQR} />
            ) : (
              <PINShowcase pin={mockAfternoonPIN} />
            )}
          </VStack>

          <VStack space="sm">
            <Text className="text-sm font-semibold text-typography-500 uppercase px-6">Action Mode</Text>
            <Card className="p-6 m-4 bg-background-50 rounded-2xl">
              <VStack space="lg">
                <Button 
                  size="lg" 
                  variant="outline" 
                  action="primary" 
                  onPress={() => setShowScanner(true)}
                  className="rounded-xl border-2 border-orange-500"
                >
                  <ButtonText className="text-orange-600">Scan Driver QR Code</ButtonText>
                </Button>
                
                <View className="h-[2px] bg-background-200 my-2" />
                
                <PINInput onComplete={handlePinComplete} key={`${activeTab}-input`} />
              </VStack>
            </Card>
          </VStack>
        </VStack>

        <Card className="m-4 p-4 bg-warning-50 border-warning-200 rounded-xl">
          <HStack space="sm" className="items-center mb-2">
            <Info size={18} color="#f59e0b" />
            <Text className="font-bold text-warning-800">Integration Note</Text>
          </HStack>
          <Text className="text-xs text-warning-700">
            These components should be used within the Ride details flow. See `verification_integration_guide.md` for details on how to implement the callback logic.
          </Text>
        </Card>
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F6F6F6", // Background-50
    padding: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8C8C8C", // Typography-500
  },
  activeTabText: {
    color: "#f97316", // Orange-600
  },
});
