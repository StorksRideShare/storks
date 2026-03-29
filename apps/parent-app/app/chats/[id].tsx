import ChatRoom from "@/components/mobile/ChatRoom";
import { useLocalSearchParams } from "expo-router";

export default function ChatRoomLayout() {
  const { id } = useLocalSearchParams();

  return <ChatRoom />;
}
