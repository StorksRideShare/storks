import { useAuth } from "@clerk/expo";
import { Link, Redirect, Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Home, MessageCircle, Calendar, Activity } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import LoadingScreen from "@/components/LoadingScreen";
import { API_BASE_URL } from "@/middleware/apiClient";
import type { AuthStatus } from "@/utils/api";

export default function TabLayout() {
  // ── All hooks at the top ──────────────────────────────────────
  const colorScheme = useColorScheme();
  const headerShown = useClientOnlyValue(false, true);

  // useAuth is safe here — ClerkProvider wraps the entire app
  const { isSignedIn, getToken } = useAuth();

  const [checking, setChecking] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setChecking(false);
      return;
    }

    const check = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setChecking(false);
          return;
        }

        // Plain fetch with the Clerk token — avoids useSession ordering issues
        const res = await fetch(`${API_BASE_URL}/api/auth/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`${res.status}`);

        const status: AuthStatus = await res.json();
        setIsOnboarded(status.isOnboarded);
        setIsBanned(status.isBanned);
      } catch {
        setIsOnboarded(false);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [isSignedIn]);

  // ── Conditional returns AFTER all hooks ───────────────────────

  if (checking) return <LoadingScreen message="Loading..." />;
  if (!isSignedIn) return <Redirect href="/(auth)/signin" />;
  if (isBanned) return <Redirect href="/banned" />;
  if (!isOnboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <SymbolView
                    name={{ ios: "info.circle", android: "info", web: "info" }}
                    size={25}
                    tintColor={Colors[colorScheme].text}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
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
          title: "Calendar",
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
