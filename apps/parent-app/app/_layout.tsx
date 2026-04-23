import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@/utils/cache";
import {
  DarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Buffer } from "buffer";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
global.Buffer = Buffer;

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

import LoadingScreen from "@/components/LoadingScreen";

import {
  Syne_400Regular,
  Syne_600SemiBold,
  Syne_700Bold,
} from "@expo-google-fonts/syne";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Syne_400Regular,
    Syne_600SemiBold,
    Syne_700Bold,
  });


  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return <LoadingScreen message="Initializing Storks..." />;
  }

  if (error) {
    console.error("Font loading error:", error);
  }

  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <RootLayoutNav />
    </ClerkProvider>
  );
}

function RootLayoutNav() {

  return (
    <GluestackUIProvider mode="dark">
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(driver)" />
          <Stack.Screen name="(verify)" />
          <Stack.Screen name="(groups)" />
          <Stack.Screen name="(offer)" />
          <Stack.Screen name="(track)" />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen name="search-account" options={{ presentation: "modal", headerShown: false }} />
          <Stack.Screen name="chats" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
