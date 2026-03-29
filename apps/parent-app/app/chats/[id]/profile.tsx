import { View } from "@/components/Themed";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { useApiClient } from "@/middleware/apiClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Shield, User as UserIcon } from "lucide-react-native";
import { Pressable, ScrollView } from "react-native";

type Participant = {
  userId: string;
  providerUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type RoomDetail = {
  roomId: string;
  chatRoomType: string;
  participants: Participant[];
};

export default function ParticipantProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await api.get<RoomDetail>(`/api/v1/chats/${id}`);
        setRoom(data);
      } catch (error) {
        console.error("Failed to fetch room detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Spinner size="large" />
      </View>
    );
  }

  if (!room) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Room not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <HStack className="p-4 items-center" space="md">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Chat Info</Text>
      </HStack>

      <ScrollView className="flex-1">
        <VStack className="items-center py-8" space="lg">
          <Avatar size="2xl">
            <AvatarFallbackText>{room.participants[0]?.firstName}</AvatarFallbackText>
          </Avatar>
          <VStack className="items-center">
            <Text className="text-white text-2xl font-bold">
              {room.chatRoomType === "DIRECT" 
                ? "Direct Conversation" 
                : "Group Conversation"}
            </Text>
            <Text className="text-gray-400">Room ID: {room.roomId.slice(0, 8)}...</Text>
          </VStack>
        </VStack>

        <Divider className="bg-gray-800" />

        <Box className="p-6">
          <Text className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest">
            Participants ({room.participants.length})
          </Text>
          <VStack space="md">
            {room.participants.map((p) => (
              <HStack key={p.userId} className="items-center bg-gray-900 p-3 rounded-xl border border-gray-800" space="md">
                <Avatar size="sm">
                  <AvatarFallbackText>{p.firstName}</AvatarFallbackText>
                </Avatar>
                <VStack className="flex-1">
                  <Text className="text-white font-bold">{p.firstName} {p.lastName}</Text>
                  <HStack className="items-center" space="xs">
                    <Mail size={12} color="#666" />
                    <Text className="text-gray-500 text-xs">{p.email}</Text>
                  </HStack>
                </VStack>
                {p.role === "DRIVER" && (
                  <Box className="bg-orange-900/40 px-2 py-1 rounded border border-orange-800">
                    <Text className="text-orange-400 text-[10px] font-bold">DRIVER</Text>
                  </Box>
                )}
              </HStack>
            ))}
          </VStack>
        </Box>

        <Box className="p-6 pt-0">
          <Text className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest">
            Privacy & Security
          </Text>
          <VStack space="sm">
            <HStack className="items-center" space="sm">
              <Shield size={16} color="#4ade80" />
              <Text className="text-gray-300 text-sm">Messages are end-to-end encrypted</Text>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>

      <Box className="p-6">
        <Button variant="outline" className="border-red-500" action="negative" onPress={() => {}}>
          <ButtonText className="text-red-500">Delete Conversation</ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}
