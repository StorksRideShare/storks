import React from "react";
import { ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, XCircle } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";
import { useBookings } from "@/src/hooks/useBookings";
import { useApiError } from "@/src/hooks/useApiError";
import { ActivityScreenSkeleton } from "@/components/skeletons/ActivityScreenSkeleton";
import type { BookingResponse } from "@/utils/api";

// ── Event Card ────────────────────────────────────────────────────────────────

function EventCard({
  booking,
  onCancel,
}: {
  booking: BookingResponse;
  onCancel: (id: string) => void;
}) {
  const isCancelled = booking.status === "Cancelled";
  const isRequested = booking.status === "Requested";
  const isAccepted = booking.status === "Accepted";
  const isConfirmed = booking.status === "Confirmed";

  return (
    <Box className="border border-dashed border-outline-600 rounded-[32px] p-6 mb-6">
      <HStack className="justify-between items-center mb-6">
        <Text className="text-white font-bold text-2xl">
          Group: {booking.groupName}
        </Text>
        {isCancelled && (
          <Box className="bg-error-500/20 px-3 py-1 rounded-full border border-error-500">
            <Text className="text-error-500 font-bold uppercase text-xs">
              Cancelled
            </Text>
          </Box>
        )}
      </HStack>

      <HStack space="lg" className="items-center mb-6">
        <Avatar size="xl" className="bg-purple-200 w-20 h-20">
          <AvatarFallbackText>{booking.driverName.charAt(0)}</AvatarFallbackText>
        </Avatar>
        <VStack className="flex-1">
          <Text className="text-white font-bold text-2xl">{booking.driverName}</Text>
          <Text className="text-typography-500 text-lg mb-1">{booking.vehicle}</Text>
          {booking.plate && booking.plate !== "N/A" && (
            <Text className="text-brand font-bold text-xl">{booking.plate}</Text>
          )}
        </VStack>
      </HStack>

      <VStack space="xs" className="mb-6">
        <Text className="text-white font-bold text-2xl mb-1">{booking.title}</Text>
        <Text className="text-typography-500 text-lg leading-7">
          {booking.description}
        </Text>
      </VStack>

      {!isCancelled && (
        <VStack space="md">
          {isRequested && (
            <Button
              className="bg-error-600 h-16 rounded-full w-full"
              onPress={() => onCancel(booking.id)}
            >
              <ButtonText className="text-white font-bold text-xl uppercase">
                Cancel Request
              </ButtonText>
            </Button>
          )}
          {isAccepted && (
            <Button className="bg-brand h-20 rounded-full w-full">
              <ButtonText className="text-white font-bold text-2xl uppercase">
                Confirm &amp; Pay
              </ButtonText>
            </Button>
          )}
          {isConfirmed && (
            <Button className="bg-outline-500 h-20 rounded-full w-full" isDisabled>
              <ButtonText className="text-white font-bold text-2xl uppercase">
                Confirmed
              </ButtonText>
            </Button>
          )}
        </VStack>
      )}
    </Box>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ActivityScreen() {
  const { bookings, isLoading, error, refresh, cancelBooking } = useBookings();
  const { handleError } = useApiError();
  const [refreshing, setRefreshing] = React.useState(false);
  const toast = useToast();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleCancel = async (id: string) => {
    try {
      await cancelBooking(id);
      toast.show({
        placement: "top",
        render: ({ id: tId }) => (
          <Toast
            nativeID={`toast-${tId}`}
            action="success"
            variant="solid"
            className="bg-error-600 rounded-3xl p-6 mt-12 shadow-2xl"
          >
            <HStack space="sm" className="items-center">
              <XCircle color="white" size={20} />
              <ToastTitle className="text-white font-bold text-xl">
                Booking Cancelled
              </ToastTitle>
            </HStack>
          </Toast>
        ),
      });
    } catch (err) {
      handleError(err, "ActivityScreen.handleCancel");
    }
  };

  if (isLoading) return <ActivityScreenSkeleton />;

  return (
    <SafeAreaView className="flex-1  px-5">
      <HStack className="justify-between items-center py-4 mb-4">
        <Text className="text-white font-bold text-2xl">Storks</Text>
        <Text className="text-brand font-bold text-3xl">Activity</Text>
      </HStack>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E66B00"
          />
        }
      >
        <Text className="text-white font-bold text-3xl mb-8">Today</Text>

        {error && (
          <Box className="bg-error-50 border border-error-300 rounded-2xl px-4 py-3 mb-6">
            <Text className="text-error-600 text-sm text-center">{error}</Text>
          </Box>
        )}

        {bookings.map((booking) => (
          <EventCard key={booking.id} booking={booking} onCancel={handleCancel} />
        ))}

        {bookings.length === 0 && !error && (
          <Box className="py-20 items-center">
            <Text className="text-typography-500 text-xl">
              No active bookings for today.
            </Text>
          </Box>
        )}

        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
