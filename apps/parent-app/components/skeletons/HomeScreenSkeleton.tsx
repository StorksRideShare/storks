import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { SafeAreaView } from "react-native-safe-area-context";

function ChildCardSkeleton() {
  return (
    <Box className=" p-5 rounded-[28px] border border-outline-700 mb-4">
      <HStack className="items-center justify-between mb-4">
        <HStack space="md" className="items-center">
          <Skeleton variant="circular" className="h-10 w-10" />
          <VStack space="sm">
            <SkeletonText _lines={1} className="h-4 w-32" />
            <SkeletonText _lines={1} className="h-3 w-24" />
          </VStack>
        </HStack>
        <Skeleton variant="rounded" className="h-6 w-14 rounded-full" />
      </HStack>
      <SkeletonText _lines={1} className="h-3 w-3/4 mb-3" />
      <Box className="h-px bg-outline-700 mb-3" />
      <HStack className="justify-between items-center">
        <VStack space="xs">
          <SkeletonText _lines={1} className="h-2 w-24" />
          <SkeletonText _lines={1} className="h-4 w-16" />
        </VStack>
        <Skeleton variant="rounded" className="h-10 w-20 rounded-full" />
      </HStack>
    </Box>
  );
}

export function HomeScreenSkeleton() {
  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-between">
        <VStack space="xs">
          <SkeletonText _lines={1} className="h-3 w-24" />
          <SkeletonText _lines={1} className="h-6 w-32" />
        </VStack>
        <Skeleton variant="circular" className="h-12 w-12" />
      </HStack>

      <VStack className="flex-1 px-5">
        {/* Section title */}
        <SkeletonText _lines={1} className="h-5 w-36 mt-6 mb-4" />

        {/* Two child cards */}
        <ChildCardSkeleton />
        <ChildCardSkeleton />

        {/* Quick Actions title */}
        <SkeletonText _lines={1} className="h-5 w-32 mt-4 mb-4" />

        {/* Three action buttons */}
        <HStack space="md">
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              className="flex-1  p-5 rounded-[24px] border border-outline-700 items-center"
            >
              <Skeleton variant="rounded" className="h-12 w-12 rounded-2xl mb-2" />
              <SkeletonText _lines={1} className="h-3 w-12" />
            </Box>
          ))}
        </HStack>
      </VStack>
    </SafeAreaView>
  );
}
