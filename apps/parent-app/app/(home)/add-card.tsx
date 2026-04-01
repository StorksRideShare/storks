import React, { useState } from "react";
import { ScrollView, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2 } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";

import { LoggedParentID } from "../../logged_parent";

const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP || (Platform.OS === "android" ? "10.0.2.2" : "localhost");
const API_BASE_URL = `http://${SERVER_IP}:8080`;

export default function AddCardScreen() {
  const { bookingId } = useLocalSearchParams() as any;
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const isFormValid = cardName.length > 0 && cardNumber.length >= 16 && expiry.length >= 4 && cvv.length >= 3;

  const handleSaveAndPay = async () => {
    if (!isFormValid || !bookingId) return;
    
    try {
      setIsProcessing(true);
      
      // Save card details securely to database
      const cardPayload = {
        cardNumber: cardNumber,
        cardHolderName: cardName
      };

      const cardResponse = await fetch(`${API_BASE_URL}/api/cards/parent/${LoggedParentID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardPayload)
      });
      
      if (!cardResponse.ok) {
        throw new Error("Failed to save card securely.");
      }

      // Confirm the booking
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/confirm-payment`, {
        method: "PUT"
      });

      if (response.ok) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action="success" variant="solid" className="bg-green-600 rounded-3xl p-6 mt-12 shadow-2xl">
               <HStack space="sm" className="items-center">
                  <CheckCircle2 color="white" size={24} />
                  <VStack>
                    <ToastTitle className="text-white font-bold text-xl">Payment Successful!</ToastTitle>
                    <Text className="text-white opacity-90">Card saved and booking confirmed.</Text>
                  </VStack>
                </HStack>
            </Toast>
          ),
        });

        setTimeout(() => {
          router.push("/(tabs)/events");
        }, 1500);
      } else {
        throw new Error("Failed to process payment");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0E0E]">
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft color="#F97316" size={28} />
        </Pressable>
        <Text className="text-orange-500 font-bold text-2xl">Add New Card</Text>
        <Box className="w-7" />
      </HStack>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <Text className="text-white text-lg mt-6 mb-8 leading-6">
            Enter your card details to complete the payment. Your details are secured.
          </Text>

          <VStack space="xl" className="mb-10">
            <VStack space="md">
              <Text className="text-gray-400 font-medium">Cardholder Name</Text>
              <Box className="bg-[#1A1919] rounded-2xl border border-gray-700 h-[60px] justify-center px-4">
                <TextInput
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="Ranidu Sampath"
                  placeholderTextColor="#666"
                  className="text-white text-lg font-medium"
                  autoCapitalize="words"
                />
              </Box>
            </VStack>

            <VStack space="md">
              <Text className="text-gray-400 font-medium">Card Number</Text>
              <Box className="bg-[#1A1919] rounded-2xl border border-gray-700 h-[60px] justify-center px-4">
                <TextInput
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#666"
                  className="text-white text-lg font-medium"
                  keyboardType="numeric"
                  maxLength={19}
                />
              </Box>
            </VStack>

            <HStack space="xl">
              <VStack space="md" className="flex-1">
                <Text className="text-gray-400 font-medium">Expiry</Text>
                <Box className="bg-[#1A1919] rounded-2xl border border-gray-700 h-[60px] justify-center px-4">
                  <TextInput
                    value={expiry}
                    onChangeText={setExpiry}
                    placeholder="MM/YY"
                    placeholderTextColor="#666"
                    className="text-white text-lg font-medium"
                    maxLength={5}
                  />
                </Box>
              </VStack>

              <VStack space="md" className="flex-1">
                <Text className="text-gray-400 font-medium">CVV</Text>
                <Box className="bg-[#1A1919] rounded-2xl border border-gray-700 h-[60px] justify-center px-4">
                  <TextInput
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    placeholderTextColor="#666"
                    className="text-white text-lg font-medium"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                  />
                </Box>
              </VStack>
            </HStack>
          </VStack>

          <Box className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>

      <Box className="px-5 pb-8">
        <Button
          className={!isFormValid ? "bg-[#333] h-[60px] rounded-full w-full border border-gray-700" : "bg-[#F97316] h-[60px] rounded-full w-full"}
          onPress={handleSaveAndPay}
          disabled={!isFormValid || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <ButtonText className={!isFormValid ? "text-gray-500 font-bold text-xl" : "text-white font-bold text-xl"}>
              Save & Pay Now
            </ButtonText>
          )}
        </Button>
      </Box>
    </SafeAreaView>
  );
}
