import { useState, useEffect } from "react";
import { ScrollView, Pressable, Platform, ActivityIndicator } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Modal } from "react-native";
import { LoggedParentID } from "../../logged_parent";

const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP || (Platform.OS === "android" ? "10.0.2.2" : "localhost");
const API_BASE_URL = `http://${SERVER_IP}:8080`;

export default function PaymentScreen() {
  const { bookingId, price, groupName, driverName } = useLocalSearchParams() as any;
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedCard, setSavedCard] = useState<any>(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("MasterCard");
  
  // Ultra-Reliable Center Insight State
  const [insight, setInsight] = useState<{ visible: boolean; type: 'success' | 'warning' | 'error'; title: string; message: string }>({
    visible: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showInsight = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
    setInsight({ visible: true, type, title, message });
    if (type === 'warning' || type === 'error') {
      setTimeout(() => {
        setInsight(prev => ({ ...prev, visible: false }));
      }, 3000);
    }
  };

  const isCOD = paymentMethod === "Cash On Delivery";

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cards/parent/${LoggedParentID}`);
      if (response.ok) {
        const cards = await response.json();
        if (cards && cards.length > 0) {
          setSavedCard(cards[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch cards:", err);
    } finally {
      setLoadingCard(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingId) return;
    
    // If selecting card and no saved card, force add-card
    if (!isCOD && !savedCard) {
      router.push({ pathname: "/(home)/add-card", params: { bookingId } });
      return;
    }

    try {
      setIsProcessing(true);
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/confirm-payment`, {
        method: "PUT"
      });

      if (response.ok) {
        showInsight('success', 'Payment Successful!', 'Your booking is now confirmed.');

        setTimeout(() => {
          setInsight(prev => ({ ...prev, visible: false }));
          router.push("/(tabs)/events");
        }, 2200);
      } else {
         showInsight('error', 'Payment Failed', 'Could not process the payment.');
      }
    } catch (err) {
      console.error("Payment Error:", err);
      showInsight('error', 'System Error', 'Could not connect to the server.');
    } finally {
      setIsProcessing(false);
    }
  };

  const displayPrice = price ? parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0";

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
        <Text className="text-white text-xl font-medium mt-6 mb-6">Select Payment Method</Text>

        <Pressable
          onPress={() => setPaymentMethod(isCOD ? "MasterCard" : "Cash On Delivery")}
          className="mb-8 p-4 rounded-3xl bg-[#1A1919]"
        >
          <HStack className="items-center justify-between">
            <HStack space="md" className="items-center">
              <Avatar className="bg-[#D1C4E9] w-14 h-14">
                <AvatarFallbackText>{isCOD ? "C" : "M"}</AvatarFallbackText>
              </Avatar>
              <VStack>
                <Text className="text-white font-bold text-[18px]">{paymentMethod}</Text>
                <Text className="text-gray-400 text-[14px]">
                  {isCOD ? "Pay driver physically" : loadingCard ? "Checking..." : (savedCard ? savedCard.cardNumber : "No card saved")}
                </Text>
              </VStack>
            </HStack>
            <ChevronDown color="#F97316" size={24} />
          </HStack>
        </Pressable>

        <Box className="border border-dashed border-gray-500 rounded-3xl p-6 bg-[#1A1919] mb-12">
          <VStack space="lg">
            <Text className="text-white font-bold text-lg mb-2">
              {driverName || "Driver"} : Group - {groupName || "Group"}
            </Text>

            <HStack className="justify-between items-center">
              <Text className="text-gray-300 text-lg">Total</Text>
              <HStack className="items-baseline">
                <Text className="text-white font-bold text-3xl mr-2">{displayPrice}</Text>
                <Text className="text-gray-400 text-sm">Rs</Text>
              </HStack>
            </HStack>

            <Box className="h-[1px] border-b border-dotted border-gray-600 w-full my-2" />

            <HStack className="justify-between items-center">
              <Text className="text-gray-300 text-lg">Subtotal:</Text>
              <HStack className="items-baseline">
                <Text className="text-white font-bold text-3xl mr-2">{displayPrice}</Text>
                <Text className="text-gray-400 text-sm">Rs</Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        <Box className="h-20" />
      </ScrollView>

      <Box className="px-5 pb-8">
        <Button
          className="bg-[#F97316] h-[60px] rounded-full w-full"
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <ButtonText className="text-white font-bold text-xl">{isCOD ? "Confirm Booking" : "Pay Now"}</ButtonText>
          )}
        </Button>
      </Box>

      <Modal transparent visible={insight.visible} animationType="fade">
        <Box className="flex-1 justify-center items-center bg-black/80 px-6">
          <VStack space="xl" className="w-full bg-[#1A1919] border border-gray-800 rounded-[40px] p-8 items-center shadow-2xl">
            <Box className={`p-6 rounded-full ${
              insight.type === 'success' ? 'bg-green-500/10' : 
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
                className={`mt-4 w-full h-16 rounded-full ${
                  insight.type === 'warning' ? 'bg-[#EAB308]' : 'bg-[#EF4444]'
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