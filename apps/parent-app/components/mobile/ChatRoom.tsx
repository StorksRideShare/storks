import SystemNotification from "@/components/mobile/SystemNotification";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import Colors from "@/constants/Colors";
import { StompChatClient, ChatMessage } from "@/middleware/chatFunctions";
import { useApiClient, WS_BASE_URL } from "@/middleware/apiClient";
import { useUser, useSession } from "@clerk/expo";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatRoom() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { user } = useUser();
  const { session } = useSession();
  const api = useApiClient();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastReadId, setLastReadId] = useState<string | null>(null);
  const [showNewMessagesDivider, setShowNewMessagesDivider] = useState(false);

  const displayName = (() => {
    if (room?.participants && user?.id) {
      const other = room.participants.find((p: any) => p.userId !== user.id);
      if (other) return `${other.firstName ?? ''} ${other.lastName ?? ''}`.trim() || name || "Chat";
    }
    return name || "Chat";
  })();
  
  const colors = Colors.dark;
  const scrollViewRef = useRef<ScrollView>(null);
  const stompClient = useRef<StompChatClient | null>(null);

  const fetchHistory = async () => {
    try {
      const roomData = await api.get<any>(`/api/v1/chats/${id}`);
      setRoom(roomData);
      
      const history = await api.get<any[]>(`/api/v1/chats/${id}/messages/recent`);
      setMessages(history.map(m => ({
        messageId: m.messageId,
        roomId: m.roomId,
        senderId: m.senderId,
        content: m.content,
        sentAt: m.sentAt,
        type: m.type
      })));
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || !session) return;

    fetchHistory();

    const client = new StompChatClient(WS_BASE_URL, () => session.getToken());
    stompClient.current = client;

    client.connect(
      () => {
        setIsConnected(true);
        client.subscribeToRoom(id, (msg) => {
          setMessages((prev) => {
            const isEcho = msg.senderId === user?.id && msg.type === "CHAT";
            let newMessages = [...prev];
            if (isEcho) {
              const tempIdx = newMessages.findIndex(m => m.messageId.startsWith('temp-') && m.content === msg.content);
              if (tempIdx !== -1) {
                newMessages.splice(tempIdx, 1);
              }
            }
            return [...newMessages, msg];
          });
          if (msg.senderId !== user?.id && msg.type === "CHAT") {
             // Send read receipt
             client.sendReadReceipt(id, msg.messageId);
          }
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        });
      },
      (err) => {
        console.error("STOMP connection error:", err);
        setIsConnected(false);
      }
    );

    return () => {
      client.disconnect();
    };
  }, [id, session]);

  const sendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !isConnected || !stompClient.current) return;

    const tempMessage: ChatMessage = {
      messageId: `temp-${Date.now()}`,
      roomId: id,
      senderId: user?.id || "temp",
      content: trimmed,
      type: "CHAT",
    };
    
    setMessages((prev) => [...prev, tempMessage]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      stompClient.current.sendMessage(id, trimmed);
      setInputText("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter(m => m.messageId !== tempMessage.messageId));
    }
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isMe = msg.senderId === user?.id;
    const isSystem = msg.type === "SYSTEM";

    const prevMsg = index > 0 ? messages[index - 1] : null;
    const showDateBreak = !prevMsg || 
      (msg.sentAt && prevMsg.sentAt && new Date(msg.sentAt).toDateString() !== new Date(prevMsg.sentAt).toDateString());
    
    // Simplistic logic: if message is the first one after we re-opened and it's from someone else
    const isFirstNew = false; // logic would need tracking last seen ID in DB

    const dateStr = msg.sentAt ? new Date(msg.sentAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : "";

    if (isSystem) {
      return (
        <VStack key={msg.messageId || index}>
          {showDateBreak && (
            <Center className="my-6">
              <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{dateStr}</Text>
            </Center>
          )}
          <SystemNotification content={msg.content} />
        </VStack>
      );
    }

    const time = msg.sentAt 
      ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "Sending...";

    const isGroup = messages.some(m => m.senderId !== user?.id && m.senderId !== msg.senderId); // simplistic check
    const isAdmin = false; // logic to determine if current message sender is admin/driver

    return (
      <VStack key={msg.messageId || index}>
        {showDateBreak && (
          <Center className="my-6">
            <Box className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
               <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{dateStr}</Text>
            </Box>
          </Center>
        )}
        {showNewMessagesDivider && (
          <Center className="my-6">
            <Box className="bg-blue-600 px-3 py-1 rounded-full border border-blue-500">
              <Text className="text-[10px] text-white font-bold uppercase tracking-wider">New Messages</Text>
            </Box>
          </Center>
        )}
        <VStack
          className={`mb-4 max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
        >
          <HStack space="xs" className="items-center mb-1 px-1">
            {!isMe && <Text className="text-[10px] text-gray-400 font-medium">{msg.senderId.slice(0, 8)}</Text>}
            <Text className="text-[9px] text-gray-500">{time}</Text>
            {isMe && <Text className="text-[10px] text-blue-400 font-medium font-bold">You</Text>}
          </HStack>
          
          <Box
            className={`px-4 py-2 rounded-2xl ${
              isMe 
                ? "bg-blue-600 rounded-tr-none shadow-sm" 
                : isAdmin 
                  ? "bg-amber-900 border border-amber-700 rounded-tl-none shadow-sm"
                  : "bg-gray-800 rounded-tl-none border border-gray-700"
            }`}
          >
            <Text className="text-white text-sm leading-5">
              {msg.content}
            </Text>
          </Box>
          {isMe && msg.type === "CHAT" && (
            <HStack className="mt-1 px-1" space="xs">
               <Text className="text-[9px] text-gray-500">Read</Text>
            </HStack>
          )}
        </VStack>
      </VStack>
    );
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <HStack className="px-4 py-3 items-center border-b border-gray-800 bg-black" space="md">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        
        <Link 
          href={{ pathname: "/chats/[id]/profile", params: { id } }}
          asChild
        >
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

      <View style={{ flex: 1 }}>
        {loading ? (
          <Box className="flex-1 items-center justify-center">
            <Spinner size="large" />
          </Box>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            <VStack className="py-4">
              {messages.map((msg, idx) => renderMessage(msg, idx))}
            </VStack>
          </ScrollView>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <HStack className="p-4 bg-black border-t border-gray-800 items-end gap-2">
          <Box className="flex-1 bg-gray-900 rounded-2xl border border-gray-700 px-3 py-1">
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
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isConnected && inputText.trim() ? "bg-blue-600" : "bg-gray-800"
            }`}
          >
            <Send size={20} color="#ffffff" />
          </Pressable>
        </HStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { View } from "react-native";
import { Link } from "expo-router";

