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
import { router, useFocusEffect } from "expo-router";

const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP || (Platform.OS === "android" ? "10.0.2.2" : "localhost");
const API_BASE_URL = `http://${SERVER_IP}:8080`;

const EventCard = ({ id, groupName, driverName, vehicle, plate, title, description, status, onCancel, offerId, groupId, price, isCancelling }: any) => {
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

      {!isCancelled && !isConfirmed && (
        <VStack space="md">
          {(isRequested || status === "Accepted") && (
            <Button
              className="bg-red-600 h-16 rounded-full w-full"
              onPress={() => onCancel(id)}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonText className="text-white font-bold text-xl uppercase">
                  Cancel Request
                </ButtonText>
              )}
            </Button>
          )}

          {status === "Accepted" && (
            <Button
              className="bg-[#F97316] h-16 rounded-full w-full"
              onPress={() => router.push({
                pathname: "/(home)/payment",
                params: { bookingId: id, price: price, groupName: groupName, driverName: driverName }
              })}
            >
              <ButtonText className="text-white font-bold text-xl uppercase">
                Confirm Payment
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

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const toast = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/parent?parentId=${LoggedParentID}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Fetch Events Error:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setCancellingId(id);
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, {
        method: "PUT"
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
        await fetchEvents();
      }
    } catch (err) {
      console.error("Cancel Error:", err);
    } finally {
      setCancellingId(null);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#0F0E0E] px-5">
      <HStack className="justify-between items-center py-4 mb-4">
        <Text className="text-white font-bold text-2xl">Storks</Text>
        <Text className="text-orange-500 font-bold text-3xl">Events</Text>
      </HStack>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />
        }
      >
        <Text className="text-white font-bold text-3xl mb-8">Today</Text>

        {initialLoading ? (
          <Box className="py-20 items-center">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="text-gray-400 mt-4">Loading your bookings...</Text>
          </Box>
        ) : (
          <>
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
                offerId={event.offerId}
                groupId={event.groupId}
                price={event.price}
                onCancel={handleCancel}
                isCancelling={cancellingId === event.id}
              />
            ))}

            {events.length === 0 && (
              <Box className="py-20 items-center">
                <Text className="text-gray-500 text-xl">No active bookings for today.</Text>
              </Box>
            )}
          </>
        )}

        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
