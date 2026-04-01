import { SignOutButton } from "@/components/SignOutButton";
import { Image } from "expo-image";
import { Text, View } from "@/components/Themed";
import { Show, useSession, useUser } from "@clerk/expo";
import { Link } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Syne_400Regular,
  Syne_600SemiBold,
  Syne_700Bold,
} from "@expo-google-fonts/syne";
import { useFonts } from "expo-font";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";

export default function Page() {
  const { user } = useUser();

  const [fontsLoaded] = useFonts({
    Syne_400Regular,
    Syne_600SemiBold,
    Syne_700Bold,
  });

  // If your user isn't appearing as signed in,
  // it's possible they have session tasks to complete.
  // Learn more: https://clerk.com/docs/guides/configure/session-tasks
  const { session } = useSession();
  console.log(session?.currentTask);

  if (!fontsLoaded) return null;

  return (
    <Box style={styles.safeArea}>
      <VStack style={styles.container} className="mt-40">
        <Text style={styles.welcomeText}>Welcome!</Text>

        {/* Show the sign-in and sign-up buttons when the user is signed out */}
        <Show when="signed-out">
          <Link href="/(auth)/signin" asChild>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Sign in</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity style={styles.outlineButton} activeOpacity={0.8}>
              <Text style={styles.outlineButtonText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </Show>

        {/* Show the sign-out button when the user is signed in */}
        <Show when="signed-in">
          <Text style={styles.emailText}>
            {user?.emailAddresses[0].emailAddress}
          </Text>
          <Link
            href={{
              pathname: "/(tabs)",
            }}
            asChild
          >
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Go Home</Text>
            </TouchableOpacity>
          </Link>
          <SignOutButton />
        </Show>
        <Image
          source={require("../../assets/images/the_stork.svg")}
          contentFit="contain"
          transition={1000}
          style={{
            position: "absolute",
            bottom: 16,
            right: 0,
            width: 300,
            height: 300,
            opacity: 0.5,
          }}
        />
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#171412",
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: "transparent",
    gap: 16,
  },
  welcomeText: {
    fontFamily: "Syne_400Regular",
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 32,
  },
  emailText: {
    fontFamily: "Syne_400Regular",
    fontSize: 14,
    color: "#7A726E",
    textAlign: "center",
    marginBottom: 8,
  },
  primaryButton: {
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: "Syne_700Bold",
    color: "#000000",
    fontSize: 16,
  },
  outlineButton: {
    height: 60,
    backgroundColor: "transparent",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E66B00",
    justifyContent: "center",
    alignItems: "center",
  },
  outlineButtonText: {
    fontFamily: "Syne_600SemiBold",
    color: "#E66B00",
    fontSize: 16,
  },
});
