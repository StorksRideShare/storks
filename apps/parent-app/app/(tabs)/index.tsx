import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import {
  Search,
  Plus,
  ShieldCheck,
  X,
  Flag,
  User,
} from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Pressable } from "@/components/ui/pressable";
import { useParentDashboard } from "@/src/hooks/useParentDashboard";
import { HomeScreenSkeleton } from "@/components/skeletons/HomeScreenSkeleton";
import type { DriverGroup, ChildProfile } from "@/utils/api";

// ── Orange arc decoration (bottom-right of group cards) ────────────────────────
function OrangeArcs() {
  return (
    <Svg
      width={88}
      height={88}
      viewBox="0 0 88 88"
      style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.85 }}
    >
      <Path
        d="M88 88 A88 88 0 0 0 0 0"
        fill="none"
        stroke="rgba(230,107,0,0.10)"
        strokeWidth="28"
      />
      <Path
        d="M88 88 A64 64 0 0 0 24 24"
        fill="none"
        stroke="rgba(230,107,0,0.15)"
        strokeWidth="28"
      />
      <Path
        d="M88 88 A42 42 0 0 0 46 46"
        fill="none"
        stroke="rgba(230,107,0,0.22)"
        strokeWidth="28"
      />
    </Svg>
  );
}

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(etaMinutes?: number) {
  const [seconds, setSeconds] = useState(
    etaMinutes !== undefined ? etaMinutes * 60 : 0
  );
  useEffect(() => {
    if (!etaMinutes) return;
    setSeconds(etaMinutes * 60);
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [etaMinutes]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Child status pill ──────────────────────────────────────────────────────────
function StatusPill({ child }: { child: ChildProfile }) {
  const status = child.todayPickup?.status;
  if (child.isAbsent || status === "absent")
    return (
      <Box className="bg-error-500 rounded-full px-2 py-0.5">
        <Text className="text-white text-[10px] font-bold">absent</Text>
      </Box>
    );
  if (status === "en_route")
    return (
      <Box className="bg-brand rounded-full px-2 py-0.5">
        <Text className="text-white text-[10px] font-bold">picking up</Text>
      </Box>
    );
  if (status === "arrived")
    return (
      <Box className="bg-success-500 rounded-full px-2 py-0.5">
        <Text className="text-white text-[10px] font-bold">arrived</Text>
      </Box>
    );
  return (
    <Box className="border border-outline-500 rounded-full px-2 py-0.5">
      <Text className="text-typography-500 text-[10px]">
        {child.todayPickup?.estimatedTime || "--:--"}
      </Text>
    </Box>
  );
}

// ── Group status card (home "with children" state) ─────────────────────────────
function GroupStatusCard({
  group,
  onReport,
}: {
  group: DriverGroup;
  onReport: (groupId: string) => void;
}) {
  const children = group.children ?? [];
  const firstEta = children[0]?.todayPickup?.etaMinutes;
  const countdown = useCountdown(firstEta);
  const childNames = children.map((c) => c.firstName).join(", ");
  const driver = group.driver;

  return (
    <Box className="rounded-[20px] border border-brand/60 mb-5 overflow-hidden">
      {/* Card header */}
      <HStack className="px-4 pt-4 pb-3 items-center justify-between">
        <HStack space="xs" className="flex-1 flex-wrap">
          <Text className="text-brand font-bold text-base">
            {group.groupName}
          </Text>
          <Text className="text-typography-400 text-sm">
            {" "}– ({childNames})
          </Text>
        </HStack>
        <TouchableOpacity
          onPress={() => onReport(group.id)}
          className="bg-brand rounded-full px-3 py-1"
        >
          <HStack space="xs" className="items-center">
            <Flag size={11} color="white" />
            <Text className="text-white text-[11px] font-bold">
              Make Report
            </Text>
          </HStack>
        </TouchableOpacity>
      </HStack>

      {/* Inner card */}
      <Box className="mx-3 mb-3 rounded-[14px] bg-background-900 overflow-hidden">
        {/* Driver row */}
        {driver ? (
          <HStack space="sm" className="items-center px-4 pt-4 pb-3">
            <Avatar size="sm" className="bg-purple-300">
              <AvatarFallbackText>{driver.fullName?.[0] ?? "D"}</AvatarFallbackText>
            </Avatar>
            <Text className="text-white font-bold text-sm flex-1">
              {driver.fullName}
            </Text>
            <Box className="bg-brand rounded-full px-2.5 py-0.5">
              <Text className="text-white text-[11px] font-bold">
                {driver.vehicleNumber}
              </Text>
            </Box>
          </HStack>
        ) : (
          <HStack className="px-4 pt-4 pb-3 items-center">
            <Text className="text-typography-500 text-sm italic">
              No driver assigned
            </Text>
          </HStack>
        )}

        {/* Divider */}
        <Box className="h-px bg-outline-800 mx-4 mb-3" />

        {/* Children timeline */}
        <VStack className="px-4 pb-3" space="sm">
          {children.map((child, idx) => (
            <HStack key={child.id} space="sm" className="items-start">
              {/* Timeline dot */}
              <VStack className="items-center" style={{ width: 24 }}>
                <Box className="w-5 h-5 rounded-full border-2 border-outline-500 bg-background-950 items-center justify-center">
                  <Box className="w-2 h-2 rounded-full bg-outline-400" />
                </Box>
                {idx < children.length - 1 && (
                  <Box
                    className="w-px bg-brand/30"
                    style={{ height: 28 }}
                  />
                )}
              </VStack>

              <VStack className="flex-1" space="xs">
                <HStack space="xs" className="items-center flex-wrap">
                  <Text className="text-white font-semibold text-sm">
                    {child.firstName} {child.lastName}
                  </Text>
                  <StatusPill child={child} />
                  {!child.isAbsent && (
                    <ShieldCheck size={13} color="#22c55e" />
                  )}
                </HStack>
                <Text className="text-typography-500 text-xs" numberOfLines={1}>
                  {child.dropoffAddress}
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>

        {/* Countdown + arcs */}
        <HStack className="px-4 pb-4 items-center justify-between">
          {firstEta !== undefined ? (
            <Text className="text-typography-300 text-sm font-semibold">
              Pick up in{" "}
              <Text className="text-white font-bold">{countdown}</Text>
            </Text>
          ) : (
            <Text className="text-typography-500 text-sm">
              {children[0]?.todayPickup?.estimatedTime
                ? `Pickup at ${children[0].todayPickup.estimatedTime}`
                : "Awaiting schedule"}
            </Text>
          )}
        </HStack>

        {/* Arc decoration */}
        <OrangeArcs />
      </Box>
    </Box>
  );
}


// ── Initial state illustration (no children) ───────────────────────────────────
function EmptyIllustration() {
  return (
    <View style={{ alignItems: "center", marginVertical: 32 }}>
      <Svg width={180} height={160} viewBox="0 0 180 160">
        {/* Magnifying glass handle */}
        <Path
          d="M110 110 L140 140"
          stroke="#E66B00"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Magnifying glass circle */}
        <Path
          d="M72 40 A36 36 0 1 1 71.9 40"
          fill="none"
          stroke="#E66B00"
          strokeWidth="7"
        />
        {/* Person body */}
        <Path
          d="M72 76 L72 108 M60 84 L84 84 M72 108 L60 126 M72 108 L84 126"
          stroke="#c07030"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Person head */}
        <Path d="M72 68 A8 8 0 1 1 71.9 68" fill="#c07030" />
        {/* Gear 1 */}
        <Path
          d="M130 50 A14 14 0 1 1 129.9 50"
          fill="none"
          stroke="rgba(230,107,0,0.4)"
          strokeWidth="4"
        />
        {/* Gear 2 */}
        <Path
          d="M25 90 A10 10 0 1 1 24.9 90"
          fill="none"
          stroke="rgba(230,107,0,0.3)"
          strokeWidth="3"
        />
        {/* Dots */}
        <Path d="M150 90 A4 4 0 1 1 149.9 90" fill="rgba(230,107,0,0.5)" />
        <Path d="M30 40 A4 4 0 1 1 29.9 40" fill="rgba(230,107,0,0.4)" />
        <Path d="M155 35 A4 4 0 1 1 154.9 35" fill="rgba(230,107,0,0.3)" />
      </Svg>
    </View>
  );
}

// ── Main HomeScreen ────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useUser();
  const { groups, isLoading, error, refresh } = useParentDashboard();
  const hasGroups = groups && groups.length > 0;

  const handleReport = useCallback((groupId: string) => {
    router.push("/(tabs)/calendar");
  }, []);

  if (isLoading) return <HomeScreenSkeleton />;

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      {/* ── Header ── */}
      <HStack className="px-5 py-4 items-center justify-between">
        <Text className="text-white font-bold text-2xl">
          <Text className="text-brand">S</Text>torks
        </Text>
        <Pressable onPress={() => router.push("/modal")}>
          <Box className="w-10 h-10 rounded-full bg-outline-800 items-center justify-center">
            {user?.imageUrl ? (
              <Avatar size="sm" className="bg-brand">
                <AvatarImage source={{ uri: user.imageUrl }} />
                <AvatarFallbackText>{user.firstName?.[0]}</AvatarFallbackText>
              </Avatar>
            ) : (
              <User size={20} color="#E66B00" />
            )}
          </Box>
        </Pressable>
      </HStack>

      {/* ── Separator ── */}
      <Box className="h-px bg-outline-800 mx-5 mb-1" />

      {/* ── Scrollable content ── */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor="#E66B00"
          />
        }
      >
        {error && (
          <Box className="bg-error-50 border border-error-300 rounded-2xl px-4 py-3 my-3">
            <Text className="text-error-600 text-sm text-center">{error}</Text>
          </Box>
        )}

        {/* ── INITIAL STATE (no children) ── */}
        {!hasGroups && (
          <>
            {/* CTA Banner */}
            <Pressable
              onPress={() => router.push("/(children)/add")}
              className="mt-4 mb-2"
            >
              <Box className="border border-dashed border-brand/60 rounded-[18px] p-4 bg-[#1a0c00]">
                <HStack className="items-center justify-between">
                  <Text
                    className="text-white text-sm leading-5 flex-1 pr-3"
                    numberOfLines={4}
                  >
                    You currently don't have a child profile set up. Create one
                    to fully unlock the use of Storks. Click here to add a new
                    child profile.
                  </Text>
                  <Box className="w-9 h-9 rounded-full border-2 border-brand items-center justify-center">
                    <Plus size={18} color="#E66B00" />
                  </Box>
                </HStack>
              </Box>
            </Pressable>

            {/* Illustration */}
            <EmptyIllustration />
          </>
        )}

        {/* ── WITH CHILDREN STATE ── */}
        {hasGroups && (
          <VStack className="mt-4">
            {groups.map((group) => (
              <GroupStatusCard
                key={group.id}
                group={group}
                onReport={handleReport}
              />
            ))}
          </VStack>
        )}


        {/* Bottom padding for sticky bar */}
        <Box className="h-24" />
      </ScrollView>

      {/* ── Sticky Search Bar ── */}
      <Box className="px-5 pb-4 pt-2">
        <Pressable
          onPress={() =>
            hasGroups ? router.push("/(driver)/SearchScreen") : undefined
          }
        >
          <HStack
            className={`h-14 rounded-full border items-center px-5 justify-between ${
              hasGroups
                ? "border-brand bg-transparent"
                : "border-outline-700 bg-transparent opacity-50"
            }`}
          >
            <Text className="text-typography-400 text-base">Search</Text>
            <Search
              size={20}
              color={hasGroups ? "#E66B00" : "#6b6b6b"}
            />
          </HStack>
        </Pressable>
      </Box>
    </SafeAreaView>
  );
}
