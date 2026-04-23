import React, { useState, useCallback } from "react";
import { ScrollView, RefreshControl, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Modal, ModalBackdrop, ModalContent, ModalBody } from "@/components/ui/modal";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";
import { useParentStore } from "@/src/store/parentStore";
import { useSchedule } from "@/src/hooks/useSchedule";
import { useApiError } from "@/src/hooks/useApiError";
import { CalendarScreenSkeleton } from "@/components/skeletons/CalendarScreenSkeleton";
import type { ScheduleEntry, AbsenceRequest } from "@/utils/api";

// ── Date helpers ──────────────────────────────────────────────────────────────

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) result.push(null);
  for (let d = 1; d <= daysInMonth; d++) result.push(d);
  while (result.length % 7 !== 0) result.push(null);
  return result;
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function TimeSlot({ entry, onAbsence }: { entry: ScheduleEntry; onAbsence: () => void }) {
  const isAbsent = entry.status === "absent";
  return (
    <HStack className="justify-between items-center">
      <HStack space="lg" className="items-center">
        <Text className="text-brand font-bold text-lg w-16">{entry.pickupTime}</Text>
        <VStack>
          <Text className="text-white font-bold">{entry.childName}</Text>
          <Text className="text-typography-500 text-xs">{entry.pickupLocation}</Text>
        </VStack>
      </HStack>
      {!isAbsent ? (
        <Button
          variant="outline"
          className="border-brand rounded-xl h-8 px-3"
          onPress={onAbsence}
        >
          <ButtonText className="text-brand text-xs font-bold">Absent</ButtonText>
        </Button>
      ) : (
        <Box className="bg-error-500/20 px-3 py-1 rounded-xl">
          <Text className="text-error-500 text-xs font-bold">Absent</Text>
        </Box>
      )}
    </HStack>
  );
}


