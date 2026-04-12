import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { useUser } from "@clerk/expo";
import { Link, router } from "expo-router";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useApiClient } from "@/middleware/apiClient";
import { ChatListSkeleton } from "@/components/skeletons/ChatListSkeleton";
import { useApiError } from "@/src/hooks/useApiError";
import type { ChatRoom } from "@/utils/api";

function ChatCard({ room, currentUserId }: { room: ChatRoom; currentUserId: string }) {
  const other = room.participants.find((p) => p.providerUserId !== currentUserId);
  const displayName = other
    ? `${other.firstName ?? ""} ${other.lastName ?? ""}`.trim()
    : "Unknown";
  const initials = other
    ? `${other.firstName?.[0] ?? ""}${other.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";
  const lastMessage = room.lastMessageContent ?? "";
  const lastAt = room.lastMessageSentAt
    ? new Date(room.lastMessageSentAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Link
      href={{ pathname: "/chats/[id]", params: { id: room.roomId, name: displayName } }}
      asChild
    >
      <Pressable>
        <HStack
          space="md"
          className="items-center px-4 py-4 border-b border-outline-800"
        >
          <Avatar size="md" className="bg-purple-200">
            <AvatarFallbackText>{initials}</AvatarFallbackText>
          </Avatar>
          <VStack className="flex-1">
            <HStack className="justify-between items-center">
              <Text className="text-white font-bold">{displayName}</Text>
              {lastAt && (
                <Text className="text-typography-500 text-xs">{lastAt}</Text>
              )}
            </HStack>
            <Text
              className="text-typography-500 text-sm mt-0.5"
              numberOfLines={1}
            >
              {lastMessage || "Tap to start chatting"}
            </Text>
          </VStack>
        </HStack>
      </Pressable>
    </Link>
  );
}

export default function ChatScreen() {
  const { user } = useUser();
  // live-messaging service on port 8085
  const api = useApiClient("live-messaging");
  const { handleError } = useApiError();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        // Correct path — apiClient already prepends /api/v1
        const data = await api.get<ChatRoom[]>("/chats");
        if (mountedRef.current) {
          const sorted = [...data].sort((a, b) => {
            const ta = a.lastMessageSentAt ? new Date(a.lastMessageSentAt).getTime() : 0;
            const tb = b.lastMessageSentAt ? new Date(b.lastMessageSentAt).getTime() : 0;
            return tb - ta;
          });
          setRooms(sorted);
        }
      } catch (err) {
        if (mountedRef.current) handleError(err, "ChatScreen.fetchRooms");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    fetchRooms();
  }, [api]);

  if (loading) return <ChatListSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-background-950">
      <HStack className="px-5 py-4 items-center justify-between">
        <Text className="text-white font-bold text-2xl">Messages</Text>
        <Pressable
          onPress={() => router.push("/modal")}
          className="bg-brand/10 p-2.5 rounded-full"
        >
          <Plus color="#E66B00" size={22} />
        </Pressable>
      </HStack>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {rooms.length === 0 ? (
          <Box className="flex-1 py-24 items-center">
            <Text className="text-typography-500 text-lg">No conversations yet.</Text>
          </Box>
        ) : (
          rooms.map((room) => (
            <ChatCard
              key={room.roomId}
              room={room}
              currentUserId={user?.id ?? ""}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
