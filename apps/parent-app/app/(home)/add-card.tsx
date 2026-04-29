import React, { useState } from "react";
import { ScrollView, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Modal } from "react-native";

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

  // Ultra-Reliable Center Insight State
  const [insight, setInsight] = useState<{ visible: boolean; type: 'success' | 'warning' | 'error'; title: string; message: string }>({
    visible: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showInsight = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
    setInsight({ visible: true, type, title, message });
    if (type === 'warning') {
      setTimeout(() => {
        setInsight(prev => ({ ...prev, visible: false }));
      }, 3000);
    }
  };

  const handleCardNumberChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < numericValue.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += numericValue[i];
    }
    setCardNumber(formattedValue);
  };

  const validateInputs = () => {
    if (!cardName.trim() || !cardNumber.trim() || !cvv.trim() || !expiry.trim()) {
      showInsight('warning', 'Missing Details', 'Please fill in all the required card fields.');
      return false;
    }

    if (!expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      showInsight('warning', 'Expiry Date', 'Please enter a valid expiry date in MM/YY format.');
      return false;
    }

    const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
    const fullYear = 2000 + year;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
      showInsight('warning', 'Expired Card', 'This card has already expired.');
      return false;
    }

    return true;
  };

  const handleExpiryChange = (text: string) => {
    let numericValue = text.replace(/\D/g, '');
    if (numericValue.length >= 2) {
      numericValue = numericValue.substring(0, 2) + '/' + numericValue.substring(2, 4);
    }
    setExpiry(numericValue);
  };

  const handleSaveAndPay = async () => {
    if (!validateInputs()) return;

    if (!bookingId) return;

    try {
      setIsProcessing(true);

      const rawCardNumber = cardNumber.replace(/\s+/g, '');
      const cardPayload = {
        cardNumber: rawCardNumber,
        cardHolderName: cardName,
        expiry: expiry,
        cvv: cvv
      };

      const cardResponse = await fetch(`${API_BASE_URL}/api/cards/parent/${LoggedParentID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardPayload)
      });

      if (!cardResponse.ok) {
        // Extract the exact validation error message thrown by the backend Java code
        const errorData = await cardResponse.json().catch(() => ({}));
        let errorMsg = errorData.message || "Failed to save card securely.";
        // Springboot prefixes our RuntimeExceptions with this. Cleaning it for UI.
        if (errorMsg.startsWith("Validation Error: ")) {
          errorMsg = errorMsg.replace("Validation Error: ", "");
        }
        throw new Error(errorMsg);
      }

      // Confirm the booking
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/confirm-payment`, {
        method: "PUT"
      });

      if (response.ok) {
        showInsight('success', 'Payment Successful!', 'Card saved and booking confirmed.');

        setTimeout(() => {
          setInsight(prev => ({ ...prev, visible: false }));
          router.push("/(tabs)/events");
        }, 2200);
      } else {
        throw new Error("Failed to process payment");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      showInsight('error', 'Payment Failed', 'Could not process the payment. Please review your details and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0E0E]">
      <Stack.Screen options={{ headerShown: false }} />
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
                  onChangeText={handleCardNumberChange}
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
                    onChangeText={handleExpiryChange}
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
          className="bg-[#F97316] h-[60px] rounded-full w-full"
          onPress={handleSaveAndPay}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <ButtonText className="text-white font-bold text-xl">
              Save & Pay Now
            </ButtonText>
          )}
        </Button>
      </Box>

      <Modal transparent visible={insight.visible} animationType="fade">
        <Box className="flex-1 justify-center items-center bg-black/80 px-6">
          <VStack space="xl" className="w-full bg-[#1A1919] border border-gray-800 rounded-[40px] p-8 items-center shadow-2xl">
            <Box className={`p-6 rounded-full ${insight.type === 'success' ? 'bg-green-500/10' :
              insight.type === 'warning' ? 'bg-yellow-500/10' : 'bg-red-500/10'
              }`}>
              {insight.type === 'success' ? (
                <CheckCircle2 color="#22C55E" size={64} />
              ) : (
                <AlertCircle color={insight.type === 'warning' ? "#EAB308" : "#EF4444"} size={64} />
              )}
            </Box>

            <VStack space="sm" className="items-center w-full">
              <Text className="text-white font-bold text-3xl text-center">{insight.title}</Text>
              <Text className="text-gray-400 text-center leading-6 text-lg">{insight.message}</Text>
            </VStack>

            {insight.type !== 'success' && (
              <Button
                className={`mt-4 w-full h-16 rounded-full ${insight.type === 'warning' ? 'bg-[#EAB308]' : 'bg-[#EF4444]'
                  }`}
                onPress={() => setInsight(prev => ({ ...prev, visible: false }))}
              >
                <ButtonText className="text-[#1A1919] font-bold text-xl uppercase">Got it</ButtonText>
              </Button>
            )}
          </VStack>
        </Box>
      </Modal>
    </SafeAreaView>
  );
}
