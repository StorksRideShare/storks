import React, { useState, useEffect } from "react";
import { FlatList, Pressable, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, X, User } from "lucide-react-native";
import { router } from "expo-router";

import { useApiClient } from "@/middleware/apiClient";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";

type UserSearchResult = {
  userId: string;
  providerUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export default function SearchAccountScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient("live-messaging");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchUsers(query.trim());
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchUsers = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: UserSearchResult) => {
    try {
      setLoading(true);
      // POST to /chats with the targetUserId to get/create a 1-on-1 room
      const room = await api.post<any>("/chats", {
        targetUserId: user.providerUserId,
      });
      
      router.replace({
        pathname: "/chats/[id]",
        params: { id: room.roomId, name: `${user.firstName} ${user.lastName}` },
      });
    } catch (err: any) {
      console.error("Failed to initiate chat:", err);
      setError("Failed to start conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <HStack className="px-4 py-3 items-center border-b border-outline-800 space-x-3">
        <Box className="flex-1 flex-row items-center   rounded-xl px-3 h-10">
          <Search color="#7A726E" size={18} />
          <TextInput
            className="flex-1 text-white ml-2 h-full"
            placeholder="Search by name or email..."
            placeholderTextColor="#7A726E"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <X color="#7A726E" size={18} />
            </Pressable>
          )}
        </Box>
        <Pressable onPress={() => router.back()}>
          <Text className="text-brand font-medium">Cancel</Text>
        </Pressable>
      </HStack>

      {/* Results */}
      {loading ? (
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E66B00" />
        </Box>
      ) : error ? (
        <Box className="flex-1 items-center justify-center p-4">
          <Text className="text-error text-center">{error}</Text>
        </Box>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.userId}
          ListEmptyComponent={
            query.trim().length >= 2 ? (
              <Box className="p-6 items-center">
                <Text className="text-typography-500">No users found.</Text>
              </Box>
            ) : (
              <Box className="p-6 items-center">
                <Text className="text-typography-500 text-center">
                  Type at least 2 characters to search for other parents or drivers.
                </Text>
              </Box>
            )
          }
          renderItem={({ item }) => {
            const displayName = `${item.firstName} ${item.lastName}`.trim();
            const initials = `${item.firstName?.[0] || ""}${item.lastName?.[0] || ""}`.toUpperCase();

            return (
              <Pressable
                onPress={() => handleSelectUser(item)}
                className="flex-row items-center px-4 py-3 border-b border-outline-800"
              >
                <Avatar size="md" className="bg-brand/20 mr-3">
                  <AvatarFallbackText className="text-brand">{initials}</AvatarFallbackText>
                </Avatar>
                <VStack>
                  <Text className="text-white font-semibold">{displayName}</Text>
                  <Text className="text-typography-500 text-sm">{item.email}</Text>
                </VStack>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
