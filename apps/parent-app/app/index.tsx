import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen message="Loading..." />;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/signin" />;
}
