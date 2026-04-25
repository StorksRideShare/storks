import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { SafeAreaView } from "react-native-safe-area-context";

function GroupCardSkeleton() {
  return (
    <Box className="rounded-[20px] border border-outline-700 mb-5 overflow-hidden p-4">
      <HStack className="items-center justify-between mb-3">
        <HStack space="sm" className="items-center flex-1">
          <SkeletonText _lines={1} className="h-4 w-28" />
          <SkeletonText _lines={1} className="h-3 w-20" />
        </HStack>
        <Skeleton variant="rounded" className="h-7 w-24 rounded-full" />
      </HStack>

      <Box className="rounded-[14px] bg-background-900 p-4">
        {/* Driver row */}
        <HStack space="sm" className="items-center mb-4">
          <Skeleton variant="circular" className="h-8 w-8" />
          <SkeletonText _lines={1} className="h-4 w-32 flex-1" />
          <Skeleton variant="rounded" className="h-6 w-16 rounded-full" />
        </HStack>

        <Box className="h-px bg-outline-800 mb-4" />

        {/* Child row 1 */}
        <HStack space="sm" className="items-center mb-3">
          <Box className="w-5 h-5 rounded-full bg-outline-700" />
          <SkeletonText _lines={1} className="h-4 w-24 flex-1" />
          <Skeleton variant="rounded" className="h-5 w-16 rounded-full" />
        </HStack>
        <SkeletonText _lines={1} className="h-3 w-36 mb-4 ml-7" />

        {/* Child row 2 */}
        <HStack space="sm" className="items-center mb-3">
          <Box className="w-5 h-5 rounded-full bg-outline-700" />
          <SkeletonText _lines={1} className="h-4 w-28 flex-1" />
          <Skeleton variant="rounded" className="h-5 w-16 rounded-full" />
        </HStack>
        <SkeletonText _lines={1} className="h-3 w-40 ml-7" />

        {/* Countdown */}
        <SkeletonText _lines={1} className="h-4 w-44 mt-4" />
      </Box>
    </Box>
  );
}

export function HomeScreenSkeleton() {
  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-between">
        <SkeletonText _lines={1} className="h-6 w-20" />
        <Skeleton variant="circular" className="h-10 w-10" />
      </HStack>

      <Box className="h-px bg-outline-800 mx-5 mb-1" />

      <VStack className="flex-1 px-5 mt-4">
        <GroupCardSkeleton />
        <GroupCardSkeleton />

        {/* News skeleton */}
        <SkeletonText _lines={1} className="h-5 w-28 mb-3" />
        <HStack space="sm">
          <Skeleton variant="rounded" className="h-28 w-44 rounded-[18px]" />
          <Skeleton variant="rounded" className="h-28 w-44 rounded-[18px]" />
        </HStack>
      </VStack>

      {/* Search bar skeleton */}
      <Box className="px-5 pb-4 pt-2">
        <Skeleton variant="rounded" className="h-14 w-full rounded-full" />
      </Box>
    </SafeAreaView>
  );
}
