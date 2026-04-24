import React, { useEffect, useState } from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Pencil } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { useApiClient } from "@/middleware/apiClient";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  age?: number;
  schoolName?: string;
  pickupAddress?: string;
}

function ChildRow({ child, onEdit }: { child: Child; onEdit: () => void }) {
  const label = child.schoolName || child.pickupAddress || "Home";
  const fallback = `${child.firstName[0]}${child.lastName[0]}`;
  return (
    <HStack className="items-center py-3 border-b border-outline-800" space="md">
      <Avatar className="bg-purple-300" size="md">
        <AvatarFallbackText>{fallback}</AvatarFallbackText>
      </Avatar>
      <VStack className="flex-1">
        <Text className="text-white font-semibold text-base">
          {child.firstName} {child.lastName}
        </Text>
        <Text className="text-typography-500 text-sm">{label}</Text>
      </VStack>
      <Pressable onPress={onEdit} className="p-2">
        <Pencil size={18} color="#E66B00" />
      </Pressable>
    </HStack>
  );
}

export default function ChildrenScreen() {
  const api = useApiClient("user-service");
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Child[]>("/parent/children")
      .then(setChildren)
      .catch(() => setChildren([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#E66B00" />
        </Pressable>
        <Text className="text-brand font-bold text-xl">My children</Text>
        <Box className="w-8" />
      </HStack>

      {loading ? (
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E66B00" />
        </Box>
      ) : (
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Empty state */}
          {children.length === 0 && (
            <Box className="border border-dashed border-brand/50 rounded-[18px] p-5 mt-6 bg-[#1a0c00]">
              <Text className="text-white text-sm text-center leading-5">
                You currently don't have a child profile set up.{"\n"}
                Create one to fully unlock the use of Storks.{"\n"}
                Click here to add a new child profile.
              </Text>
            </Box>
          )}

          {/* Children list */}
          {children.map((child) => (
            <ChildRow
              key={child.id}
              child={child}
              onEdit={() => {
                // TODO: navigate to edit screen
              }}
            />
          ))}

          <Box className="h-6" />
        </ScrollView>
      )}

      {/* Add a child button */}
      <Box className="px-5 pb-6 pt-2">
        <Button
          className="bg-brand h-14 rounded-full"
          onPress={() => router.push("/(children)/add")}
        >
          <ButtonText className="text-white font-bold text-base">
            Add a child
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}
