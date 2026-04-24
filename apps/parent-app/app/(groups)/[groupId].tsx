import React, { useEffect, useState } from "react";
import { ScrollView, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Pencil,
  Search,
  Users,
  MapPin,
  Phone,
  Star,
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

// ── Types ──────────────────────────────────────────────────────────────────────
interface GroupDetail {
  id: string;
  groupName: string;
  children: Array<{
    id: string;
    firstName: string;
    lastName: string;
    age?: number;
    pickupAddress: string;
    dropoffAddress: string;
  }>;
  driver?: {
    id: string;
    fullName: string;
    vehicleModel: string;
    vehicleNumber: string;
    phone?: string;
    rating?: number;
    monthsActive?: number;
    isPaid?: boolean;
  } | null;
}

// ── Section label ──────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="text-white font-bold text-base mt-6 mb-3">{label}</Text>
  );
}

// ── Member / Pickup / Dropoff row ──────────────────────────────────────────────
function InfoRow({
  name,
  sub,
  onEdit,
}: {
  name: string;
  sub: string;
  onEdit?: () => void;
}) {
  return (
    <HStack className="items-center py-2" space="sm">
      <Avatar size="sm" className="bg-purple-300">
        <AvatarFallbackText>{name[0]}</AvatarFallbackText>
      </Avatar>
      <VStack className="flex-1">
        <Text className="text-white font-semibold text-sm">{name}</Text>
        <Text className="text-typography-500 text-xs">{sub}</Text>
      </VStack>
      {onEdit && (
        <Pressable onPress={onEdit} className="p-2">
          <Pencil size={16} color="#E66B00" />
        </Pressable>
      )}
    </HStack>
  );
}

