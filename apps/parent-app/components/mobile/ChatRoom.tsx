import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import Colors from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  sender: "me" | "them";
};

const INITIAL_MESSAGES: Message[] = [
  { id: "1", text: "Hey there!", sender: "them" },
  { id: "2", text: "Hello!", sender: "me" },
];

export default function ChatRoom() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const colors = Colors.dark;

  const displayName = name || `Room ${id}`;

  const sendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: trimmed, sender: "me" },
    ]);
    setInputText("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <HStack className="p-4 items-center border-b border-gray-200" space="lg">
        <Button variant="link" onPress={() => router.back()}>
          <ButtonText />
          <ButtonIcon>
            <ArrowLeft size={24} color={"#ffffff"} />
          </ButtonIcon>
        </Button>
        <Avatar size="sm" className="ml-2">
          <AvatarFallbackText>{displayName}</AvatarFallbackText>
          <AvatarImage source={{ uri: "https://example.com/avatar.jpg" }} />
        </Avatar>
        <Text className="text-lg font-bold ml-2">{displayName}</Text>
      </HStack>

      {/* Messages */}
      <ScrollView
        style={{ flex: 1, height: "100%" }}
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
            />
          </Input>
          <Button onPress={sendMessage}>
            <ButtonText>Send</ButtonText>
          </Button>
        </HStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
