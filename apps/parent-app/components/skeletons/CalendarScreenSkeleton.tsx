import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { SafeAreaView } from "react-native-safe-area-context";

export function CalendarScreenSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background-950">
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-center">
        <SkeletonText _lines={1} className="h-6 w-28" />
      </HStack>

      <VStack className="flex-1 px-5" space="md">
        {/* Child selector card */}
        <Box className="bg-background-800 p-4 rounded-3xl mt-4 mb-4">
          <HStack className="items-center justify-between">
            <HStack space="md" className="items-center">
              <Skeleton variant="circular" className="h-10 w-10" />
              <VStack space="xs">
                <SkeletonText _lines={1} className="h-4 w-32" />
                <SkeletonText _lines={1} className="h-3 w-16" />
              </VStack>
            </HStack>
            <Skeleton className="h-5 w-5 rounded" />
          </HStack>
        </Box>

        {/* Calendar box */}
        <Box className="bg-background-800 p-6 rounded-[32px] border border-outline-700 mb-6">
          {/* Month header */}
          <HStack className="justify-between items-center mb-6 px-2">
            <Skeleton className="h-5 w-5 rounded" />
            <SkeletonText _lines={1} className="h-5 w-28" />
            <Skeleton className="h-5 w-5 rounded" />
          </HStack>

          {/* Day labels */}
          <HStack className="justify-between mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Box key={i} className="flex-1 items-center">
                <SkeletonText _lines={1} className="h-2.5 w-5" />
              </Box>
            ))}
          </HStack>

          {/* Date grid — 3 rows */}
          {[1, 2, 3].map((row) => (
            <HStack key={row} className="justify-between mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                <Box key={col} className="flex-1 items-center">
                  <Skeleton variant="rounded" className="h-9 w-9 rounded-2xl" />
                </Box>
              ))}
            </HStack>
          ))}
        </Box>

        {/* Date title */}
        <SkeletonText _lines={1} className="h-7 w-36 mb-4" />

        {/* Time slot card */}
        <Box className="border border-dashed border-outline-600 rounded-3xl p-6 bg-background-800">
          <VStack space="lg">
            {[1, 2].map((i) => (
              <HStack key={i} className="justify-between items-center">
                <HStack space="lg" className="items-center">
                  <SkeletonText _lines={1} className="h-5 w-16" />
                  <VStack space="xs">
                    <SkeletonText _lines={1} className="h-4 w-28" />
                    <SkeletonText _lines={1} className="h-3 w-20" />
                  </VStack>
                </HStack>
                <Skeleton variant="rounded" className="h-8 w-14 rounded-lg" />
              </HStack>
            ))}
          </VStack>
        </Box>
      </VStack>

      {/* Bottom button */}
      <Box className="px-5 pb-8 mt-4">
        <Skeleton variant="rounded" className="h-16 w-full rounded-full" />
      </Box>
    </SafeAreaView>
  );
}
