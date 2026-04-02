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
import { Link } from "expo-router";
import { Pressable } from "react-native";

type ChatCardProps = {
  type: "direct" | "group";
  roomId: string;
  avatar?: string;
  showBadge?: boolean;
  name?: string;
  recentMessage?: string;
  notificationCount?: number;
};

const DEFAULT_NAME = "John Smith";
const DEFAULT_MESSAGE =
  "Hey, can I come over for like i dont know something very big you know?!";
const MAX_NOTIFICATION_COUNT = 9;

export default function ChatCard({
  roomId,
  avatar,
  showBadge = false,
  name,
  recentMessage,
  notificationCount = 0,
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
        params: { id: roomId },
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
              ) : (
                <AvatarFallbackText>{displayName}</AvatarFallbackText>
              )}
              {showBadge && <AvatarBadge />}
            </Avatar>

            <VStack className="flex-1">
              <Text className="text-lg font-bold">{displayName}</Text>
              <Text className="text-sm text-gray-300" numberOfLines={1}>
                {displayRecent}
              </Text>
            </VStack>

            {hasNotification && (
              <Badge
                variant="solid"
                className="h-6 w-6 items-center justify-center rounded-full bg-orange-600"
              >
                <BadgeText className="text-center font-bold text-white">
                  {notificationLabel}
                </BadgeText>
              </Badge>
            )}
          </Card>
        )}
      </Pressable>
    </Link>
  );
}
