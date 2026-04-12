import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

function IncomingBubble({ wide = false }: { wide?: boolean }) {
  return (
    <HStack space="sm" className="items-end self-start mb-3">
      <Skeleton variant="circular" className="h-8 w-8 mb-1" />
      <Skeleton
        variant="rounded"
        className={`h-10 rounded-2xl rounded-tl-none ${wide ? "w-52" : "w-36"}`}
      />
    </HStack>
  );
}

function OutgoingBubble({ wide = false }: { wide?: boolean }) {
  return (
    <Box className={`self-end mb-3 ${wide ? "w-56" : "w-40"}`}>
      <Skeleton
        variant="rounded"
        className="h-10 rounded-2xl rounded-tr-none w-full"
      />
    </Box>
  );
}

export function ChatRoomSkeleton() {
  return (
    <Box className="flex-1 bg-black">
      {/* Header */}
      <HStack
        className="px-4 py-3 items-center border-b border-outline-800 bg-black"
        space="md"
      >
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton variant="circular" className="h-9 w-9" />
        <VStack space="xs">
          <SkeletonText _lines={1} className="h-4 w-28" />
          <SkeletonText _lines={1} className="h-2.5 w-16" />
        </VStack>
      </HStack>

      {/* Message bubbles */}
      <VStack className="flex-1 px-4 py-6">
        <IncomingBubble />
        <OutgoingBubble wide />
        <IncomingBubble wide />
        <OutgoingBubble />
        <IncomingBubble wide />
        <OutgoingBubble />
      </VStack>

      {/* Input bar */}
      <HStack className="p-4 bg-black border-t border-outline-800 items-center" space="sm">
        <Box className="flex-1 rounded-2xl border border-outline-700 h-12">
          <Skeleton variant="rounded" className="h-full w-full rounded-2xl" />
        </Box>
        <Skeleton variant="circular" className="h-10 w-10" />
      </HStack>
    </Box>
  );
}
