import { useAuth } from "@clerk/clerk-expo";
import { Link, Redirect, Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Home, MessageCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import LoadingScreen from "@/components/LoadingScreen";
import { getAuthStatus } from "@/utils/api";

export default function TabLayout() {
  const colorScheme = useColorScheme();
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
        if (!token) { setChecking(false); return; }

        const status = await getAuthStatus(token);
        setIsOnboarded(status.isOnboarded);
        setIsBanned(status.isBanned);
      } catch {
        // If check fails, send to onboarding as safe fallback
        setIsOnboarded(false);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [isSignedIn]);

  // Show loading screen while checking — prevents any flash of home
  if (checking) return <LoadingScreen message="Loading..." />;

  // Not signed in
  if (!isSignedIn) return <Redirect href="/(auth)/signin" />;

  // Banned
  if (isBanned) return <Redirect href="/banned" />;

  // Not onboarded
  if (!isOnboarded) return <Redirect href="/onboarding" />;

  // All good — render tabs
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
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
    </Tabs>
  );
}