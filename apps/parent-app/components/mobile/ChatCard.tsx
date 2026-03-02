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

// Combined and improved type definition
type ChatCardProps = {
  type: "direct" | "group";
  roomId: string; // required for navigation
  avatar?: string; // optional image URL
  showBadge?: boolean; // whether to show avatar badge
  name?: string; // optional display name
  recentMessage?: string; // optional latest message preview
  notificationCount?: number; // optional unread count
};

export default function ChatCard({
  type,
  roomId,
  avatar,
  showBadge = false,
  name,
  recentMessage,
  notificationCount = 0,
}: ChatCardProps) {
  // Default values
  const displayName = name || "John Smith";
  const displayRecent =
    recentMessage ||
    "Hey, can I come over for like i dont know something very big you know?!";
  const hasNotification = notificationCount > 0;

  return (
    <Link
      href={{
        pathname: "./chats/[id]",
        params: { id: roomId },
      }}
      asChild
    >
      <Card
        size="sm"
        variant="ghost"
        className="m-3 w-full text-left flex gap-4 flex-row items-center"
      >
        <Avatar>
          {/* Show avatar image if provided, otherwise fallback text */}
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
            className="h-[24px] w-[24px] rounded-full bg-orange-600 items-center justify-center"
          >
            <BadgeText className="text-white font-bold justify-center text-center items-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </BadgeText>
          </Badge>
        )}
      </Card>
    </Link>
  );
}
