import { View } from "@/components/Themed";
import ChatCard from "@/components/mobile/ChatCard";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { Icon, AddIcon, SearchIcon } from "@/components/ui/icon";
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper, ActionsheetItem, ActionsheetItemText } from "@/components/ui/actionsheet";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { useUser } from "@clerk/expo";
import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Modal } from "react-native";
import { useApiClient } from "@/middleware/apiClient";
import { router } from "expo-router";

type Room = {
  roomId: string;
  chatRoomType: "DIRECT" | "GROUP";
  participants: any[]; // backend currently returns full participant objects
  updatedAt: string;
};

type UserSearch = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
};

export default function TabTwoScreen() {
  const { isLoaded, isSignedIn, user } = useUser();
  const api = useApiClient();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearch[]>([]);
  const [searching, setSearching] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery.length >= 3) {
      performSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const fetchRooms = async () => {
    try {
      const data = await api.get<any[]>("/api/v1/chats");
      setRooms(data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchRooms();
    }
  }, [isLoaded, isSignedIn]);

  const performSearch = async (q: string) => {
    setSearching(true);
    try {
      const results = await api.get<UserSearch[]>(`/api/v1/users/search?q=${q}`);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
  };

  const createChat = async (targetUser: UserSearch) => {
    try {
      const room = await api.post<any>("/api/v1/chats", { targetUserId: targetUser.userId });
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
      fetchRooms();
      const name = `${targetUser.firstName} ${targetUser.lastName}`.trim();
      router.push({
        pathname: "/chats/[id]",
        params: { id: room.roomId, name },
      });
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const getChatName = (room: Room) => {
    if (room.chatRoomType === "DIRECT") {
      const other = room.participants.find((p) => p.providerUserId !== user?.id);
      return other ? `${other.firstName} ${other.lastName}`.trim() || "Direct Chat" : "Direct Chat";
    }
    // For group chats, find the driver participant by role
    const driver = room.participants.find((p) => p.role === "DRIVER");
    return driver ? `${driver.firstName} ${driver.lastName}`.trim() || "Group Chat" : "Group Chat";
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Spinner size="large" className="text-orange-500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.roomId}
        renderItem={({ item }) => (
          <ChatCard
            type={item.chatRoomType.toLowerCase() as any}
            roomId={item.roomId}
            name={getChatName(item)}
            recentMessage="Tap to chat" // In future, fetch last message from backend
            lastMessageTime={new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
        )}
        ListEmptyComponent={
          <VStack className="items-center justify-center pt-20" space="md">
            <Text className="text-gray-500 text-lg">No chats active</Text>
            <Text className="text-gray-400 text-sm">Start a new conversation below</Text>
          </VStack>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <Fab
        size="lg"
        placement="bottom right"
        onPress={() => setShowSearch(true)}
        className="mb-4 mr-4 bg-orange-600"
      >
        <FabIcon as={AddIcon} className="text-white" />
      </Fab>

      <Modal visible={showSearch} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSearch(false)}>
        <View className="flex-1 bg-black">
          <VStack className="flex-1 w-full p-4 pt-12" space="md">
            <HStack className="justify-between items-center mb-4">
              <Text className="text-xl font-bold text-white">New Conversation</Text>
              <Text className="text-orange-500 font-bold" onPress={() => setShowSearch(false)}>Cancel</Text>
            </HStack>
            <Input size="md" className="bg-gray-900 border-gray-800">
              <InputSlot className="pl-3">
                <InputIcon as={SearchIcon} color="white" />
              </InputSlot>
              <InputField
                className="text-white"
                placeholder="Search by email or ID..."
                placeholderTextColor="#ffc787ff"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              {searching && (
                <InputSlot className="pr-3">
                  <Spinner size="small" className="text-orange-500" />
                </InputSlot>
              )}
            </Input>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.userId}
              renderItem={({ item }) => (
                <HStack className="p-4 border-b border-gray-800 items-center justify-between">
                  <VStack>
                    <Text className="font-bold text-white">
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text className="text-gray-500 text-xs">{item.email}</Text>
                  </VStack>
                  <Text className="text-blue-500 font-bold" onPress={() => createChat(item)}>Chat</Text>
                </HStack>
              )}
              style={{ flex: 1, marginTop: 10 }}
              ListEmptyComponent={
                searchQuery.length >= 3 && !searching ? (
                  <Text className="text-center text-gray-400 py-4">No users found</Text>
                ) : null
              }
            />
          </VStack>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

