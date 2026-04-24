import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  EyeOff,
  Users,
} from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { useApiClient } from "@/middleware/apiClient";
import { useParentStore } from "@/src/store/parentStore";
import Svg, { Path } from "react-native-svg";

// ── Orange arc card decoration ─────────────────────────────────────────────────
function CardArcs() {
  return (
    <Svg
      width={64}
      height={64}
      viewBox="0 0 64 64"
      style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.9 }}
    >
      <Path
        d="M64 64 A64 64 0 0 0 0 0"
        fill="none"
        stroke="rgba(230,107,0,0.12)"
        strokeWidth="20"
      />
      <Path
        d="M64 64 A46 46 0 0 0 18 18"
        fill="none"
        stroke="rgba(230,107,0,0.18)"
        strokeWidth="20"
      />
      <Path
        d="M64 64 A30 30 0 0 0 34 34"
        fill="none"
        stroke="rgba(230,107,0,0.28)"
        strokeWidth="20"
      />
    </Svg>
  );
}

// ── Driver card ────────────────────────────────────────────────────────────────
interface OfferItem {
  offerId: string;
  driverName: string;
  vehicleName?: string;
  plate?: string;
  seatsAvailable?: number;
  totalSeats?: number;
  hasAC?: boolean;
  hasNFC?: boolean;
  isVerified?: boolean;
}

function DriverCard({
  offer,
  groupId,
  hidden,
  onHide,
}: {
  offer: OfferItem;
  groupId: string | undefined;
  hidden: boolean;
  onHide: () => void;
}) {
  if (hidden) return null;

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/(driver)/details?offerId=${offer.offerId}&groupId=${groupId ?? ""}`
        )
      }
    >
      <Box className="bg-white rounded-[20px] p-4 mb-4 overflow-hidden">
        <HStack space="sm" className="items-start">
          {/* Avatar */}
          <Avatar size="md" className="bg-purple-300">
            <AvatarFallbackText>{offer.driverName[0]}</AvatarFallbackText>
          </Avatar>

          {/* Info */}
          <VStack className="flex-1">
            <HStack space="xs" className="items-center">
              <Text className="text-brand font-bold text-base">
                {offer.driverName}
              </Text>
              {offer.isVerified && (
                <ShieldCheck size={14} color="#E66B00" />
              )}
            </HStack>
            <Text className="text-gray-500 text-sm">{offer.vehicleName}</Text>
            {offer.plate && (
              <Box className="bg-brand self-start rounded-full px-2.5 py-0.5 mt-1">
                <Text className="text-white text-[11px] font-bold">
                  {offer.plate}
                </Text>
              </Box>
            )}
          </VStack>

          {/* Hide button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onHide();
            }}
            className="bg-brand rounded-full px-3 py-1"
          >
            <Text className="text-white text-xs font-bold">Hide</Text>
          </TouchableOpacity>
        </HStack>

        {/* Chips row */}
        <HStack space="sm" className="mt-3">
          {offer.seatsAvailable !== undefined && (
            <Box className="border border-gray-300 rounded-lg px-2 py-1">
              <HStack space="xs" className="items-center">
                <Users size={11} color="#555" />
                <Text className="text-gray-600 text-xs">
                  {offer.seatsAvailable}/{offer.totalSeats ?? "?"}
                </Text>
              </HStack>
            </Box>
          )}
          {offer.hasAC && (
            <Box className="border border-gray-300 rounded-lg px-2 py-1">
              <Text className="text-gray-600 text-xs">AC</Text>
            </Box>
          )}
          {offer.hasNFC && (
            <Box className="border border-gray-300 rounded-lg px-2 py-1">
              <Text className="text-gray-600 text-xs">NFC</Text>
            </Box>
          )}
        </HStack>

        <CardArcs />
      </Box>
    </Pressable>
  );
}

// ── Search Screen ──────────────────────────────────────────────────────────────
export default function SearchScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { groups } = useParentStore();
  const api = useApiClient("booking-and-payment");

  const selectedGroup = groups.find((g) => g.id === groupId) ?? groups[0];

  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<OfferItem[]>(
        `/offers/search?groupId=${selectedGroup?.id ?? ""}`
      );
      setOffers(data);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup?.id]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const hideOffer = (id: string) =>
    setHiddenIds((prev) => new Set(prev).add(id));

  const visibleCount = offers.filter((o) => !hiddenIds.has(o.offerId)).length;

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

      {/* Group selector */}
      {selectedGroup && (
        <Pressable className="mx-5 mb-3">
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
                {selectedGroup.children
                  .map((c) => c.firstName)
                  .join(", ")}
              </Text>
            </VStack>
            <ChevronDown size={18} color="#E66B00" />
          </HStack>
        </Pressable>
      )}


      {/* Divider + result count */}
      <Box className="h-px bg-outline-800 mx-5 mb-3" />
      {!loading && (
        <Text className="text-typography-400 text-sm text-center mb-3">
          Showing {visibleCount} results
        </Text>
      )}

      {/* Driver list */}
      {loading ? (
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E66B00" size="large" />
        </Box>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          {offers.length === 0 ? (
            <Box className="py-16 items-center">
              <Text className="text-typography-500 text-center text-base">
                No drivers found for this group's destinations.
              </Text>
            </Box>
          ) : (
            offers.map((offer) => (
              <DriverCard
                key={offer.offerId}
                offer={offer}
                groupId={selectedGroup?.id}
                hidden={hiddenIds.has(offer.offerId)}
                onHide={() => hideOffer(offer.offerId)}
              />
            ))
          )}
          <Box className="h-24" />
        </ScrollView>
      )}

      {/* Search Again */}
      <Box className="px-5 pb-6 pt-2">
        <Button
          className="bg-brand h-14 rounded-full"
          onPress={fetchOffers}
        >
          <ButtonText className="text-white font-bold">Search Again</ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}