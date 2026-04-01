import React, { useEffect } from "react";
import { ScrollView, RefreshControl, Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/expo";
import { useParentStore } from "@/src/store/parentStore";
import { router } from "expo-router";
import { MapPin, Phone, MessageSquare, ChevronRight } from "lucide-react-native";

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { 
    groups, 
    isLoadingGroups, 
    refreshDashboard 
  } = useParentStore();

  useEffect(() => {
    const init = async () => {
      const token = await getToken();
      if (token) refreshDashboard(token);
    };
    init();
  }, [getToken]);

  const onRefresh = React.useCallback(async () => {
    const token = await getToken();
    if (token) await refreshDashboard(token);
  }, [getToken]);

  return (
    <SafeAreaView className="flex-1 bg-[#0F0E0E]">
      <HStack className="px-5 py-4 items-center justify-between">
        <VStack>
          <Text className="text-gray-400 text-sm">Welcome back,</Text>
          <Text className="text-white font-bold text-2xl">{user?.firstName || "Parent"}</Text>
        </VStack>
        <Pressable onPress={() => router.push("/modal")}>
          <Avatar size="md" className="bg-[#E66B00]">
            <AvatarFallbackText>{user?.firstName?.[0]}</AvatarFallbackText>
            <AvatarImage source={{ uri: user?.imageUrl }} />
          </Avatar>
        </Pressable>
      </HStack>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoadingGroups} onRefresh={onRefresh} tintColor="#E66B00" />
        }
      >
        {/* Child Status Cards */}
        <Text className="text-white font-bold text-xl mt-6 mb-4">Children Status</Text>
        {groups.map((group) => (
          <VStack key={group.id} space="md" className="mb-6">
            {group.children.map((child) => (
              <Box key={child.id} className="bg-[#1A1919] p-5 rounded-[28px] border border-[#333]">
                <HStack className="items-center justify-between mb-4">
                  <HStack space="md" className="items-center">
                    <Avatar className="bg-purple-200">
                      <AvatarFallbackText>{child.firstName[0]}{child.lastName[0]}</AvatarFallbackText>
                    </Avatar>
                    <VStack>
                      <Text className="text-white font-bold text-lg">{child.firstName} {child.lastName}</Text>
                      <Text className="text-gray-400 text-xs">{child.grade} • {child.schoolName}</Text>
                    </VStack>
                  </HStack>
                  <Box className={`px-3 py-1 rounded-full ${child.isAbsent ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                    <Text className={`text-[10px] font-bold uppercase ${child.isAbsent ? 'text-red-500' : 'text-green-500'}`}>
                      {child.isAbsent ? 'Absent' : 'Active'}
                    </Text>
                  </Box>
                </HStack>

                <VStack space="sm" className="mb-4">
                  <HStack space="xs" className="items-center">
                    <MapPin size={14} color="#666" />
                    <Text className="text-gray-400 text-sm" numberOfLines={1}>{child.pickupAddress}</Text>
                  </HStack>
                  <View className="h-[1px] bg-[#333] w-full my-1" />
                  <HStack className="justify-between items-center">
                    <VStack>
                      <Text className="text-gray-500 text-[10px] uppercase font-bold">Today's Pickup</Text>
                      <Text className="text-white font-bold">{child.todayPickup.status === 'en_route' ? 'En Route' : child.todayPickup.estimatedTime}</Text>
                    </VStack>
                    <Button variant="outline" className="border-orange-500 h-10 rounded-full px-4" onPress={() => router.push(`/track?childId=${child.id}`)}>
                      <ButtonText className="text-orange-500 text-sm">Track</ButtonText>
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>
        ))}

        {groups.length === 0 && !isLoadingGroups && (
          <Box className="bg-[#1A1919] p-8 rounded-[32px] items-center justify-center mt-10 border border-dashed border-[#444]">
            <Text className="text-gray-500 text-center text-lg mb-4">No active groups or drivers found.</Text>
            <Button className="bg-[#E66B00] rounded-full h-12" onPress={() => router.push("/offer")}>
              <ButtonText>Request a Ride</ButtonText>
            </Button>
          </Box>
        )}

        {/* Quick Actions */}
        <Text className="text-white font-bold text-xl mt-4 mb-4">Quick Actions</Text>
        <HStack space="md" className="mb-10">
          <Pressable className="flex-1 bg-[#1A1919] p-5 rounded-[24px] border border-[#333] items-center" onPress={() => router.push("/activity")}>
             <Box className="bg-orange-500/10 p-3 rounded-2xl mb-2">
                <ChevronRight color="#E66B00" size={24} />
             </Box>
             <Text className="text-white font-bold text-xs">Activity</Text>
          </Pressable>
          <Pressable className="flex-1 bg-[#1A1919] p-5 rounded-[24px] border border-[#333] items-center" onPress={() => router.push("/calendar")}>
             <Box className="bg-purple-500/10 p-3 rounded-2xl mb-2">
                <ChevronRight color="#C084FC" size={24} />
             </Box>
             <Text className="text-white font-bold text-xs">Schedule</Text>
          </Pressable>
          <Pressable className="flex-1 bg-[#1A1919] p-5 rounded-[24px] border border-[#333] items-center" onPress={() => router.push("/chat")}>
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

const View = Box as any;