// ── Group detail screen ────────────────────────────────────────────────────────
export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { groups } = useParentStore();
  const api = useApiClient("booking-and-payment");

  // Try to get from store first (fast), then fall back to API
  const storeGroup = groups.find((g) => g.id === groupId);
  const [detail, setDetail] = useState<GroupDetail | null>(
    storeGroup
      ? {
          id: storeGroup.id,
          groupName: storeGroup.groupName,
          children: storeGroup.children.map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            pickupAddress: c.pickupAddress,
            dropoffAddress: c.dropoffAddress,
          })),
          driver: storeGroup.driver
            ? {
                id: storeGroup.driver.id,
                fullName: storeGroup.driver.fullName,
                vehicleModel: storeGroup.driver.vehicleModel,
                vehicleNumber: storeGroup.driver.vehicleNumber,
                phone: storeGroup.driver.phone,
                rating: storeGroup.driver.rating,
              }
            : null,
        }
      : null
  );
  const [loading, setLoading] = useState(!storeGroup);

  useEffect(() => {
    if (!storeGroup && groupId) {
      api
        .get<GroupDetail>(`/child-groups/${groupId}`)
        .then(setDetail)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [groupId]);

  const hasChildren = (detail?.children?.length ?? 0) > 0;
  const hasDriver = !!detail?.driver;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator color="#E66B00" size="large" />
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-5">
        <Text className="text-white text-center mb-4">Group not found.</Text>
        <Button
          className="bg-brand rounded-full"
          onPress={() => router.back()}
        >
          <ButtonText>Go Back</ButtonText>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      {/* Cover banner */}
      <Box
        className="h-44 bg-gradient-to-b from-purple-400 to-purple-700 relative"
        style={{ backgroundColor: "#7c3aed" }}
      >
        <Pressable
          onPress={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 bg-black/30 rounded-full items-center justify-center"
        >
          <ChevronLeft size={20} color="#E66B00" />
        </Pressable>
        {/* Edit group pill */}
        <Pressable className="absolute bottom-4 right-4 bg-brand rounded-full px-4 py-1.5">
          <Text className="text-white text-xs font-bold">edit group</Text>
        </Pressable>
      </Box>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Group name */}
        <Text className="text-brand font-bold text-3xl mt-4 mb-1">
          {detail.groupName}
        </Text>
        <Box className="h-px bg-outline-800 mb-2" />

        {/* ── Members ── */}
        <SectionLabel label="Members" />
        {hasChildren ? (
          detail.children.map((child) => (
            <InfoRow
              key={child.id}
              name={`${child.firstName} ${child.lastName}`}
              sub={child.age ? `Age ${child.age}` : "Child"}
              onEdit={() => {}}
            />
          ))
        ) : (
          <Box className="border border-dashed border-brand/50 rounded-[16px] p-4 bg-[#1a0c00]">
            <HStack className="items-center justify-between">
              <Text className="text-white text-sm flex-1 leading-5">
                This group has no children.{"\n"}Would you like to add one?
              </Text>
              <Pressable
                onPress={() => router.push("/(children)/add")}
                className="w-8 h-8 rounded-full border-2 border-brand items-center justify-center"
              >
                <Text className="text-brand text-lg font-bold">+</Text>
              </Pressable>
            </HStack>
          </Box>
        )}

        {/* ── Pick Up ── */}
        <SectionLabel label="Pick up" />
        {hasChildren ? (
          detail.children.map((child) => (
            <InfoRow
              key={child.id}
              name={`${child.firstName} ${child.lastName}`}
              sub={child.pickupAddress || "Home"}
              onEdit={() => {}}
            />
          ))
        ) : (
          <Box className="border border-outline-700 rounded-[14px] p-4">
            <Text className="text-typography-500 text-sm">
              Add a child first
            </Text>
          </Box>
        )}

        {/* ── Drop Off ── */}
        <SectionLabel label="Drop off" />
        {hasChildren ? (
          detail.children.map((child) => (
            <InfoRow
              key={child.id}
              name={`${child.firstName} ${child.lastName}`}
              sub={child.dropoffAddress || "School"}
              onEdit={() => {}}
            />
          ))
        ) : (
          <Box className="border border-outline-700 rounded-[14px] p-4">
            <Text className="text-typography-500 text-sm">
              Add a child first
            </Text>
          </Box>
        )}

        {/* ── Driver ── */}
        <SectionLabel label="Driver" />
        {hasDriver ? (
          <Box className="border border-outline-700 rounded-[18px] p-4 mb-2">
            <HStack space="sm" className="items-start">
              <Avatar size="md" className="bg-purple-300">
                <AvatarFallbackText>
                  {detail.driver!.fullName[0]}
                </AvatarFallbackText>
              </Avatar>
              <VStack className="flex-1">
                <Text className="text-white font-bold text-base">
                  {detail.driver!.fullName}
                </Text>
                <Text className="text-typography-500 text-sm">
                  {detail.driver!.vehicleModel}
                </Text>
                {detail.driver!.monthsActive !== undefined && (
                  <Box className="border border-outline-600 rounded-lg px-3 py-0.5 self-start mt-1">
                    <Text className="text-typography-400 text-xs">
                      {detail.driver!.monthsActive} months
                    </Text>
                  </Box>
                )}
              </VStack>
              <VStack className="items-end">
                <Text className="text-brand font-bold text-sm">
                  {detail.driver!.vehicleNumber}
                </Text>
                {detail.driver!.isPaid && (
                  <Box className="border border-success-500 rounded-lg px-3 py-0.5 mt-1">
                    <Text className="text-success-500 text-xs font-bold">
                      Paid
                    </Text>
                  </Box>
                )}
              </VStack>
            </HStack>
          </Box>
        ) : (
          <Box className="border border-dashed border-brand/50 rounded-[16px] p-4 bg-[#1a0c00] mb-2">
            <HStack className="items-center justify-between">
              <Text className="text-white text-sm flex-1 pr-3 leading-5">
                This group has no driver. Would you like to search a driver who
                serve these destinations?
              </Text>
              <Search size={22} color="#E66B00" />
            </HStack>
          </Box>
        )}

        <Box className="h-32" />
      </ScrollView>

      {/* ── Action buttons ── */}
      <Box className="px-5 pb-6 pt-2">
        {hasDriver ? (
          <HStack space="sm">
            <Button className="flex-1 bg-brand h-14 rounded-full">
              <HStack space="xs" className="items-center">
                <Phone size={16} color="white" />
                <ButtonText className="text-white font-bold">
                  Call Driver
                </ButtonText>
              </HStack>
            </Button>
            <Button
              className="flex-1 bg-transparent border border-white h-14 rounded-full"
              onPress={() =>
                router.push(
                  `/(groups)/manage-driver?groupId=${detail.id}`
                )
              }
            >
              <ButtonText className="text-white font-bold">
                Manage Driver
              </ButtonText>
            </Button>
          </HStack>
        ) : (
          <Button
            className={`h-14 rounded-full w-full ${
              hasChildren
                ? "bg-transparent border border-white"
                : "bg-outline-700"
            }`}
            isDisabled={!hasChildren}
            onPress={() =>
              router.push(
                `/(driver)/SearchScreen?groupId=${detail.id}`
              )
            }
          >
            <HStack space="sm" className="items-center">
              <Search size={16} color="white" />
              <ButtonText className="text-white font-bold">
                Search a Driver
              </ButtonText>
            </HStack>
          </Button>
        )}
      </Box>
    </SafeAreaView>
  );
}
