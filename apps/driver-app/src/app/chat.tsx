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
      href={{ pathname: "/chat/[id]", params: { id: room.roomId, name: displayName } }}
      asChild
    >
      <Pressable>
        <HStack
          space="md"
          style={{ alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderColor: "#333" }}
        >
          <Avatar size="md" style={{ backgroundColor: "#ffb74d" }}>
            <AvatarFallbackText>{initials}</AvatarFallbackText>
          </Avatar>
          <VStack style={{ flex: 1 }}>
            <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "white", fontWeight: "bold" }}>{displayName}</Text>
              {lastAt && (
                <Text style={{ color: "#aaa", fontSize: 12 }}>{lastAt}</Text>
              )}
            </HStack>
            <Text
              style={{ color: "#aaa", fontSize: 14, marginTop: 2 }}
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
  const api = useApiClient("live-messaging");

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
        console.error("Chat fetch error", err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    fetchRooms();
  }, [api]);

  if (loading) return <ChatListSkeleton />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <HStack style={{ paddingHorizontal: 20, paddingVertical: 16, alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 24 }}>Messages</Text>
      </HStack>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {rooms.length === 0 ? (
          <Box style={{ flex: 1, paddingVertical: 96, alignItems: "center" }}>
            <Text style={{ color: "#aaa", fontSize: 18 }}>No conversations yet.</Text>
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
