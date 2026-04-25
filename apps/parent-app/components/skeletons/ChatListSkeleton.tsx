import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { SafeAreaView } from "react-native-safe-area-context";

function ChatRowSkeleton() {
  return (
    <HStack space="md" className="items-center px-4 py-3 border-b border-outline-800">
      <Skeleton variant="circular" className="h-12 w-12 bg-neutral-800" />
      <VStack className="flex-1" space="xs">
        <HStack className="justify-between">
          <SkeletonText _lines={1} className="h-4 w-32 bg-neutral-800" />
          <SkeletonText _lines={1} className="h-3 w-12 bg-neutral-800" />
        </HStack>
        <SkeletonText _lines={1} className="h-3 w-48 bg-neutral-800" />
      </VStack>
    </HStack>
  );
}

export function ChatListSkeleton() {
  return (
    <SafeAreaView className="flex-1 ">
      <Box className="pt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <ChatRowSkeleton key={i} />
        ))}
      </Box>
    </SafeAreaView>
  );
}
