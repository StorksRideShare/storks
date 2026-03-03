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
          roomId="user_1234"
          avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
          name="Alice"
          recentMessage="See you tomorrow!"
          showBadge={true}
          notificationCount={5}
        />
        <ChatCard
          type="direct"
          roomId="room-123"
          name="Alice"
          recentMessage="See you tomorrow!"
          notificationCount={50}
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
