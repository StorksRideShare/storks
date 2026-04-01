import { useState } from "react";
import { ScrollView, Pressable, Platform } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronDown,
  CheckCircle2
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";

const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP || (Platform.OS === "android" ? "10.0.2.2" : "localhost");
const API_BASE_URL = `http://${SERVER_IP}:8080`;

export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const isCOD = paymentMethod === "Cash On Delivery";

  const handlePayment = async () => {
    if (!bookingId) return;
    
    try {
      setIsProcessing(true);
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
                    <Text className="text-white opacity-90">Your booking is now confirmed.</Text>
                  </VStack>
                </HStack>
            </Toast>
          ),
        });

        setTimeout(() => {
          router.push("/(tabs)/events");
        }, 2000);
      }
    } catch (err) {
      console.error("Payment Error:", err);
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
        <Text className="text-orange-500 font-bold text-2xl">Storks Secure Pay</Text>
        <Box className="w-7" />
      </HStack>

      <ScrollView className="flex-1 px-5">
        <Text className="text-white text-xl font-bold mt-6 mb-6">Select Payment Method</Text>

        <Pressable
          onPress={() => setPaymentMethod(isCOD ? "MasterCard" : "Cash On Delivery")}
          className="bg-[#1A1919] p-4 rounded-3xl mb-8"
        >
          <HStack className="items-center justify-between">
            <HStack space="md" className="items-center">
              <Avatar className="bg-purple-200">
                <AvatarFallbackText>P</AvatarFallbackText>
              </Avatar>
              <VStack>
                <Text className="text-white font-bold text-lg">{paymentMethod}</Text>
                <Text className="text-gray-400 text-xs">
                  {isCOD ? "No card saved" : "##########5058"}
                </Text>
              </VStack>
            </HStack>
            <ChevronDown color="#F97316" size={24} />
          </HStack>
        </Pressable>

        <Box className="border border-dashed border-gray-500 rounded-3xl p-6 bg-[#1A1919] mb-12">
          <VStack space="lg">
            <Text className="text-white font-bold text-lg mb-2">Ranidu Sampath : Group - Loku</Text>

            <HStack className="justify-between items-center">
              <Text className="text-gray-400 text-lg">Total</Text>
              <HStack className="items-baseline">
                <Text className="text-white font-bold text-2xl mr-1">21,075</Text>
                <Text className="text-gray-400 text-sm">Rs</Text>
              </HStack>
            </HStack>

            <HStack className="justify-between items-center">
              <Text className="text-gray-400 text-lg">Discounts</Text>
              <HStack className="items-baseline">
                <Text className="text-green-500 font-bold text-2xl mr-1">-2,500</Text>
                <Text className="text-green-500 text-sm">Rs</Text>
              </HStack>
            </HStack>

            <HStack className="justify-between items-center">
              <Text className="text-gray-400 text-lg">Service charge ({isCOD ? "15%" : "5%"})</Text>
              <HStack className="items-baseline">
                <Text className="text-white font-bold text-2xl mr-1">{isCOD ? "3,162" : "1,500"}</Text>
                <Text className="text-gray-400 text-sm">Rs</Text>
              </HStack>
            </HStack>

            <Box className="h-[1px] border-b border-dotted border-gray-600 w-full my-2" />

            <HStack className="justify-between items-center">
              <Text className="text-white font-medium text-xl">Subtotal:</Text>
              <HStack className="items-baseline">
                <Text className="text-white font-bold text-3xl mr-1">{isCOD ? "21,737" : "20,075"}</Text>
                <Text className="text-gray-400 text-sm">Rs</Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        <Box className="h-20" />
      </ScrollView>

      <Box className="px-5 pb-8">
        <Button
          className="bg-[#F97316] h-16 rounded-3xl w-full"
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <ButtonText className="text-white font-bold text-xl uppercase">
              {isCOD ? "Confirm Payment (COD)" : "Pay Now"}
            </ButtonText>
          )}
        </Button>
      </Box>
    </SafeAreaView>
  );
}