import { StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import ChatCard from "@/components/mobile/ChatCard";
import { VStack } from "@/components/ui/vstack";

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <VStack space="xs">
        <ChatCard
          type="direct"
          roomId="room-123"
          avatar="https://example.com/avatar.jpg"
          name="Alice"
          recentMessage="See you tomorrow!"
          notificationCount={5}
        />
        <ChatCard
          type="direct"
          roomId="room-123"
          name="Alice"
          recentMessage="See you tomorrow!"
          notificationCount={5}
        />
        <ChatCard
          type="direct"
          roomId="room-123"
          avatar="https://example.com/avatar.jpg"
          name="Alice"
          recentMessage="See you tomorrow!"
          notificationCount={5}
        />
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
