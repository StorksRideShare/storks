import SystemNotification from "@/components/mobile/SystemNotification";
import { useNotify } from "@/components/mobile/Notify";
import {
  Avatar,
  AvatarFallbackText,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import Colors from "@/constants/Colors";
import { StompChatClient, ChatMessage } from "@/middleware/chatFunctions";
import { useApiClient, WS_BASE_URL } from "@/middleware/apiClient";
import { ChatRoomSkeleton } from "@/components/skeletons/ChatRoomSkeleton";
import { useUser, useSession } from "@clerk/expo";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send, Check, CheckCheck, Clock } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Check if the sent messages are supposed to be in the same group.
function sameGroup(a: ChatMessage, b: ChatMessage): boolean {
  if (a.senderId !== b.senderId) return false;
  if (!a.sentAt || !b.sentAt) return true; // temp messages
  return Math.abs(new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()) < 60_000;
}

export default function ChatRoom() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { user } = useUser();
  const { session } = useSession();
  const api = useApiClient("live-messaging");
  const notify = useNotify();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  /** Set of messageIds for which we received a READ_RECEIPT */
  const readIds = useRef<Set<string>>(new Set());

  const colors = Colors.dark;
  const scrollViewRef = useRef<ScrollView>(null);
  const stompClient = useRef<StompChatClient | null>(null);
  /** Backend UUID of the current user */
  const myBackendIdRef = useRef<string | null>(null);

  // Room name
  const displayName = (() => {
    if (room?.participants && user?.id) {
      const other = room.participants.find((p: any) => p.providerUserId !== user.id);
      if (other) return `${other.firstName ?? ""} ${other.lastName ?? ""}`.trim() || name || "Chat";
    }
    return name || "Chat";
  })();

  // keep ref in sync whenever room loads
  useEffect(() => {
    myBackendIdRef.current =
      room?.participants?.find((p: any) => p.providerUserId === user?.id)?.userId ?? null;
  }, [room, user?.id]);

    // fetch history
  const fetchHistory = async () => {
    try {
      const roomData = await api.get<any>(`/chats/${id}`);
      setRoom(roomData);
      const history = await api.get<any[]>(`/chats/${id}/messages/recent`);
      // Sort to newest at the bottom
      const sorted = [...history].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
      
      const myId = roomData?.participants?.find((p: any) => p.providerUserId === user?.id)?.userId;
      
      setMessages(
        sorted.map((m) => {
          const isMe = m.senderId === myId;
          const isReadByOther = m.readBy && m.readBy.length > 0 && m.readBy.some((uid: string) => uid !== myId);
          
          return {
            messageId: m.messageId,
            roomId: m.roomId,
            senderId: m.senderId,
            content: m.content,
            sentAt: m.sentAt,
            type: m.type,
            status: (isMe ? (isReadByOther ? "read" : "sent") : "read") as any,
          };
        })
      );
    } catch (error: any) {
      console.error("Failed to fetch history:", error);
      notify.error("Connection Error", "Failed to load chat history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STOMP
  useEffect(() => {
    if (!id || !session) return;

    fetchHistory();

    const client = new StompChatClient(WS_BASE_URL, async () => {
      try {
        return await session.getToken();
      } catch (e: any) {
        if (e.name === "ClerkOfflineError" || e.message?.includes("offline")) {
          return null;
        }
        throw e;
      }
    });
    stompClient.current = client;

    client.connect(
      () => {
        setIsConnected(true);
        client.subscribeToRoom(id, (msg: any) => {
          if (msg.type === "READ_RECEIPT") {
            // Mark the ack'd message as read
            if (msg.messageId) {
              readIds.current.add(msg.messageId);
              setMessages((prev) =>
                prev.map((m) =>
                  m.messageId === msg.messageId ? { ...m, status: "read" } : m
                )
              );
            }
            return;
          }

          setMessages((prev) => {
            const backendId = myBackendIdRef.current;
            // Determine if this is the echo of our own message
            const isEcho =
              msg.type === "CHAT" &&
              (msg.senderId === backendId);

            let updated = [...prev];

            if (isEcho) {
              // Replace temp bubble with the real one (mark as "sent")
              const tempIdx = updated.findIndex(
                (m) => m.messageId.startsWith("temp-") && m.content === msg.content
              );
              if (tempIdx !== -1) {
                updated[tempIdx] = { ...msg, status: "sent" };
                return updated;
              }
            }

            // Avoid duplicates
            if (updated.some((m) => m.messageId === msg.messageId)) return updated;

            const isReadByOther = msg.readBy && msg.readBy.length > 0 && msg.readBy.some((uid: string) => uid !== backendId);
            const incomingStatus: ChatMessage["status"] = isEcho ? (isReadByOther ? "read" : "sent") : "read";
            return [...updated, { ...msg, status: incomingStatus }];
          });

          // Send read receipt for NEW messages from others that we haven't read yet
          if (msg.type === "CHAT") {
            const isMe = msg.senderId === myBackendIdRef.current;
            if (!isMe) {
               // If the message came in without us in the readBy array, it's fresh -> send receipt
               const iHaveReadIt = msg.readBy && msg.readBy.includes(myBackendIdRef.current);
               if (!iHaveReadIt) {
                 client.sendReadReceipt(id, msg.messageId);
               }
            }
          }

          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
        });
      },
      (err) => {
        console.error("STOMP connection error:", err);
        notify.warning("Disconnected", "Real-time updates are unavailable.");
        setIsConnected(false);
      }
    );

    return () => {
      client.disconnect();
    };
  }, [id, session]);

  // Send messages
  const sendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !isConnected || !stompClient.current) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage = {
      messageId: tempId,
      roomId: id,
      senderId: myBackendIdRef.current || "temp",
      content: trimmed,
      sentAt: new Date().toISOString(),
      type: "CHAT",
      status: "sending",
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputText("");
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);

    try {
      stompClient.current.sendMessage(id, trimmed);
    } catch (error) {
      console.error("Failed to send message:", error);
      notify.error("Send Error", "Your message couldn't be sent.");
      setMessages((prev) => prev.filter((m) => m.messageId !== tempId));
    }
  };

  // Renders

  const StatusIcon = ({ status }: { status?: ChatMessage["status"] }) => {
    if (status === "sending") return <Clock size={10} color="#9ca3af" />;
    if (status === "sent") return <Check size={10} color="#9ca3af" />;
    if (status === "read") return <CheckCheck size={10} color="#fab260ff" />;
    return null;
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isMe = msg.senderId === myBackendIdRef.current;
    const isSystem = msg.type === "SYSTEM";

    const prevMsg = index > 0 ? messages[index - 1] : null;
    const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

    // Date divider
    const showDateBreak =
      !prevMsg ||
      (msg.sentAt &&
        prevMsg.sentAt &&
        new Date(msg.sentAt).toDateString() !== new Date(prevMsg.sentAt).toDateString());

    const dateStr = msg.sentAt
      ? new Date(msg.sentAt).toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })
      : "";

    // Grouping flags
    const isFirstInGroup = !prevMsg || !sameGroup(prevMsg, msg);
    const isLastInGroup = !nextMsg || !sameGroup(msg, nextMsg);

    // How much space between bubbles (less within a group, more between groups)
    const marginBottom = isLastInGroup ? 12 : 2;

    if (isSystem) {
      return (
        <VStack key={msg.messageId || index}>
          {showDateBreak && (
            <Center className="my-4">
              <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {dateStr}
              </Text>
            </Center>
          )}
          <SystemNotification content={msg.content} />
        </VStack>
      );
    }

    const time = msg.sentAt
      ? new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

    // Bubble tail shape — only last in group gets a "pointed" corner
    const bubbleRadius = isLastInGroup
      ? isMe
        ? "rounded-2xl rounded-tr-none"
        : "rounded-2xl rounded-tl-none"
      : "rounded-2xl";

    return (
      <VStack key={msg.messageId || index} style={{ marginBottom }}>
        {showDateBreak && (
          <Center className="my-4">
            <Box className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
              <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {dateStr}
              </Text>
            </Box>
          </Center>
        )}

        <VStack
          className={`max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
        >
          {/* Sender label — only first bubble in a group from the other person */}
          {!isMe && isFirstInGroup && (
            <Text className="text-[10px] text-orange-400 font-semibold mb-1 px-1">
              {displayName}
            </Text>
          )}

          <Box
            className={`px-4 py-2 ${bubbleRadius} ${
              isMe
                ? "bg-orange-500 shadow-sm"
                : "bg-gray-800 border border-gray-700"
            }`}
          >
            <Text className="text-white text-sm leading-5">{msg.content}</Text>
          </Box>

         
          {isLastInGroup && (
            <HStack className="mt-1 px-1 items-center" space="xs">
              <Text className="text-[9px] text-gray-500">{time}</Text>
              {isMe && <StatusIcon status={msg.status} />}
            </HStack>
          )}
        </VStack>
      </VStack>
    );
  };

  if (loading) return <ChatRoomSkeleton />;

  return (
    <Box
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Header */}
      <HStack className="px-4 py-3 items-center border-b border-gray-800 bg-black" space="md">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>

        <Link href={{ pathname: "/chats/[id]/profile", params: { id } }} asChild>
          <Pressable className="flex-1 flex-row items-center gap-3">
            <Avatar size="sm">
              <AvatarFallbackText>{displayName}</AvatarFallbackText>
            </Avatar>
            <VStack>
              <Text className="text-white font-bold">{displayName}</Text>
              <Text className={`text-[10px] ${isConnected ? "text-green-500" : "text-gray-500"}`}>
                {isConnected ? "Online" : "Connecting..."}
              </Text>
            </VStack>
          </Pressable>
        </Link>
      </HStack>

      {/* Messages */}
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          <VStack className="py-4">
            {messages.map((msg, idx) => renderMessage(msg, idx))}
          </VStack>
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <HStack className="p-4 bg-black border-t border-gray-800 items-end gap-2">
          <Box className="flex-1 rounded-2xl border border-brand/60 px-3 py-1">
            <Input className="w-full border-0">
              <InputField
                className="text-white text-sm min-h-[40px] w-full"
                placeholder="Type a message..."
                placeholderTextColor="#666"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
            </Input>
          </Box>
          <Pressable
            onPress={sendMessage}
            disabled={!isConnected || !inputText.trim()}
            className={`w-10 h-10 text-center rounded-full items-center justify-center ${
              isConnected && inputText.trim() ? "bg-brand" : "bg-gray-800"
            }`}
          >
            <Send size={20} color="#ffffff" />
          </Pressable>
        </HStack>
      </KeyboardAvoidingView>
    </Box>
  );
};
