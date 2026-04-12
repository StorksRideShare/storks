import React, { useState } from "react";
import { ScrollView, Pressable } from "react-native";
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
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApiClient } from "@/middleware/apiClient";
import { useParentStore } from "@/src/store/parentStore";


export default function BookingRequestScreen() {
  const { offerId, groupId } = useLocalSearchParams() as any;
  const apiClient = useApiClient("booking-and-payment");
  const { parent } = useParentStore();
  const [bookingType, setBookingType] = useState("Monthly");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isStorksPricing, setIsStorksPricing] = useState(true);
  const [offer, setOffer] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (offerId) {
      fetchOfferDetails();
    }
    if (groupId) {
      fetchGroupDetails();
    }
  }, [offerId, groupId]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<any>(`/offers/${offerId}`);
      setOffer(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const parentId = parent?.userId;
      if (!parentId) return;
      const data = await apiClient.get<any[]>(`/child-groups?parentId=${parentId}`);
      const group = data.find((g: any) => g.groupId === groupId);
      if (group) {
        setSelectedGroup(group);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0E0E]">
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft color="#F97316" size={28} />
        </Pressable>
        <Text className="text-orange-500 font-bold text-2xl">
          Search a Driver
        </Text>
        <Box className="w-7" />
      </HStack>

      <ScrollView className="flex-1 px-5">
        <Pressable onPress={() => setIsStorksPricing(!isStorksPricing)}>
          <VStack className="items-center mt-4 mb-6">
            <Avatar size="xl" className="bg-purple-200 w-24 h-24 mb-3">
              <AvatarFallbackText>{offer?.driverName?.charAt(0) || "DR"}</AvatarFallbackText>
            </Avatar>
            <HStack className="items-center" space="xs">
              <Text className="text-orange-500 font-bold text-2xl">{offer?.driverName || "Driver Name"}</Text>
              <CheckCircle2 size={20} color="#F97316" />
            </HStack>
          </VStack>
        </Pressable>

        {/* Group Info Indicator */}
        <HStack className="items-center justify-between mb-8 bg-[#1A1919] p-4 rounded-3xl">
          <HStack space="md" className="items-center">
            <Avatar className="bg-purple-200">
              <AvatarFallbackText>{selectedGroup?.groupName?.charAt(0) || "G"}</AvatarFallbackText>
            </Avatar>
            <VStack>
              <Text className="text-white font-bold text-lg">Group: {selectedGroup?.groupName || "Group Name"}</Text>
              <Text className="text-gray-400 text-xs">
                {selectedGroup?.children?.map((c: any) => c.preferredName || c.firstName).join(", ") || "Children names"}
              </Text>
            </VStack>
          </HStack>
          <ChevronDown color="#F97316" size={24} />
        </HStack>

        <Text className="text-white text-xl font-bold mb-4">Create a new request</Text>

        {/* Booking Type Selector */}
        <Box className="flex-row bg-[#1A1919] p-1.5 rounded-full border border-gray-700 h-16 mb-8">
          <Pressable
            onPress={() => setBookingType("Monthly")}
            className={bookingType === "Monthly" ? "flex-1 rounded-full items-center justify-center bg-[#F97316]" : "flex-1 rounded-full items-center justify-center"}
          >
            <Text className={bookingType === "Monthly" ? "font-bold text-lg text-white" : "font-bold text-lg text-gray-400"}>Monthly</Text>
          </Pressable>
          <Pressable
            onPress={() => setBookingType("Day")}
            className={bookingType === "Day" ? "flex-1 rounded-full items-center justify-center bg-[#F97316]" : "flex-1 rounded-full items-center justify-center"}
          >
            <Text className={bookingType === "Day" ? "font-bold text-lg text-white" : "font-bold text-lg text-gray-400"}>Day</Text>
          </Pressable>
        </Box>

        {/* Estimate Details Section */}
        <Box className="border border-dashed border-gray-500 rounded-3xl p-6 bg-[#1A1919] mb-8">
          {isStorksPricing ? (
            <VStack space="lg">
              {selectedGroup?.children?.map((child: any, index: number) => (
                <HStack key={index} className="justify-between items-center bg-[#1A1919] mb-4">
                  <VStack>
                    <Text className="text-white font-bold text-lg">{child.preferredName || child.firstName}</Text>
                    <Text className="text-gray-400 text-sm">Total Distance: {4 + index * 0.5} KM</Text>
                  </VStack>
                  <HStack className="items-baseline">
                    <Text className="text-white font-bold text-xl mr-1">
                      {bookingType === "Monthly" ? (80 + index * 5).toFixed(2) : "110.00"}
                    </Text>
                    <Text className="text-gray-400 text-xs">/km</Text>
                  </HStack>
                </HStack>
              ))}

              <Box className="h-[1px] border-b border-dotted border-gray-600 w-full my-2" />

              <HStack className="justify-between items-center">
                <Text className="text-white font-medium text-lg">Total Estimate:</Text>
                <Text className="text-orange-500 font-bold text-3xl">{bookingType === "Monthly" ? "21,075" : "220.00"}</Text>
              </HStack>
            </VStack>
          ) : (
            <VStack space="xl">
              <HStack className="justify-between items-baseline">
                <HStack className="items-baseline">
                  <Text className="text-white font-bold text-4xl mr-2">{bookingType === "Monthly" ? "17,500" : "1,500"}</Text>
                  <Text className="text-gray-400 text-sm">/{bookingType === "Monthly" ? "month" : "day"}</Text>
                </HStack>
              </HStack>

              <HStack className="justify-between items-center mt-4">
                <Text className="text-white text-lg">Total Estimate:</Text>
                <Text className="text-orange-500 font-bold text-3xl">{bookingType === "Monthly" ? "35,000" : "3,000"}</Text>
              </HStack>
            </VStack>
          )}
        </Box>

        {/* Refund Policy / Acknowledgement Sections */}
        {isStorksPricing ? (
          <>
            <Box className="border border-dashed border-orange-500 rounded-2xl p-5 mb-6">
              <Text className="text-white text-sm leading-5 mb-4">
                {bookingType === "Monthly"
                  ? "Refunds are only issued within first 7 days, and if you have used more than 7 rides, full refunds are not issued. Dynamic pricing will not reduce for absences."
                  : "Refunds are not issued for one day bookings."
                }
              </Text>
              <Pressable onPress={() => setAcknowledged(!acknowledged)}>
                <HStack space="md" className="items-center">
                  <Box className={acknowledged ? "w-6 h-6 rounded border bg-white border-white" : "w-6 h-6 rounded border border-white"}>
                    {acknowledged && <CheckCircle2 size={22} color="#F97316" />}
                  </Box>
                  <Text className="text-white font-medium">I acknowledge</Text>
                </HStack>
              </Pressable>
            </Box>
            <Box className="border border-dashed border-green-600 rounded-2xl p-5 mb-10">
              <Text className="text-white text-sm leading-5 text-center">
                This driver uses Storks pricing Scheme. The above prices are customized and offers the best price for you!
              </Text>
            </Box>
          </>
        ) : (
          <>
            <Box className="border border-dashed border-orange-500 rounded-2xl p-5 mb-6">
              <Text className="text-white text-sm leading-5 mb-4">
                This driver does not use Storks Pricing Scheme, The above price is driver requested price.
              </Text>
              <Pressable onPress={() => setAcknowledged(!acknowledged)}>
                <HStack space="md" className="items-center">
                  <Box className={acknowledged ? "w-6 h-6 rounded border bg-white border-white" : "w-6 h-6 rounded border border-white"}>
                    {acknowledged && <CheckCircle2 size={22} color="#F97316" />}
                  </Box>
                  <Text className="text-white font-medium">I acknowledge</Text>
                </HStack>
              </Pressable>
            </Box>
            <Box className="border border-dashed border-orange-500 rounded-2xl p-5 mb-10">
              <Text className="text-white text-sm leading-5">
                {bookingType === "Monthly"
                  ? "Refunds are only issued within first 7 days, and if you have used more than 7 rides, full refunds are not issued."
                  : "Refunds are not issued for one day bookings."
                }
              </Text>
            </Box>
          </>
        )}

        {/* Date Picker for Day Booking */}
        {bookingType === "Day" && (
          <VStack className="mb-10">
            <Text className="text-white font-bold text-lg mb-4">Book For</Text>
            <Box className="border border-orange-500 rounded-3xl h-14 justify-center px-6">
              <Text className="text-gray-500 text-lg">DD-MM-YYYY</Text>
            </Box>
          </VStack>
        )}

        <Box className="h-10" />
      </ScrollView>

      {/* Action Button */}
      <Box className="px-5 pb-8">
        <Button
          className="bg-brand h-16 rounded-3xl w-full"
          onPress={() =>
            router.push({
              pathname: "/(groups)/payment",
              params: {
                driverName: offer?.driverName ?? "",
                groupName: selectedGroup?.groupName ?? "",
                totalAmount: bookingType === "Monthly" ? "21075" : "220",
                bookingType,
                offerId,
                groupId,
              },
            })
          }
        >
          <ButtonText className="text-white font-bold text-xl uppercase">
            Book {offer?.driverName?.split(" ")[0] || "Driver"}
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}