import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { Home, MessageCircle, Calendar, Activity } from "lucide-react-native";
import React, { useEffect, useState } from "react";

import Colors from "@/constants/Colors";
import LoadingScreen from "@/components/LoadingScreen";

export default function TabLayout() {
  const { isSignedIn, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  // We are bypassing user-service status checks for the demonstration
  useEffect(() => {
    if (isSignedIn) {
      setChecking(false);
    }
  }, [isSignedIn]);

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
