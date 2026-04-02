import { SignOutButton } from "@/components/SignOutButton";
import { MonoText } from "@/components/StyledText";
import { Text, View } from "@/components/Themed";
import { SignedIn, SignedOut, useSession, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";

export default function Page() {
  const { user } = useUser();

  // If your user isn't appearing as signed in,
  // it's possible they have session tasks to complete.
  // Learn more: https://clerk.com/docs/guides/configure/session-tasks
  const { session } = useSession();
  console.log(session?.currentTask);

  return (
    <View style={styles.container}>
      <MonoText>Welcome!</MonoText>
      {/* Show the sign-in and sign-up buttons when the user is signed out */}
      <SignedOut>
        <Link href="/(auth)/signin">
          <MonoText>Sign in</MonoText>
        </Link>
        <Link href="/(auth)/signup">
          <MonoText>Sign up</MonoText>
        </Link>
      </SignedOut>
      {/* Show the sign-out button when the user is signed in */}
      <SignedIn>
        <MonoText>Hello {user?.emailAddresses[0].emailAddress}</MonoText>
        <Link
          href={{
            pathname: "/(tabs)",
          }}
        >
          <Text>Home</Text>
        </Link>
        <SignOutButton />
      </SignedIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
});
