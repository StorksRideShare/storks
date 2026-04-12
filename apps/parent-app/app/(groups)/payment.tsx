import { useState } from "react";
import { ScrollView, Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { ChevronLeft, ChevronDown } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Payment screen — data-driven from booking flow params ──────────────────────
// TODO (Phase 7): Replace the COD/card toggle & Pay Now action with Stripe PaymentSheet.

export default function PaymentScreen() {
  const {
    driverName = "Driver",
    groupName = "Group",
    totalAmount = "0",
    bookingType = "Monthly",
    offerId,
    groupId,
  } = useLocalSearchParams<{
    driverName: string;
    groupName: string;
    totalAmount: string;
    bookingType: string;
    offerId: string;
    groupId: string;
  }>();

  const total = Number(totalAmount);
  const isCOD = true; // TODO: replace with Stripe method selection in Phase 7

  // Service charge: 15% for COD, 5% for card
  const serviceChargeRate = isCOD ? 0.15 : 0.05;
  const serviceCharge = Math.round(total * serviceChargeRate);
  const discount = Math.round(total * 0.12); // ~12% loyalty discount
  const subtotal = total - discount + serviceCharge;

  const formatAmount = (n: number) =>
    n.toLocaleString("en-LK", { maximumFractionDigits: 0 });

  return (
    <SafeAreaView className="flex-1 bg-background-950">
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft color="#E66B00" size={28} />
        </Pressable>
        <Text className="text-brand font-bold text-2xl">Storks Secure Pay</Text>
        <Box className="w-7" />
      </HStack>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-white font-bold text-xl mt-6 mb-6">
          Select Payment Method
        </Text>

        {/* Payment Method Card — Stripe integration in Phase 7 */}
        <Box className="bg-background-800 p-4 rounded-3xl mb-8 border border-outline-700">
          <HStack className="items-center justify-between">
            <HStack space="md" className="items-center">
              <Avatar className="bg-purple-200">
                <AvatarFallbackText>C</AvatarFallbackText>
              </Avatar>
              <VStack>
                <Text className="text-white font-bold text-lg">Cash on Delivery</Text>
                <Text className="text-typography-500 text-xs">
                  Stripe payments available soon
                </Text>
              </VStack>
            </HStack>
            <ChevronDown color="#E66B00" size={24} />
          </HStack>
        </Box>

        {/* Payment summary */}
        <Box className="border border-dashed border-outline-600 rounded-3xl p-6 bg-background-800 mb-12">
          <VStack space="lg">
            <Text className="text-white font-bold text-lg mb-2">
              {driverName} : {groupName}
            </Text>

            <HStack className="justify-between items-center">
              <Text className="text-typography-500 text-lg">Total</Text>
              <HStack className="items-baseline">
                <Text className="text-white font-bold text-2xl mr-1">
                  {formatAmount(total)}
                </Text>
                <Text className="text-typography-500 text-sm">Rs</Text>
              </HStack>
            </HStack>

            <HStack className="justify-between items-center">
              <Text className="text-typography-500 text-lg">Loyalty Discount</Text>
              <HStack className="items-baseline">
                <Text className="text-success-500 font-bold text-2xl mr-1">
                  -{formatAmount(discount)}
                </Text>
                <Text className="text-success-500 text-sm">Rs</Text>
              </HStack>
            </HStack>

            <HStack className="justify-between items-center">
              <Text className="text-typography-500 text-lg">
                Service charge ({isCOD ? "15%" : "5%"})
              </Text>
              <HStack className="items-baseline">
                <Text className="text-white font-bold text-2xl mr-1">
                  {formatAmount(serviceCharge)}
                </Text>
                <Text className="text-typography-500 text-sm">Rs</Text>
              </HStack>
            </HStack>

            <Box className="h-px border-b border-dashed border-outline-600 my-2" />

            <HStack className="justify-between items-center">
              <Text className="text-white font-medium text-xl">Subtotal:</Text>
              <HStack className="items-baseline">
                <Text className="text-white font-bold text-3xl mr-1">
                  {formatAmount(subtotal)}
                </Text>
                <Text className="text-typography-500 text-sm">Rs</Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        <Box className="h-20" />
      </ScrollView>

      {/* Pay button — Phase 7: wire to Stripe PaymentSheet */}
      <Box className="px-5 pb-8">
        <Button className="bg-brand h-16 rounded-3xl w-full">
          <ButtonText className="text-white font-bold text-xl uppercase">
            {isCOD ? "Cash on Delivery" : "Pay Now"}
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}