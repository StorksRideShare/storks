import React, { useEffect, useState } from "react";
import { ScrollView, RefreshControl, Platform, ActivityIndicator } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoggedParentID } from "../../logged_parent";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";
import { CheckCircle2, XCircle } from "lucide-react-native";
import { useAuth } from "@clerk/expo";

import { API_BASE_URL } from "../../middleware/apiClient";

const EventCard = ({ id, groupName, driverName, vehicle, plate, title, description, status, onCancel }: any) => {
  const isRequested = status === "Requested";
  const isConfirmed = status === "Confirmed";
  const isCancelled = status === "Cancelled";
  
  return (
    <Box className="border border-dashed border-gray-600 rounded-[32px] p-6 mb-6">
      <HStack className="justify-between items-center mb-6">
        <Text className="text-white font-bold text-2xl">Group: {groupName}</Text>
        {isCancelled && (
           <Box className="bg-red-600/20 px-3 py-1 rounded-full border border-red-600">
             <Text className="text-red-600 font-bold uppercase text-xs">Cancelled</Text>
           </Box>
        )}
      </HStack>
      
      <HStack space="lg" className="items-center mb-6">
        <Avatar size="xl" className="bg-[#D1C4E9] w-20 h-20">
          <AvatarFallbackText>{driverName.charAt(0)}</AvatarFallbackText> 
        </Avatar>
        <VStack className="flex-1">
          <Text className="text-white font-bold text-2xl">{driverName}</Text>
          <Text className="text-gray-400 text-lg mb-1">{vehicle}</Text>
          {plate && plate !== "N/A" && (
            <HStack space="xs" className="items-center">
              <Text className="text-[#F57C00] font-bold text-xl">{plate.split(" - ")[0]}</Text>
              <Text className="text-[#F57C00] font-bold text-xl"> - </Text>
              <Text className="text-[#F57C00] font-bold text-xl">{plate.split(" - ")[1]}</Text>
            </HStack>
          )}
        </VStack>
      </HStack>

      <VStack space="xs" className="mb-6">
        <Text className="text-white font-bold text-[24px] mb-1">{title}</Text>
        <Text className="text-gray-400 text-[18px] leading-[26px]">
          {description}
        </Text>
      </VStack>

      {!isCancelled && (
        <VStack space="md">
          {isRequested && (
            <Button 
              className="bg-red-600 h-16 rounded-full w-full" 
              onPress={() => onCancel(id)}
            >
              <ButtonText className="text-white font-bold text-xl uppercase">
                Cancel Request
              </ButtonText>
            </Button>
          )}

          {status === "Accepted" && (
            <Button 
              className="bg-[#F97316] h-20 rounded-full w-full" 
            >
              <ButtonText className="text-white font-bold text-2xl uppercase">
                Confirm & Pay
              </ButtonText>
            </Button>
          )}

          {isConfirmed && (
            <Button 
              className="bg-[#616161] h-20 rounded-full w-full" 
              disabled={true}
            >
              <ButtonText className="text-white font-bold text-2xl uppercase">
                Confirmed
              </ButtonText>
            </Button>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default function ActivityScreen() {
  const { getToken } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const fetchEvents = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/bookings/parent?parentId=${LoggedParentID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Fetch Events Error:", err);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        toast.show({
          placement: "top",
          render: ({ id: tId }) => (
            <Toast nativeID={"toast-" + tId} action="success" variant="solid" className="bg-red-600 rounded-3xl p-6 mt-12 shadow-2xl">
               <HStack space="sm" className="items-center">
                  <XCircle color="white" size={20} />
                  <ToastTitle className="text-white font-bold text-xl">Booking Cancelled</ToastTitle>
                </HStack>
            </Toast>
          ),
        });
        fetchEvents();
      }
    } catch (err) {
      console.error("Cancel Error:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#0F0E0E] px-5">
      <HStack className="justify-between items-center py-4 mb-4">
        <Text className="text-white font-bold text-2xl">Storks</Text>
        <Text className="text-orange-500 font-bold text-3xl">Activity</Text>
      </HStack>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />
        }
      >
        <Text className="text-white font-bold text-3xl mb-8">Today</Text>

        {events.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            groupName={event.groupName}
            driverName={event.driverName}
            vehicle={event.vehicle}
            plate={event.plate}
            title={event.title}
            description={event.description}
            status={event.status}
            onCancel={handleCancel}
          />
        ))}

        {events.length === 0 && (
          <Box className="py-20 items-center">
            <Text className="text-gray-500 text-xl">No active bookings for today.</Text>
          </Box>
        )}

        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
