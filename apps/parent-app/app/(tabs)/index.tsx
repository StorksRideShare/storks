import React from "react";
import { ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import { MapPin, MessageSquare, ChevronRight, Calendar } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { useParentDashboard } from "@/src/hooks/useParentDashboard";
import { HomeScreenSkeleton } from "@/components/skeletons/HomeScreenSkeleton";
import type { DriverGroup } from "@/utils/api";

function ChildCard({ group }: { group: DriverGroup }) {
  return (
    <VStack space="md" className="mb-6">
      {group.children?.map((child) => (
        <Box
          key={child.id}
          className="  p-5 rounded-[28px] border border-outline-700"
        >
          <HStack className="items-center justify-between mb-4">
            <HStack space="md" className="items-center">
              <Avatar className="bg-purple-200">
                <AvatarFallbackText>
                  {child.firstName[0]}{child.lastName[0]}
                </AvatarFallbackText>
              </Avatar>
              <VStack>
                <Text className="text-white font-bold text-lg">
                  {child.firstName} {child.lastName}
                </Text>
                <Text className="text-typography-500 text-xs">
                  {child.grade} • {child.schoolName}
                </Text>
              </VStack>
            </HStack>
            <Box
              className={`px-3 py-1 rounded-full ${child.isAbsent ? "bg-error-500/20" : "bg-success-500/20"}`}
            >
              <Text
                className={`text-[10px] font-bold uppercase ${child.isAbsent ? "text-error-500" : "text-success-600"}`}
              >
                {child.isAbsent ? "Absent" : "Active"}
              </Text>
            </Box>
          </HStack>

          <VStack space="sm" className="mb-4">
            <HStack space="xs" className="items-center">
              <MapPin size={14} color="#7A726E" />
              <Text className="text-typography-500 text-sm flex-1" numberOfLines={1}>
                {child.pickupAddress}
              </Text>
            </HStack>
            <Box className="h-px bg-outline-700 w-full my-1" />
            <HStack className="justify-between items-center">
              <VStack>
                <Text className="text-typography-500 text-[10px] uppercase font-bold">
                  Today's Pickup
                </Text>
                <Text className="text-white font-bold">
                  {child.todayPickup.status === "en_route"
                    ? "En Route"
                    : child.todayPickup.estimatedTime}
                </Text>
              </VStack>
              <Button
                variant="outline"
                className="border-brand h-10 rounded-full px-4"
                onPress={() => router.push(`/(track)?childId=${child.id}`)}
              >
                <ButtonText className="text-brand text-sm">Track</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}

export default function HomeScreen() {
  const { user } = useUser();
  const { groups, isLoading, error, refresh } = useParentDashboard();

  if (isLoading) return <HomeScreenSkeleton />;

  return (
    <SafeAreaView className="flex-1 ">
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-between">
        <VStack>
          <Text className="text-typography-500 text-sm">Welcome back,</Text>
          <Text className="text-white font-bold text-2xl">
            {user?.firstName || "Parent"}
          </Text>
        </VStack>
        <Pressable onPress={() => router.push("/modal")}>
          <Avatar size="md" className="bg-brand">
            <AvatarFallbackText>{user?.firstName?.[0]}</AvatarFallbackText>
            <AvatarImage source={{ uri: user?.imageUrl }} />
          </Avatar>
        </Pressable>
      </HStack>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor="#E66B00"
          />
        }
      >
        {/* API error banner */}
        {error && (
          <Box className="bg-error-50 border border-error-300 rounded-2xl px-4 py-3 mb-4">
            <Text className="text-error-600 text-sm text-center">{error}</Text>
          </Box>
        )}

        {/* Children Status */}
        <Text className="text-white font-bold text-xl mt-6 mb-4">
          Children Status
        </Text>

        {groups?.map((group) => (
          <ChildCard key={group.id} group={group} />
        ))}

        {(!groups || groups.length === 0) && !isLoading && (
          <Box className="  p-8 rounded-[32px] items-center justify-center mt-10 border border-dashed border-outline-600">
            <Text className="text-typography-500 text-center text-lg mb-4">
              No active groups or drivers found.
            </Text>
            <Button
              className="bg-brand rounded-full h-12"
              onPress={() => router.push("/(offer)")}
            >
              <ButtonText>Request a Ride</ButtonText>
            </Button>
          </Box>
        )}

        {/* Quick Actions */}
        <Text className="text-white font-bold text-xl mt-4 mb-4">
          Quick Actions
        </Text>
        <HStack space="md" className="mb-10">
          <Pressable
            className="flex-1   p-5 rounded-[24px] border border-outline-700 items-center"
            onPress={() => router.push("/(tabs)/activity")}
          >
            <Box className="bg-brand/10 p-3 rounded-2xl mb-2">
              <ChevronRight color="#E66B00" size={24} />
            </Box>
            <Text className="text-white font-bold text-xs">Activity</Text>
          </Pressable>

          <Pressable
            className="flex-1   p-5 rounded-[24px] border border-outline-700 items-center"
            onPress={() => router.push("/(tabs)/calendar")}
          >
            <Box className="bg-purple-500/10 p-3 rounded-2xl mb-2">
              <Calendar color="#C084FC" size={24} />
            </Box>
            <Text className="text-white font-bold text-xs">Schedule</Text>
          </Pressable>

          <Pressable
            className="flex-1   p-5 rounded-[24px] border border-outline-700 items-center"
            onPress={() => router.push("/(tabs)/chat")}
          >
            <Box className="bg-blue-500/10 p-3 rounded-2xl mb-2">
              <MessageSquare color="#60A5FA" size={24} />
            </Box>
            <Text className="text-white font-bold text-xs">Chat</Text>
          </Pressable>
        </HStack>

        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
