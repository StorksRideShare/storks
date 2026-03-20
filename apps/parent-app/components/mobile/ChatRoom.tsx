import Notify from "@/components/mobile/Notify";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import Colors from "@/constants/Colors";
import { WebSocketClient } from "@/middleware/chatFunctions";
import { useUser } from "@clerk/expo";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getWebSocketUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "ws://10.0.2.2:8089/ws";
    } else if (Platform.OS === "ios") {
      return "ws://localhost:8089/ws";
    } else {
      return "ws://192.168.1.x:8089/ws";
    }
  }
  return "wss://yourdomain.com/ws";
};

const WS_SERVER_URL = getWebSocketUrl();

type Message = {
  id: string;
  text: string;
  sender: "me" | "them";
};

type Response = {
  type: string;
  conversation_id: string;
  sender_id: string;
  content: string;
};

export default function ChatRoom() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const colors = Colors.dark;
  const { user, isLoaded } = useUser();

  const displayName = name || `Room ${id}`;

  // Keep WebSocket client in a ref so it persists across re-renders
  const wsClient = useRef<WebSocketClient | null>(null);

  // Initialize WebSocket client and connect when user is loaded
  useEffect(() => {
    if (!isLoaded || !user) return;

    const client = new WebSocketClient();
    wsClient.current = client;

    // Set up event handlers
    client.onOpen(() => {
      setIsConnected(true);
      // Automatically join the room from route params after connection
      if (id) {
        try {
          client.joinRoom(id);
        } catch (error) {
          console.error("Failed to join room:", error);
        }
      }
    });

    client.onClose(() => {
      setIsConnected(false);
    });

    client.onError((error: any) => {
      console.error("WebSocket error:", error);
      <Notify type="faliure" title="Error!" description="Websocket Error" />;
    });

    client.onMessage((data: Response) => {
      if (data.sender_id === user?.id) {
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          text: data.content,
          sender: "them",
        },
      ]);
    });

    // Connect to the server
    client.connect(WS_SERVER_URL, user.id);

    // Cleanup on unmount
    return () => {
      client.disconnect();
    };
  }, [isLoaded, user, id]); // Re-run if user or room id changes

  const sendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Optimistically add message to UI
    const newMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: "me",
    };
    setMessages((prev) => [...prev, newMessage]);

    // Send via WebSocket
    if (wsClient.current) {
      try {
        wsClient.current.sendMessage(trimmed);
      } catch (error) {
        console.error("Failed to send message:", error);
        // Optionally remove the optimistically added message or mark as failed
      }
    }

    setInputText("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <HStack className="p-4 items-center border-b border-gray-200" space="lg">
        <Button variant="link" onPress={() => router.back()}>
          <ArrowLeft size={24} color={"#ffffff"} />
          <ButtonText>Back</ButtonText>
        </Button>
        <Avatar size="sm" className="ml-2">
          <AvatarFallbackText>{displayName}</AvatarFallbackText>
          <AvatarImage source={{ uri: "https://example.com/avatar.jpg" }} />
        </Avatar>
        <Text className="text-lg font-bold ml-2">{displayName}</Text>
        {/* Optional connection status indicator */}
        <Box
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: isConnected ? "green" : "red",
            marginLeft: 8,
          }}
        />
      </HStack>

      {/* Messages */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <VStack className="gap-3 py-4">
          {messages.map((msg) => (
            <Box
              key={msg.id}
              className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                msg.sender === "me"
                  ? "self-end bg-blue-500"
                  : "self-start bg-gray-300"
              }`}
            >
              <Text
                className={msg.sender === "me" ? "text-white" : "text-gray-900"}
              >
                {msg.text}
              </Text>
            </Box>
          ))}
        </VStack>
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <HStack className="p-4 pt-6 border-t border-gray-400 gap-2 items-center">
          <Input className="flex-1">
            <InputField
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              editable={isConnected} // disable input if not connected
            />
          </Input>
          <Button onPress={sendMessage} disabled={!isConnected}>
            <ButtonText>Send</ButtonText>
          </Button>
        </HStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
