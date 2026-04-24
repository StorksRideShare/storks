import React, { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
type Day = (typeof DAYS)[number];

interface DaySchedule {
  expanded: boolean;
  dropoffLocation: string;
}

export default function CustomScheduleScreen() {
  const [schedule, setSchedule] = useState<Record<Day, DaySchedule>>(
    DAYS.reduce(
      (acc, day) => ({
        ...acc,
        [day]: { expanded: false, dropoffLocation: "" },
      }),
      {} as Record<Day, DaySchedule>
    )
  );

  const toggle = (day: Day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], expanded: !prev[day].expanded },
    }));
  };

  const setLocation = (day: Day, value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], dropoffLocation: value },
    }));
  };

  const handleSave = () => {
    // TODO: pass schedule back to parent / API
    router.back();
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#E66B00" />
        </Pressable>
        <Text className="text-brand font-bold text-xl">My children</Text>
        <Box className="w-8" />
      </HStack>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-white font-bold text-2xl mb-2">
          Custom Schedule
        </Text>
        <Text className="text-typography-400 text-sm leading-5 mb-6">
          By default the home address becomes the drop off location. Leave empty
          to use the default drop off.
        </Text>

        {/* Day rows */}
        <VStack space="sm" className="mb-6">
          {DAYS.map((day) => {
            const item = schedule[day];
            return (
              <Box key={day}>
                <TouchableOpacity onPress={() => toggle(day)}>
                  <Box
                    className={`border border-brand/50 rounded-full h-14 px-5 flex-row items-center justify-between ${
                      item.expanded ? "rounded-b-none" : ""
                    }`}
                  >
                    <Text className="text-typography-400 text-base">{day}</Text>
                    {item.expanded ? (
                      <ChevronUp size={18} color="#E66B00" />
                    ) : (
                      <ChevronDown size={18} color="#7A726E" />
                    )}
                  </Box>
                </TouchableOpacity>
                {item.expanded && (
                  <Box className="border border-brand/50 border-t-0 rounded-b-[20px] px-4 py-3">
                    <Input className="bg-transparent border border-outline-700 rounded-xl h-11">
                      <InputField
                        placeholder="Custom drop-off location (optional)"
                        placeholderTextColor="#7A726E"
                        className="text-white text-sm px-3"
                        value={item.dropoffLocation}
                        onChangeText={(v) => setLocation(day, v)}
                      />
                    </Input>
                  </Box>
                )}
              </Box>
            );
          })}
        </VStack>

        {/* Info banner */}
        <Box className="border border-dashed border-brand/40 rounded-[18px] p-5 mb-6 bg-[#1a0c00]">
          <Text className="text-white text-sm text-center leading-5">
            These schedules repeat every week. To add custom schedules for
            specific dates, You can customize them through the schedule. Click
            here to go to schedule.
          </Text>
        </Box>
      </ScrollView>

      <Box className="px-5 pb-6 pt-2">
        <Button
          className="bg-white h-14 rounded-full"
          onPress={handleSave}
        >
          <ButtonText className="text-black font-bold text-base">
            Customize schedule
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}
