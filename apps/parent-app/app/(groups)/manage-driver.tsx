import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Phone, Star } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { useParentStore } from "@/src/store/parentStore";

export default function ManageDriverScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { groups } = useParentStore();
  const group = groups.find((g) => g.id === groupId);
  const driver = group?.driver;

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const handleCall = () => {
    if (driver?.phone) {
      Alert.alert("Call Driver", `Calling ${driver.fullName}…`);
    }
  };

  const handleChangeDriver = () => {
    router.push(`/(driver)/SearchScreen?groupId=${groupId}`);
  };

  if (!driver) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-5">
        <Text className="text-white text-center mb-4">
          No driver assigned to this group.
        </Text>
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
        className="h-44 relative"
        style={{ backgroundColor: "#7c3aed" }}
      >
        <Pressable
          onPress={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 bg-black/30 rounded-full items-center justify-center"
        >
          <ChevronLeft size={20} color="#E66B00" />
        </Pressable>
        <Pressable className="absolute bottom-4 right-4 bg-brand rounded-full px-4 py-1.5">
          <Text className="text-white text-xs font-bold">edit group</Text>
        </Pressable>
      </Box>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Title breadcrumb */}
        <HStack space="xs" className="items-center mt-4 mb-1">
          <Text className="text-brand font-bold text-2xl">
            {group?.groupName}
          </Text>
          <Text className="text-white text-2xl font-bold"> › Manage Driver</Text>
        </HStack>
        <Box className="h-px bg-outline-800 mb-6" />

        {/* Driver section label */}
        <Text className="text-white font-bold text-base mb-3">Driver</Text>

        {/* Driver card */}
        <Box className="border border-outline-700 rounded-[18px] p-4 mb-8">
          <HStack space="sm" className="items-start">
            <Avatar size="md" className="bg-purple-300">
              <AvatarFallbackText>{driver.fullName[0]}</AvatarFallbackText>
            </Avatar>
            <VStack className="flex-1">
              <Text className="text-white font-bold text-base">
                {driver.fullName}
              </Text>
              <Text className="text-typography-500 text-sm">
                {driver.vehicleModel}
              </Text>
              <Box className="border border-outline-600 rounded-lg px-3 py-0.5 self-start mt-2">
                <Text className="text-typography-400 text-xs">4 months</Text>
              </Box>
            </VStack>
            <VStack className="items-end">
              <Text className="text-brand font-bold text-sm">
                {driver.vehicleNumber}
              </Text>
              <Box className="border border-success-500 rounded-lg px-3 py-0.5 mt-2">
                <Text className="text-success-500 text-xs font-bold">Paid</Text>
              </Box>
            </VStack>
          </HStack>
        </Box>

        {/* Star rating */}
        <HStack className="justify-center mb-6" space="sm">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              activeOpacity={0.7}
            >
              <Star
                size={36}
                color="#E66B00"
                fill={star <= (hovered || rating) ? "#E66B00" : "transparent"}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          ))}
        </HStack>

        {/* Add review */}
        <Button className="bg-transparent border border-white h-14 rounded-full mb-6">
          <ButtonText className="text-white font-bold">
            Add your review
          </ButtonText>
        </Button>

        <Box className="h-px bg-outline-800 mb-6" />

        <Box className="h-32" />
      </ScrollView>

      {/* Action buttons */}
      <Box className="px-5 pb-6 pt-2">
        <VStack space="sm">
          <Button
            className="bg-brand h-14 rounded-full"
            onPress={handleCall}
          >
            <HStack space="xs" className="items-center">
              <Phone size={16} color="white" />
              <ButtonText className="text-white font-bold">
                Call Driver
              </ButtonText>
            </HStack>
          </Button>
          <Button
            className="bg-transparent border border-white h-14 rounded-full"
            onPress={handleChangeDriver}
          >
            <ButtonText className="text-white font-bold">
              Change Driver
            </ButtonText>
          </Button>
        </VStack>
      </Box>
    </SafeAreaView>
  );
}
