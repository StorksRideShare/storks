import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" />
      <Stack.Screen name="children/index" />
      <Stack.Screen name="children/add" />
      <Stack.Screen name="discovery/index" />
      <Stack.Screen name="discovery/[driverId]" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
