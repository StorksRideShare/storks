import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, Users, Plus } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { useParentStore } from "@/src/store/parentStore";

export default function GroupsListScreen() {
  const { groups } = useParentStore();

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#E66B00" />
        </Pressable>
        <Text className="text-brand font-bold text-xl">My Groups</Text>
        <Pressable
          onPress={() => router.push("/(children)/add")}
          className="w-9 h-9 rounded-full border border-brand items-center justify-center"
        >
          <Plus size={18} color="#E66B00" />
        </Pressable>
      </HStack>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {groups.length === 0 ? (
          <Box className="border border-dashed border-brand/50 rounded-[18px] p-6 mt-6 bg-[#1a0c00] items-center">
            <Users size={40} color="#E66B00" style={{ marginBottom: 12 }} />
            <Text className="text-white text-base font-semibold text-center mb-2">
              No groups yet
            </Text>
            <Text className="text-typography-500 text-sm text-center mb-4">
              Add a child to create your first group and start booking rides.
            </Text>
            <Button
              className="bg-brand rounded-full h-12 px-6"
              onPress={() => router.push("/(children)/add")}
            >
              <ButtonText className="text-white font-bold">
                Add a Child
              </ButtonText>
            </Button>
          </Box>
        ) : (
          <VStack space="sm" className="mt-4">
            {groups.map((group) => {
              const hasDriver = !!group.driver;
              const childNames = group.children
                .map((c) => c.firstName)
                .join(", ");

              return (
                <Pressable
                  key={group.id}
                  onPress={() =>
                    router.push(`/(groups)/${group.id}`)
                  }
                >
                  <HStack
                    className="border border-outline-700 rounded-[18px] p-4 items-center"
                    space="sm"
                  >
                    <Avatar size="md" className="bg-purple-300">
                      <AvatarFallbackText>
                        {group.groupName[0]}
                      </AvatarFallbackText>
                    </Avatar>
                    <VStack className="flex-1">
                      <Text className="text-white font-bold text-base">
                        {group.groupName}
                      </Text>
                      <Text className="text-typography-500 text-sm">
                        {childNames || "No children added"}
                      </Text>
                      <Box
                        className={`self-start rounded-full px-2.5 py-0.5 mt-1 ${
                          hasDriver
                            ? "bg-success-500/20 border border-success-500/50"
                            : "bg-outline-700"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold uppercase ${
                            hasDriver
                              ? "text-success-500"
                              : "text-typography-500"
                          }`}
                        >
                          {hasDriver
                            ? `Driver: ${group.driver!.fullName.split(" ")[0]}`
                            : "No driver"}
                        </Text>
                      </Box>
                    </VStack>
                    <ChevronRight size={18} color="#7A726E" />
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        )}
        <Box className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}