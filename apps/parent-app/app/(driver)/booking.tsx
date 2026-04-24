import React, { useEffect, useState } from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, ChevronDown, CheckCircle2 } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";
import { useApiClient } from "@/middleware/apiClient";
import { useParentStore } from "@/src/store/parentStore";

interface PricingData {
  driverName: string;
  usesStorksPricing: boolean;
  monthlyRate?: number;
  children?: Array<{
    childId: string;
    childName: string;
    distanceKm: number;
    ratePerKm: number;
    total: number;
  }>;
  totalEstimate: number;
}

export default function BookingScreen() {
  const { offerId, groupId } = useLocalSearchParams<{
    offerId: string;
    groupId: string;
  }>();
  const api = useApiClient("booking-and-payment");
  const { groups } = useParentStore();
  const toast = useToast();

  const selectedGroup = groups.find((g) => g.id === groupId) ?? groups[0];

  const [bookingType, setBookingType] = useState<"Monthly" | "Day">("Monthly");
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!offerId) return;
    api
      .get<PricingData>(`/offers/${offerId}/pricing?groupId=${groupId ?? ""}`)
      .then(setPricing)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [offerId, groupId]);

  const totalEstimate = pricing?.totalEstimate ?? 0;
  const canBook = acknowledged && selectedGroup;

  const handleBook = async () => {
    setSubmitting(true);
    try {
      await api.post("/bookings/request", {
        offerId,
        groupId: selectedGroup?.id,
        bookingType,
        acknowledgedTerms: true,
      });
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast
            nativeID={`toast-${id}`}
            action="success"
            variant="solid"
            className="bg-green-600 rounded-3xl p-6 mt-12"
          >
            <HStack space="sm" className="items-center">
              <CheckCircle2 color="white" size={20} />
              <ToastTitle className="text-white font-bold text-lg">
                Booking Requested!
              </ToastTitle>
            </HStack>
          </Toast>
        ),
      });
      setTimeout(() => router.replace("/(tabs)/activity"), 1800);
    } catch (err: any) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast
            nativeID={`toast-err-${id}`}
            action="error"
            variant="solid"
            className="bg-red-600 rounded-3xl p-6 mt-12"
          >
            <ToastTitle className="text-white font-bold">
              {err.message || "Could not send request."}
            </ToastTitle>
          </Toast>
        ),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <HStack className="px-5 py-4 items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color="#E66B00" />
        </Pressable>
        <Text className="text-brand font-bold text-xl flex-1">
          Search a Driver
        </Text>
      </HStack>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Group selector row */}
        {selectedGroup && (
          <Pressable className="mb-6">
            <HStack
              className="items-center bg-background-900 rounded-2xl px-4 py-3"
              space="sm"
            >
              <Avatar size="sm" className="bg-purple-300">
                <AvatarFallbackText>
                  {selectedGroup.groupName[0]}
                </AvatarFallbackText>
              </Avatar>
              <VStack className="flex-1">
                <Text className="text-white font-bold text-sm">
                  Group: {selectedGroup.groupName}
                </Text>
                <Text className="text-typography-500 text-xs">
                  {selectedGroup.children.map((c) => c.firstName).join(", ")}
                </Text>
              </VStack>
              <ChevronDown size={18} color="#E66B00" />
            </HStack>
          </Pressable>
        )}

        {/* Section title */}
        <Text className="text-white font-bold text-xl mb-4">
          Create a new request
        </Text>

        {/* Monthly / Day toggle */}
        <Box className="border border-brand rounded-full h-14 flex-row mb-6 overflow-hidden">
          {(["Monthly", "Day"] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => setBookingType(type)}
              className="flex-1 items-center justify-center"
              style={{
                backgroundColor:
                  bookingType === type ? "#E66B00" : "transparent",
              }}
            >
              <Text
                className={`font-bold text-base ${
                  bookingType === type ? "text-white" : "text-typography-400"
                }`}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </Box>

        {/* Pricing card */}
        {loading ? (
          <Box className="border border-dashed border-outline-600 rounded-[20px] p-6 mb-4 items-center">
            <ActivityIndicator color="#E66B00" />
          </Box>
        ) : (
          <Box className="border border-dashed border-outline-600 rounded-[20px] p-5 mb-4">
            {pricing?.usesStorksPricing && pricing.children ? (
              // Storks pricing — per-child breakdown
              <VStack space="sm">
                {pricing.children.map((item) => (
                  <HStack
                    key={item.childId}
                    className="justify-between items-start pb-3 border-b border-outline-800"
                  >
                    <VStack>
                      <Text className="text-white font-semibold text-sm">
                        {item.childName}
                      </Text>
                      <Text className="text-typography-500 text-xs">
                        Total Distance: {item.distanceKm} KM
                      </Text>
                    </VStack>
                    <Text className="text-white font-bold text-sm">
                      {item.ratePerKm.toFixed(2)}{" "}
                      <Text className="text-typography-500 text-xs">
                        /km
                      </Text>
                    </Text>
                  </HStack>
                ))}
                <HStack className="justify-between items-center pt-2">
                  <Text className="text-typography-400 text-sm">
                    Total Estimate:
                  </Text>
                  <Text className="text-brand font-bold text-xl">
                    {totalEstimate.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            ) : (
              // Driver's own pricing
              <VStack space="sm">
                <HStack className="items-baseline">
                  <Text className="text-white font-bold text-3xl mr-1">
                    {(pricing?.monthlyRate ?? totalEstimate).toLocaleString()}
                  </Text>
                  <Text className="text-typography-500 text-sm">
                    /{bookingType === "Monthly" ? "month" : "day"}
                  </Text>
                </HStack>
                <HStack className="justify-between">
                  <Text className="text-typography-400 text-sm">
                    Total Estimate:
                  </Text>
                  <Text className="text-brand font-bold text-lg">
                    {totalEstimate.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            )}
          </Box>
        )}

        {/* Pricing scheme notice */}
        {pricing && (
          <Box
            className={`rounded-[18px] p-4 mb-4 ${
              pricing.usesStorksPricing
                ? "border border-success-600 bg-success-500/10"
                : "border border-dashed border-brand/50 bg-[#1a0c00]"
            }`}
          >
            <HStack space="sm" className="items-start mb-3">
              <Pressable
                onPress={() => setAcknowledged((a) => !a)}
                className="mt-0.5"
              >
                <Box
                  className={`w-5 h-5 rounded border-2 items-center justify-center ${
                    acknowledged
                      ? "bg-brand border-brand"
                      : "border-outline-500"
                  }`}
                >
                  {acknowledged && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </Box>
              </Pressable>
              <Text className="text-white text-sm flex-1 leading-5">
                {pricing.usesStorksPricing
                  ? "This driver uses Storks Pricing Scheme. The above prices are customized and offers the best price for you!"
                  : "This driver does not use Storks Pricing Scheme. The above price is driver requested price."}
              </Text>
            </HStack>
          </Box>
        )}

        {/* Refund policy */}
        <Box className="border border-dashed border-outline-600 rounded-[18px] p-4 mb-6">
          <Text className="text-typography-400 text-sm leading-5">
            Refunds are only issued within first 7 days, and if you have used
            more than 7 rides, full refunds are not issued.
            {pricing?.usesStorksPricing
              ? " Dynamic pricing won't reduce for absences."
              : ""}
          </Text>
          {!pricing?.usesStorksPricing && (
            <HStack space="sm" className="items-center mt-3">
              <Pressable
                onPress={() => setAcknowledged((a) => !a)}
                className="mt-0.5"
              >
                <Box
                  className={`w-5 h-5 rounded border-2 items-center justify-center ${
                    acknowledged
                      ? "bg-brand border-brand"
                      : "border-outline-500"
                  }`}
                >
                  {acknowledged && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </Box>
              </Pressable>
              <Text className="text-white text-sm">I acknowledge</Text>
            </HStack>
          )}
        </Box>

        <Box className="h-24" />
      </ScrollView>

      {/* Book button */}
      <Box className="px-5 pb-6 pt-2">
        <Button
          className={`h-16 rounded-full w-full ${
            canBook ? "bg-brand" : "bg-outline-700"
          }`}
          isDisabled={!canBook || submitting}
          onPress={handleBook}
        >
          <ButtonText className="text-white font-bold text-lg uppercase">
            {submitting
              ? "Sending…"
              : `Book ${pricing?.driverName ?? "Driver"}`}
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}
