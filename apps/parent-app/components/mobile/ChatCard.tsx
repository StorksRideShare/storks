import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Link } from "expo-router";
import { Pressable } from "react-native";
import { Users } from "lucide-react-native";
import { Center } from "@/components/ui/center";

type ChatCardProps = {
  type: "direct" | "group";
  roomId: string;
  avatar?: string;
  showBadge?: boolean;
  name?: string;
  recentMessage?: string;
  notificationCount?: number;
  lastMessageTime?: string;
};

const DEFAULT_NAME = "Unknown User";
const DEFAULT_MESSAGE = "No messages yet";
const MAX_NOTIFICATION_COUNT = 9;

export default function ChatCard({
  type,
  roomId,
  avatar,
  showBadge = false,
  name,
  recentMessage,
  notificationCount = 0,
  lastMessageTime,
}: ChatCardProps) {
  const displayName = name ?? DEFAULT_NAME;
  const displayRecent = recentMessage ?? DEFAULT_MESSAGE;
  const hasNotification = notificationCount > 0;
  const notificationLabel =
    notificationCount > MAX_NOTIFICATION_COUNT
      ? "9+"
      : String(notificationCount);

  return (
    <Link
      href={{
        pathname: "/chats/[id]",
        params: { id: roomId, name: displayName },
      }}
      asChild
    >
      <Pressable className="w-full">
        {({ pressed }) => (
          <Card
            size="sm"
            variant="ghost"
            className={`m-3 w-full flex-row items-center gap-4 ${pressed ? "opacity-70" : "opacity-100"}`}
          >
            <Avatar>
              {avatar ? (
                <AvatarImage source={{ uri: avatar }} />
              ) : type === "group" ? (
                <Center className="bg-orange-100 rounded-full w-full h-full">
                  <Users size={20} color="#f97316" />
                </Center>
              ) : (
                <AvatarFallbackText>{displayName}</AvatarFallbackText>
              )}
              {showBadge && <AvatarBadge />}
            </Avatar>

            <VStack className="flex-1">
              <HStack className="justify-between items-center">
                <Text className="text-lg font-bold">{displayName}</Text>
                {lastMessageTime && (
                  <Text className="text-xs text-gray-500">{lastMessageTime}</Text>
                )}
              </HStack>
              <HStack className="justify-between items-center">
                <Text className="text-sm text-gray-400 flex-1" numberOfLines={1}>
                  {displayRecent}
                </Text>
                {hasNotification && (
                  <Badge
                    variant="solid"
                    className="h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-600 ml-2"
                  >
                    <BadgeText className="text-center text-[10px] font-bold text-white">
                      {notificationLabel}
                    </BadgeText>
                  </Badge>
                )}
              </HStack>
            </VStack>
          </Card>
        )}
      </Pressable>
    </Link>
  );
}

