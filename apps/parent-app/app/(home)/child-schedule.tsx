import { ScrollView, Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronDown,
} from "lucide-react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChildScheduleScreen() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dates = [
    { d: 29, m: "prev" }, { d: 30, m: "prev" }, { d: 1, m: "curr" }, { d: 2, m: "curr", dot: true }, { d: 3, m: "curr" }, { d: 4, m: "curr", dot: true }, { d: 5, m: "curr" },
    { d: 6, m: "curr" }, { d: 7, m: "curr" }, { d: 8, m: "curr" }, { d: 9, m: "curr", dot: true }, { d: 10, m: "curr", active: true }, { d: 11, m: "curr" }, { d: 12, m: "curr" },
    { d: 13, m: "curr" }, { d: 14, m: "curr" }
  ];

  const StyledSafeAreaView = SafeAreaView as any;

  return (
    <StyledSafeAreaView className="flex-1 bg-[#0F0E0E]">
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft color="#F97316" size={28} />
        </Pressable>
        <Text size="2xl" bold className="text-orange-500 font-bold">
          Schedule
        </Text>
        <Box className="w-7" />
      </HStack>

      <ScrollView className="flex-1 px-5">
        {/* Child Selector */}
        <Box className="bg-[#1A1919] p-4 rounded-3xl mt-4 mb-8">
          <HStack className="items-center justify-between">
            <HStack space="md" className="items-center">
              <Avatar className="bg-purple-200">
                <AvatarFallbackText>VJ</AvatarFallbackText>
              </Avatar>
              <VStack>
                <Text className="text-white font-bold text-xl font-heading">Vihanga Janaka</Text>
                <Text className="text-gray-400 text-xs">Age 12</Text>
              </VStack>
            </HStack>
            <ChevronDown color="#F97316" size={24} />
          </HStack>
        </Box>

        {/* Calendar Box */}
        <Box className="bg-[#1A1919] p-6 rounded-[32px] border border-[#333] mb-8">
          <HStack className="justify-between items-center mb-6 px-2">
            <ChevronLeft color="#444" size={20} />
            <Text className="text-orange-500 font-bold text-lg">October 2023</Text>
            <ChevronLeft color="#444" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
          </HStack>

          <HStack className="justify-between mb-4">
            {days.map(day => (
              <Box key={day} className="flex-1 items-center">
                <Text className="text-[#666] text-xs font-bold">{day}</Text>
              </Box>
            ))}
          </HStack>

          <Box className="flex-row flex-wrap">
            {dates.map((item, idx) => (
              <Box key={idx} className="w-[14.28%] items-center mb-4 relative">
                {item.active ? (
                  <Box className="bg-[#F97316] w-10 h-10 rounded-2xl items-center justify-center shadow-lg shadow-orange-500/50">
                    <Text className="text-white font-bold text-lg">{item.d}</Text>
                  </Box>
                ) : (
                  <VStack className="items-center justify-center h-10">
                    <Text className={item.m === 'curr' ? "text-lg text-[#888]" : "text-lg text-[#444]"}>
                      {item.d}
                    </Text>
                    {item.dot && <Box className="bg-[#F97316] w-1 h-1 rounded-full mt-0.5" />}
                  </VStack>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        <Text className="text-white text-3xl font-bold mb-6">10th October</Text>

        {/* Time Slots Box */}
        <Box className="border border-dashed border-gray-500 rounded-3xl p-6 bg-[#1A1919] mb-12">
          <VStack space="xl">
            <HStack className="justify-between items-center">
              <HStack space="lg" className="items-center">
                <Text className="text-white font-bold text-xl">07 : 30</Text>
                <VStack>
                  <Text className="text-white font-bold text-lg">Morning pick up</Text>
                  <Text className="text-gray-400 text-sm">Home</Text>
                </VStack>
              </HStack>
              <Box className="border border-orange-500 rounded-lg px-4 py-1.5">
                <Text className="text-orange-500 font-medium">Edit</Text>
              </Box>
            </HStack>

            <HStack space="lg" className="items-center">
              <Text className="text-white font-bold text-xl">13 : 30</Text>
              <VStack>
                <Text className="text-white font-bold text-lg">Afternoon pick up</Text>
                <Text className="text-gray-400 text-sm">Ananda College - Colombo</Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        <Box className="h-10" />
      </ScrollView>

      {/* Action Button */}
      <Box className="px-5 pb-8">
        <Button className="bg-[#F97316] h-16 rounded-full w-full">
          <ButtonText className="text-white font-bold text-xl">
            Notify Absense
          </ButtonText>
        </Button>
      </Box>
    </StyledSafeAreaView>
  );
}
