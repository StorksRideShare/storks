import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen message="Initializing..." />;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}