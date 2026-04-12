import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { SafeAreaView } from "react-native-safe-area-context";

function EventCardSkeleton() {
  return (
    <Box className="border border-dashed border-outline-700 rounded-[32px] p-6 mb-6">
      {/* Header row */}
      <HStack className="justify-between items-center mb-6">
        <SkeletonText _lines={1} className="h-5 w-36" />
        <Skeleton variant="rounded" className="h-6 w-20 rounded-full" />
      </HStack>

      {/* Driver info row */}
      <HStack space="lg" className="items-center mb-6">
        <Skeleton variant="circular" className="h-20 w-20" />
        <VStack className="flex-1" space="sm">
          <SkeletonText _lines={1} className="h-5 w-40" />
          <SkeletonText _lines={1} className="h-4 w-28" />
          <SkeletonText _lines={1} className="h-4 w-24" />
        </VStack>
      </HStack>

      {/* Title + description */}
      <SkeletonText _lines={1} className="h-5 w-48 mb-2" />
      <SkeletonText _lines={2} gap={4} className="h-4 mb-6" />

      {/* Action button */}
      <Skeleton variant="rounded" className="h-16 w-full rounded-full" />
    </Box>
  );
}

export function ActivityScreenSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background-950 px-5">
      <HStack className="justify-between items-center py-4 mb-4">
        <SkeletonText _lines={1} className="h-6 w-20" />
        <SkeletonText _lines={1} className="h-7 w-24" />
      </HStack>

      <SkeletonText _lines={1} className="h-8 w-24 mb-8" />

      <EventCardSkeleton />
      <EventCardSkeleton />
    </SafeAreaView>
  );
}
