import { useState, useEffect, useCallback } from "react";
import { ScrollView, Pressable, Image, ActivityIndicator, Platform, BackHandler } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import default_vehicle_1 from "../../assets/images/default_vehicle/1.jpg";
import default_vehicle_2 from "../../assets/images/default_vehicle/2.jpg";
import { useAuth } from "@clerk/expo";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";
import { useApiClient } from "@/middleware/apiClient";
import { useParentStore } from "@/src/store/parentStore";
import { ChevronLeft, ChevronDown, Star, MapPin, CheckCircle2, Bookmark, X } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface StatBoxProps {
  title: string;
  subTitle?: string;
  icon?: any;
}


const StatBox = ({ title, subTitle, icon: IconComponent }: StatBoxProps) => (
  <Box className="flex-1 border border-dashed border-outline-700 rounded-[28px] p-4 items-center justify-center min-h-[120px] bg-background-900">
    {IconComponent && <IconComponent size={32} color="#E66B00" className="mb-2" />}
    <Text className="text-brand font-bold text-xl text-center">{title}</Text>
    {subTitle ? <Text className="text-gray-400 text-sm text-center mt-1">{subTitle}</Text> : null}
  </Box>
);

export default function DriverDetailsScreen() {
  const apiClient = useApiClient("booking-and-payment");
  const { offerId, groupId } = useLocalSearchParams() as any;
  const { parent } = useParentStore();
  const [offer, setOffer] = useState<any>(null);
  const [childGroups, setChildGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const [isActiveBooking, setIsActiveBooking] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const toast = useToast();

  const hasMatch = selectedGroup?.defaultDropLocation && offer?.destinations?.includes(selectedGroup.defaultDropLocation);

  useEffect(() => {
    if (offerId) {
      fetchOfferDetails(true);
      fetchChildGroups();
    }
  }, [offerId]);

  useEffect(() => {
    if (selectedGroup && offerId) {
      setIsAlreadyBooked(false);
      setIsActiveBooking(false);
      checkBookingStatus();
      fetchOfferDetails(false); 
    }
  }, [selectedGroup, offerId]);

  // Handle back button to close selector
  useEffect(() => {
    const backAction = () => {
      if (showSelector) {
        setShowSelector(false);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [showSelector]);

  const checkBookingStatus = async () => {
    try {
      const data = await apiClient.get<any>(`/bookings/check?groupId=${selectedGroup.groupId}&offerId=${offerId}`);
      setIsAlreadyBooked(data.exists);
      setIsActiveBooking(data.isActive);
    } catch (err) {
      console.error("Error checking booking status:", err);
    }
  };

  const fetchChildGroups = async () => {
    try {
      const parentId = parent?.userId;
      if (!parentId) return;
      const data = await apiClient.get<any[]>(`/child-groups?parentId=${parentId}`);
      setChildGroups(data);
      if (data.length > 0) {
        const initialGroup = data.find((g: any) => g.groupId === groupId) || data[0];
        setSelectedGroup(initialGroup);
      }
    } catch (err) {
      console.error("Error fetching child groups:", err);
    }
  };

  const fetchOfferDetails = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const data = await apiClient.get<any>(`/offers/${offerId}`);
      if (data.vehicleImageUrls.length === 0) {
        data.vehicleImageUrls = [default_vehicle_1, default_vehicle_2];
      }
      if (data.bookedGroupName) {
        setIsBooked(true);
      } else {
        setIsBooked(false);
      }
      setOffer(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  const handleBookingRequest = async () => {
    if (!hasMatch) return;
    
    try {
      const data = await apiClient.post<any>(`/bookings/request`, {
        groupId: selectedGroup.groupId,
        offerId: offer.offerId,
      });

      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={"toast-" + id} action="success" variant="solid" className="bg-green-600 rounded-3xl p-6 mt-12 shadow-2xl">
              <VStack space="xs">
                <HStack space="sm" className="items-center">
                  <CheckCircle2 color="white" size={20} />
                  <ToastTitle className="text-white font-bold text-xl">Booking Requested!</ToastTitle>
                </HStack>
                <Text className="text-white text-base opacity-90">
                  Your request for {selectedGroup.groupName} has been sent to {offer.driverName}.
                </Text>
              </VStack>
            </Toast>
          );
        },
      });

      setTimeout(() => {
        router.push("/activity");
      }, 2000);
    } catch (err) {
      console.error("Booking Request Error:", err);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-err-" + id} action="error" variant="solid" className="bg-red-600 rounded-3xl p-6 mt-12">
            <ToastTitle className="text-white font-bold">Request Failed</ToastTitle>
            <Text className="text-white">{(err as any).message || "Could not send request."}</Text>
          </Toast>
        ),
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-950 items-center justify-center">
        <ActivityIndicator size="large" color="#E66B00" />
      </SafeAreaView>
    );
  }

  if (!offer) {
    return (
      <SafeAreaView className="flex-1 bg-background-950 items-center justify-center">
        <Text className="text-white mb-4">Driver details not found</Text>
        <Button onPress={() => router.back()} className="bg-brand rounded-xl">
          <ButtonText>Go Back</ButtonText>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-950">
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft color="#E66B00" size={28} />
        </Pressable>
        <Text className="text-brand font-bold text-2xl">Search a Driver</Text>
        <Pressable>
          <Bookmark color="#E66B00" size={28} />
        </Pressable>
      </HStack>

      <ScrollView className="flex-1 px-5">
        <VStack className="items-center mt-6 mb-8">
          <Avatar size="2xl" className="bg-purple-200 w-36 h-36 mb-6">
            <AvatarFallbackText>{offer.driverName?.charAt(0) || "DR"}</AvatarFallbackText>
          </Avatar>
          <HStack className="items-center" space="xs">
            <Text className="text-brand font-bold text-3xl">{offer.driverName || "Unknown Driver"}</Text>
            <CheckCircle2 size={24} color="#E66B00" />
          </HStack>
          {isBooked && (
            <Text className="text-success-600 text-lg mt-2 font-bold uppercase">Driving for {offer.bookedGroupName}</Text>
          )}
        </VStack>

        <HStack space="md" className="mb-10">
          <StatBox icon={Star} title={offer.rating || "4.8 Rated"} subTitle="" />
          <StatBox title={offer.experience || "5 Years"} subTitle="Experience" />
          <StatBox title={offer.trips || "+500"} subTitle="Safe Trips" />
        </HStack>

        <VStack className="mb-10">
          <Text className="text-white text-2xl font-bold mb-6">Vehicle Details</Text>
          <Box className="border border-dashed border-outline-700 rounded-[32px] p-5 bg-background-900">
            <HStack space="md" className="mb-6">
              {offer.vehicleImageUrls && offer.vehicleImageUrls.length > 0 ? (
                offer.vehicleImageUrls.slice(0, 2).map((url: any, i: number) => (
                  <Box key={i} className="flex-1 aspect-[4/3] bg-  rounded-3xl overflow-hidden">
                    <Image
                      source={typeof url === "string" ? { uri: url } : url}
                      className="w-full h-full"
                    />
                  </Box>
                ))
              ) : (
                <>
                  <Box className="flex-1 aspect-[4/3] bg-  rounded-3xl overflow-hidden" />
                  <Box className="flex-1 aspect-[4/3] bg-  rounded-3xl overflow-hidden" />
                </>
              )}
            </HStack>
            <HStack space="xs" className="items-center mb-4">
              <Text className="text-white font-bold text-2xl">{offer.vehicleName || "Unknown Vehicle"}</Text>
              <CheckCircle2 size={22} color="#E66B00" />
            </HStack>
            <Box className="bg-brand self-start px-5 py-2 rounded-full">
              <Text className="text-white font-bold text-base">{offer.plate || "N/A"}</Text>
            </Box>
          </Box>
        </VStack>

        <VStack className="mb-10">
          <Text className="text-white text-2xl font-bold mb-6">Offered Destinations</Text>
          <Box className="border border-dashed border-outline-700 rounded-[32px] p-6 bg-background-900">
            <VStack space="xl">
              {offer.destinations && offer.destinations.length > 0 ? (
                offer.destinations.map((dest: string, index: number) => (
                  <HStack key={index} className="justify-between items-center">
                    <HStack space="md" className="flex-1 items-start">
                      <Box className="mt-1">
                        <MapPin size={24} color="#E66B00" />
                      </Box>
                      <Text className="text-typography-300 text-lg flex-1 leading-6">{dest}</Text>
                    </HStack>
                    {selectedGroup?.defaultDropLocation === dest && (
                      <Box className="border border-success-600 rounded-lg px-4 py-1.5 bg-success-600/10">
                        <Text className="text-success-600 font-bold uppercase text-xs">Match</Text>
                      </Box>
                    )}
                  </HStack>
                ))
              ) : (
                <Text className="text-typography-500 text-center">No standard destinations listed</Text>
              )}
            </VStack>
          </Box>
        </VStack>

        <Pressable onPress={() => setShowSelector(true)}>
          <HStack className="items-center justify-between mb-10 bg-background-900 p-5 rounded-[32px]">
            <HStack space="md" className="items-center">
              <Avatar className="bg-purple-200 w-12 h-12">
                <AvatarFallbackText>{selectedGroup?.groupName?.charAt(0) || "G"}</AvatarFallbackText>
              </Avatar>
              <VStack>
                <Text className="text-white font-bold text-xl">
                  Group: {selectedGroup?.groupName || "No Group Selected"}
                </Text>
                <Text className="text-typography-500 text-sm">
                  {selectedGroup?.children?.map((c: any) => c.preferredName || c.firstName).join(", ") || "No children found"}
                </Text>
              </VStack>
            </HStack>
            <ChevronDown color="#E66B00" size={24} />
          </HStack>
        </Pressable>

        <Box className="h-20" />
      </ScrollView>

      <Box className="px-5 pb-8">
        <Button
          className={
            (isBooked && !isActiveBooking) || isAlreadyBooked || !hasMatch
              ? "bg-  h-16 rounded-full w-full border border-outline-700" 
              : "bg-brand h-16 rounded-full w-full"
          }
          disabled={(isBooked && !isActiveBooking) || isAlreadyBooked || !hasMatch}
          onPress={handleBookingRequest}
        >
          <ButtonText className="text-white font-bold text-xl uppercase">
            {(() => {
              if (!hasMatch) return "No Matches";
              if (isActiveBooking) return `Driving for ${selectedGroup?.groupName}`;
              if (isAlreadyBooked) return "Already Requested";
              return "Request Booking";
            })()}
          </ButtonText>
        </Button>
      </Box>

      {/* CUSTOM OVERLAY SELECTOR - STABLE ON ANDROID */}
      {showSelector && (
        <Box className="absolute inset-0 bg-black/80 justify-end z-[999]" style={{ elevation: 10 }}>
          <Pressable className="absolute inset-0" onPress={() => setShowSelector(false)} />
          <Box className="bg-background-900 border-t border-outline-800 rounded-t-[40px] p-6 pb-12 w-full">
            <HStack className="justify-between items-center mb-6 px-2">
              <Text className="text-white font-bold text-2xl">Select a Child Group</Text>
              <Pressable onPress={() => setShowSelector(false)} className="p-2">
                <X color="#E66B00" size={24} />
              </Pressable>
            </HStack>
            
            <VStack space="md">
              {childGroups.map((group) => (
                <Pressable
                  key={group.groupId}
                  onPress={() => {
                    setShowSelector(false);
                    setTimeout(() => setSelectedGroup(group), 50);
                  }}
                  className="bg-  active:bg-background-700 p-5 rounded-2xl border border-outline-700"
                >
                  <VStack>
                    <Text className="text-white font-bold text-xl mb-1">{group.groupName}</Text>
                    <Text className="text-typography-400 text-base">
                      {group.children?.map((c: any) => c.preferredName || c.firstName).join(", ")}
                    </Text>
                  </VStack>
                </Pressable>
              ))}
              {childGroups.length === 0 && (
                <Text className="text-typography-500 text-center py-10 text-lg italic">No groups available</Text>
              )}
            </VStack>
          </Box>
        </Box>
      )}
    </SafeAreaView>
  );
}