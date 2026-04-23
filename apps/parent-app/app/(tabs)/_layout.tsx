import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { Home, MessageCircle, Calendar, Activity } from "lucide-react-native";
import React, { useEffect, useState } from "react";

import Colors from "@/constants/Colors";
import LoadingScreen from "@/components/LoadingScreen";
import { useApiClient } from "@/middleware/apiClient";
import type { AuthStatus } from "@/utils/api";

export default function TabLayout() {
  const { isSignedIn, signOut } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  const apiClient = useApiClient("user-service");

  useEffect(() => {
    if (!isSignedIn) {
      setChecking(false);
      return;
    }

    const check = async () => {
      try {
        const status = await apiClient.get<AuthStatus>("/auth/status");
        setIsOnboarded(status.isOnboarded);
        setIsBanned(status.isBanned);
      } catch (err: any) {
        if (err.message && err.message.includes("401")) {
          await signOut();
        }
        // On other errors (like network timeout), we leave isOnboarded as true
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [isSignedIn, apiClient, signOut]);

  if (checking) return <LoadingScreen message="Loading..." />;
  if (!isSignedIn) return <Redirect href="/(auth)/signin" />;
  if (isBanned) return <Redirect href="/banned" />;
  if (!isOnboarded) return <Redirect href="/onboarding" />;

  const BRAND = Colors.dark.tint; // #E66B00

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: Colors.dark.tabIconDefault,
        tabBarStyle: {
          backgroundColor: "#0F0E0E",
          borderTopColor: "#1A1919",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) => <Activity color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
