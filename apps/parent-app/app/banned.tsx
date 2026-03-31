import * as React from "react";
import { Platform, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Line } from "react-native-svg";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";

const SUPPORT_EMAIL = "support@storks.app";

function BannedIcon() {
  return (
    <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
      <Circle cx="48" cy="48" r="44" stroke="#3E2A18" strokeWidth="2" />
      <Path
        d="M48 18 L70 27 L70 50 C70 63 58 72 48 76 C38 72 26 63 26 50 L26 27 Z"
        stroke="#E66B00" strokeWidth="2.5" strokeLinejoin="round" fill="none"
      />
      <Line x1="38" y1="40" x2="58" y2="58" stroke="#E66B00" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="58" y1="40" x2="38" y2="58" stroke="#E66B00" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

export default function BannedScreen() {
  const { signOut } = useClerk();
  const router      = useRouter();

  const handleContactSupport = () =>
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Account%20Suspended%20-%20Appeal`);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/signin");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <Box style={styles.logoContainer}>
        <Text style={styles.logoText}>
          <Text style={styles.logoHighlight}>S</Text>torks
        </Text>
      </Box>

      {/* Center content */}
      <VStack style={styles.centerContent}>
        <Box style={styles.iconContainer}>
          <BannedIcon />
        </Box>

        <Text style={styles.headline}>Account Suspended</Text>
        <Box style={styles.divider} />

        <Text style={styles.body}>
          Your account has been suspended due to a violation of our community
          guidelines or terms of service.
        </Text>
        <Text style={styles.subBody}>
          If you believe this is a mistake, please reach out to our support
          team. We'll review your case as soon as possible.
        </Text>

        <Box style={styles.emailPill}>
          <Text style={styles.emailPillText}>{SUPPORT_EMAIL}</Text>
        </Box>
      </VStack>

      {/* Actions */}
      <VStack style={styles.actionsContainer}>
        <Button style={styles.primaryButton} onPress={handleContactSupport}>
          <ButtonText style={styles.primaryButtonText}>Contact Support</ButtonText>
        </Button>

        <Button style={styles.secondaryButton} variant="outline" onPress={handleSignOut}>
          <ButtonText style={styles.secondaryButtonText}>Sign Out</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: "#171412" },
  logoContainer:     { paddingTop: Platform.OS === "android" ? 40 : 20, paddingLeft: 24 },
  logoText:          { fontFamily: "Syne_700Bold", fontSize: 22, color: "#FFFFFF", letterSpacing: 0.5 },
  logoHighlight:     { fontFamily: "Syne_700Bold", color: "#E66B00" },
  centerContent:     { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36 },
  iconContainer:     { marginBottom: 32 },
  headline:          { fontFamily: "Syne_700Bold", fontSize: 24, color: "#E66B00", textAlign: "center", marginBottom: 20 },
  divider:           { width: 48, height: 2, backgroundColor: "#E66B00", borderRadius: 1, marginBottom: 24, opacity: 0.5 },
  body:              { fontFamily: "Syne_400Regular", fontSize: 14, color: "#FFFFFF", textAlign: "center", lineHeight: 22, marginBottom: 16 },
  subBody:           { fontFamily: "Syne_400Regular", fontSize: 13, color: "#7A726E", textAlign: "center", lineHeight: 20, marginBottom: 28 },
  emailPill:         { borderWidth: 1, borderColor: "#E66B00", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 },
  emailPillText:     { fontFamily: "Syne_600SemiBold", fontSize: 13, color: "#E66B00" },
  actionsContainer:  { paddingHorizontal: 32, paddingBottom: Platform.OS === "android" ? 32 : 16, gap: 14 },
  primaryButton:     { height: 56, backgroundColor: "#E66B00", borderRadius: 28, justifyContent: "center", alignItems: "center" },
  primaryButtonText: { fontFamily: "Syne_700Bold", color: "#FFFFFF", fontSize: 15 },
  secondaryButton:   { height: 56, borderRadius: 28, borderWidth: 1, borderColor: "#3E3834", justifyContent: "center", alignItems: "center" },
  secondaryButtonText: { fontFamily: "Syne_600SemiBold", color: "#7A726E", fontSize: 15 },
});