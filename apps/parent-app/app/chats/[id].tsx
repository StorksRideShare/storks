import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";

export default function ChatRoom() {
  const { id } = useLocalSearchParams();
  return <Text>Chat room: {id}</Text>;
}
