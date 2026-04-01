import React, { useState } from "react";
import { ScrollView, Pressable, ActivityIndicator, Platform } from "react-native";
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
import { LoggedParentID } from "@/logged_parent";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";

const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP || (Platform.OS === "android" ? "10.0.2.2" : "localhost");
const API_BASE_URL = `http://${SERVER_IP}:8080`;

const PRICE_PER_KM_MONTHLY = 80.00;
const PRICE_PER_KM_DAY = 110.00;

export default function BookingRequestScreen() {
  const { offerId, groupId, bookingId } = useLocalSearchParams() as any;
  const isFinalizing = !!bookingId;
  const [bookingType, setBookingType] = useState("Monthly");
  const [acknowledged, setAcknowledged] = useState(false);
  const [offer, setOffer] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const toast = useToast();

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
      const response = await fetch(`${API_BASE_URL}/api/offers/${offerId}`);
      if (response.ok) {
        const data = await response.json();
        setOffer(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const parentId = LoggedParentID;
      const response = await fetch(`${API_BASE_URL}/api/child-groups?parentId=${parentId}`);
      if (response.ok) {
        const data = await response.json();
        const group = data.find((g: any) => g.groupId === groupId);
        if (group) {
          setSelectedGroup(group);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async () => {
    if (!acknowledged) {
      alert("Please acknowledge the terms before proceeding.");
      return;
    }

    if (isFinalizing) {
      // If we are finalizing, we go to payment
      router.push({ 
        pathname: "/(home)/payment", 
        params: { bookingId, type: bookingType } 
      });
      return;
    }

    try {
      setRequesting(true);
      const payload = {
        groupId: groupId,
        offerId: offerId,
        type: bookingType.toUpperCase() // 'MONTHLY' or 'DAY'
      };

      const response = await fetch(`${API_BASE_URL}/api/bookings/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={"toast-" + id} action="success" variant="solid" className="bg-green-600 rounded-3xl p-6 mt-12 shadow-2xl">
               <HStack space="sm" className="items-center">
                  <CheckCircle2 color="white" size={24} />
                  <VStack>
                    <ToastTitle className="text-white font-bold text-xl">Request Sent!</ToastTitle>
                    <Text className="text-white opacity-90">Wait for the driver to accept your request.</Text>
                  </VStack>
                </HStack>
            </Toast>
          ),
        });
        
        setTimeout(() => {
          router.push("/(tabs)/events");
        }, 1500);
      } else {
          const errorData = await response.json();
          alert(errorData.message || "Failed to send request");
      }
    } catch (err) {
      console.error("Booking Error:", err);
      alert("An error occurred while sending the request.");
    } finally {
      setRequesting(false);
    }
  };

  const distance = selectedGroup?.distanceKm || 4.5;
  const childrenCount = selectedGroup?.children?.length || 0;
  const currentPrice = bookingType === "Monthly" ? (offer?.pricePerMonth || 0) : (offer?.pricePerDay || 0);
  
  const intelligentRate = bookingType === "Monthly" ? PRICE_PER_KM_MONTHLY : PRICE_PER_KM_DAY;
  const daysMultiplier = bookingType === "Monthly" ? 30 : 1;
  const intelligentPerChildEstimate = distance * intelligentRate * daysMultiplier;
  
  const totalEstimate = offer?.isUsingIntelligentPricing 
    ? (intelligentPerChildEstimate * childrenCount) 
    : (currentPrice * childrenCount);

  if (loading) {
     return (
        <SafeAreaView className="flex-1 bg-[#0F0E0E] items-center justify-center">
            <ActivityIndicator size="large" color="#F97316" />
        </SafeAreaView>
     );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F0E0E]">
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft color="#F97316" size={28} />
        </Pressable>
        <Text className="text-orange-500 font-bold text-2xl">Search a Driver</Text>
        <Box className="w-7" />
      </HStack>

      <ScrollView className="flex-1 px-5">
        <VStack className="items-center mt-4 mb-6">
          <Avatar size="xl" className="bg-purple-200 w-24 h-24 mb-3">
            <AvatarFallbackText>{offer?.driverName?.charAt(0) || "DR"}</AvatarFallbackText>
          </Avatar>
          <HStack className="items-center" space="xs">
            <Text className="text-orange-500 font-bold text-2xl">{offer?.driverName || "Driver Name"}</Text>
            <CheckCircle2 size={20} color="#F97316" />
          </HStack>
        </VStack>

        <HStack className="items-center justify-between mb-8 bg-[#1A1919] p-4 rounded-3xl">
          <HStack space="md" className="items-center">
            <Avatar className="bg-purple-200">
              <AvatarFallbackText>{selectedGroup?.groupName?.charAt(0) || "G"}</AvatarFallbackText>
            </Avatar>
            <VStack>
              <Text className="text-white font-bold text-lg">Group: {selectedGroup?.groupName || "Group Name"}</Text>
              <Text className="text-gray-400 text-xs">
                {selectedGroup?.children?.map((c: any) => c.preferredName || c.firstName).join(", ") || "No children found"}
              </Text>
            </VStack>
          </HStack>
          <ChevronDown color="#F97316" size={24} />
        </HStack>

        <Text className="text-white text-xl font-bold mb-4">
          {isFinalizing ? "Pick your payment mode" : "Create a new request"}
        </Text>

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

        <Box className="border border-dashed border-gray-500 rounded-3xl p-6 bg-[#1A1919] mb-8">
          {offer?.isUsingIntelligentPricing ? (
            <VStack space="lg">
              {selectedGroup?.children?.map((child: any, index: number) => (
                <HStack key={index} className="justify-between items-center mb-4">
                  <VStack>
                    <Text className="text-white font-bold text-lg">{child.preferredName || child.firstName}</Text>
                    <Text className="text-gray-400 text-sm">
                      Total Distance: {distance} KM
                    </Text>
                  </VStack>
                  <VStack className="items-end">
                    <Text className="text-white font-bold text-xl">
                      {intelligentPerChildEstimate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {intelligentRate.toLocaleString(undefined, { minimumFractionDigits: 2 })} /km
                    </Text>
                  </VStack>
                </HStack>
              ))}

              <Box className="h-[1px] border-b border-dotted border-gray-600 w-full my-2" />

              <HStack className="justify-between items-center mt-2">
                <Text className="text-white text-sm">Total Estimate:</Text>
                <Text className="text-orange-500 font-bold text-2xl">
                  {totalEstimate.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Text>
              </HStack>
            </VStack>
          ) : (
            <VStack space="xl">
              <HStack className="justify-between items-baseline">
                <HStack className="items-baseline">
                  <Text className="text-white font-bold text-4xl mr-2">{currentPrice.toLocaleString()}</Text>
                  <Text className="text-gray-400 text-sm">/{bookingType === "Monthly" ? "month" : "day"}</Text>
                </HStack>
              </HStack>

              <HStack className="justify-between items-center mt-4">
                <Text className="text-white text-sm">Total Estimate:</Text>
                <Text className="text-orange-500 font-bold text-2xl">{totalEstimate.toLocaleString()}</Text>
              </HStack>
            </VStack>
          )}
        </Box>

        {offer?.isUsingIntelligentPricing ? (
          <>
            <Box className="border border-dashed border-orange-500 rounded-2xl p-5 mb-6">
              <Text className="text-white text-sm leading-5 mb-4">
                {bookingType === "Monthly"
                  ? "Refunds are only issued within first 7 days, and if you have used more than 7 rides, full refunds are not issued. Dynamic pricing won't reduce for absences."
                  : "Refunds are not issued for one day bookings."
                }
              </Text>
              <Pressable onPress={() => setAcknowledged(!acknowledged)}>
                <HStack space="md" className="items-center">
                  <Box className={acknowledged ? "w-6 h-6 rounded bg-white items-center justify-center p-[2px]" : "w-6 h-6 rounded border border-white"}>
                    {acknowledged && <CheckCircle2 size={24} color="#F97316" />}
                  </Box>
                  <Text className="text-white font-medium">I acknowledge</Text>
                </HStack>
              </Pressable>
            </Box>

            <Box className="border border-dashed border-[#166534] rounded-2xl p-5 mb-10">
              <Text className="text-white text-sm leading-5">
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
                  <Box className={acknowledged ? "w-6 h-6 rounded bg-white items-center justify-center p-[2px]" : "w-6 h-6 rounded border border-white"}>
                    {acknowledged && <CheckCircle2 size={24} color="#F97316" />}
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

      <Box className="px-5 pb-8">
        <Button
          className="bg-[#F97316] h-16 rounded-3xl w-full"
          onPress={handleAction}
          disabled={requesting}
        >
          {requesting ? (
             <ActivityIndicator color="white" />
          ) : (
            <ButtonText className="text-white font-bold text-xl uppercase">
              {isFinalizing ? `Pay ${offer?.driverName?.split(" ")[0] || "Driver"}` : `Book ${offer?.driverName?.split(" ")[0] || "Driver"}`}
            </ButtonText>
          )}
        </Button>
      </Box>
    </SafeAreaView>
  );
}