export default function CalendarScreen() {
  const { groups } = useParentStore();
  const allChildren = groups.flatMap((g) => g.children);

  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const selectedChild = allChildren[selectedChildIndex] ?? null;

  const { schedule, isLoading, error, refresh, reportAbsence } = useSchedule(
    selectedChild?.id
  );
  const { handleError } = useApiError();
  const toast = useToast();

  // Calendar navigation
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  const [absenceModalEntry, setAbsenceModalEntry] = useState<ScheduleEntry | null>(null);
  const [absenceSubmitting, setAbsenceSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const calendarDays = getCalendarDays(viewYear, viewMonth);
  const selectedDateIso = isoDate(viewYear, viewMonth, selectedDay);

  // Dates that have scheduled entries (for dot indicators)
  const scheduledDates = new Set(schedule.map((e) => e.date));

  // Entries for the selected day
  const dayEntries = schedule.filter((e) => e.date === selectedDateIso);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleAbsenceConfirm = async (routeType: "pickup" | "dropoff" | "both") => {
    if (!absenceModalEntry) return;
    setAbsenceSubmitting(true);
    try {
      const req: AbsenceRequest = {
        childId: absenceModalEntry.childId,
        date: absenceModalEntry.date,
        routeType,
      };
      await reportAbsence(req);
      setAbsenceModalEntry(null);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`absence-toast-${id}`} action="success" variant="solid"
            className="bg-success-600 rounded-3xl p-5 mt-12">
            <HStack space="sm" className="items-center">
              <Bell color="white" size={18} />
              <ToastTitle className="text-white font-bold">Absence Reported</ToastTitle>
            </HStack>
          </Toast>
        ),
      });
    } catch (err) {
      handleError(err, "CalendarScreen.reportAbsence");
    } finally {
      setAbsenceSubmitting(false);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  if (isLoading) return <CalendarScreenSkeleton />;

  return (
    <SafeAreaView className="flex-1 ">
      <HStack className="px-5 py-4 items-center justify-center">
        <Text className="text-brand font-bold text-2xl">Schedule</Text>
      </HStack>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E66B00" />
        }
      >
        {/* Child selector */}
        {allChildren.length > 1 && (
          <Box className="  p-4 rounded-3xl mt-2 mb-5 border border-outline-700">
            <HStack className="items-center justify-between">
              <Pressable
                onPress={() => setSelectedChildIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft size={20} color={selectedChildIndex === 0 ? "#333" : "#E66B00"} />
              </Pressable>
              {selectedChild && (
                <HStack space="md" className="items-center">
                  <Avatar size="sm" className="bg-purple-200">
                    <AvatarFallbackText>
                      {selectedChild.firstName[0]}{selectedChild.lastName[0]}
                    </AvatarFallbackText>
                  </Avatar>
                  <Text className="text-white font-bold">
                    {selectedChild.firstName} {selectedChild.lastName}
                  </Text>
                </HStack>
              )}
              <Pressable
                onPress={() =>
                  setSelectedChildIndex((i) => Math.min(allChildren.length - 1, i + 1))
                }
              >
                <ChevronRight
                  size={20}
                  color={selectedChildIndex === allChildren.length - 1 ? "#333" : "#E66B00"}
                />
              </Pressable>
            </HStack>
          </Box>
        )}

        {error && (
          <Box className="bg-error-50 border border-error-300 rounded-2xl px-4 py-3 mb-4">
            <Text className="text-error-600 text-sm text-center">{error}</Text>
          </Box>
        )}

        {/* Calendar */}
        <Box className="  rounded-[32px] p-6 border border-outline-700 mb-6">
          {/* Month navigation */}
          <HStack className="justify-between items-center mb-5 px-2">
            <Pressable onPress={prevMonth}>
              <ChevronLeft size={22} color="#E66B00" />
            </Pressable>
            <Text className="text-white font-bold text-lg">
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <Pressable onPress={nextMonth}>
              <ChevronRight size={22} color="#E66B00" />
            </Pressable>
          </HStack>

          {/* Day headers */}
          <HStack className="justify-between mb-3">
            {DAYS_SHORT.map((d) => (
              <Box key={d} className="flex-1 items-center">
                <Text className="text-typography-500 text-xs font-bold">{d}</Text>
              </Box>
            ))}
          </HStack>

          {/* Date grid */}
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, week) => (
            <HStack key={week} className="justify-between mb-2">
              {calendarDays.slice(week * 7, week * 7 + 7).map((day, idx) => {
                if (day === null) {
                  return <Box key={idx} className="flex-1 h-10" />;
                }
                const dateIso = isoDate(viewYear, viewMonth, day);
                const isToday =
                  day === now.getDate() &&
                  viewMonth === now.getMonth() &&
                  viewYear === now.getFullYear();
                const isSelected = day === selectedDay;
                const hasEntry = scheduledDates.has(dateIso);

                return (
                  <Pressable
                    key={idx}
                    className="flex-1 items-center"
                    onPress={() => setSelectedDay(day)}
                  >
                    <Box
                      className={`h-9 w-9 rounded-2xl items-center justify-center ${
                        isSelected
                          ? "bg-brand"
                          : isToday
                          ? "border border-brand"
                          : "bg-transparent"
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          isSelected
                            ? "text-white"
                            : isToday
                            ? "text-brand"
                            : "text-typography-400"
                        }`}
                      >
                        {day}
                      </Text>
                    </Box>
                    {hasEntry && (
                      <Box className="h-1.5 w-1.5 rounded-full bg-brand mt-0.5" />
                    )}
                  </Pressable>
                );
              })}
            </HStack>
          ))}
        </Box>

        {/* Selected day entries */}
        <Text className="text-white font-bold text-2xl mb-4">
          {MONTHS[viewMonth]} {selectedDay}
        </Text>

        {dayEntries.length > 0 ? (
          <Box className="border border-dashed border-outline-600 rounded-3xl p-6   mb-8">
            <VStack space="lg">
              {dayEntries.map((entry, i) => (
                <React.Fragment key={entry.id}>
                  {i > 0 && <Box className="h-px bg-outline-700" />}
                  <TimeSlot
                    entry={entry}
                    onAbsence={() => setAbsenceModalEntry(entry)}
                  />
                </React.Fragment>
              ))}
            </VStack>
          </Box>
        ) : (
          <Box className="py-12 items-center mb-8">
            <Text className="text-typography-500 text-lg text-center">
              No rides scheduled for this day.
            </Text>
          </Box>
        )}

        <Box className="h-20" />
      </ScrollView>

      {/* Absence type modal */}
      <Modal isOpen={!!absenceModalEntry} onClose={() => setAbsenceModalEntry(null)}>
        <ModalBackdrop />
        <ModalContent className="  rounded-[32px] border border-outline-700 mx-6">
          <ModalBody className="p-6">
            <Text className="text-white font-bold text-xl mb-2">
              Report Absence
            </Text>
            {absenceModalEntry && (
              <Text className="text-typography-500 text-sm mb-6">
                For {absenceModalEntry.childName} on{" "}
                {new Date(absenceModalEntry.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            )}
            <VStack space="sm">
              {(["pickup", "dropoff", "both"] as const).map((type) => (
                <Button
                  key={type}
                  className={`h-14 rounded-full ${
                    type === "both"
                      ? "bg-brand"
                      : "bg-background-700 border border-outline-600"
                  }`}
                  onPress={() => handleAbsenceConfirm(type)}
                  isDisabled={absenceSubmitting}
                >
                  <ButtonText
                    className={`font-bold capitalize ${
                      type === "both" ? "text-white" : "text-typography-400"
                    }`}
                  >
                    {type === "both" ? "Entire Day" : `${type} only`}
                  </ButtonText>
                </Button>
              ))}
              <Button
                variant="link"
                className="self-center mt-2"
                onPress={() => setAbsenceModalEntry(null)}
              >
                <ButtonText className="text-typography-500">Cancel</ButtonText>
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
