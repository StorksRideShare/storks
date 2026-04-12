import React from "react";
import { View, ViewStyle, Platform, StyleSheet, TouchableOpacity, Text as RNText } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Text } from "@/components/ui/text";
import { useOAuth } from "@clerk/expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

const absoluteFill = { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } as const;

interface AuthContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AuthContainer({ children, style }: AuthContainerProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: "#0A0A0A" }]}>
      {/* Background Ambient Orbs — pointer-events none so they never eat touches */}
      <View style={[absoluteFill, { overflow: "hidden" }]} pointerEvents="none">
        <View style={styles.topOrb} />
        <View style={styles.bottomOrb} />
      </View>

      {/* Blur / solid overlay — pointer-events none */}
      {Platform.OS === "ios" ? (
        <BlurView intensity={80} tint="dark" style={absoluteFill} pointerEvents="none" />
      ) : (
        <View
          style={[absoluteFill, { backgroundColor: "rgba(10,10,10,0.85)" }]}
          pointerEvents="none"
        />
      )}

      {/* Subtle overlay gradient — pointer-events none */}
      <LinearGradient
        colors={["rgba(28,25,23,0.3)", "rgba(234,88,12,0.03)", "rgba(28,25,23,0.4)"]}
        style={absoluteFill}
        pointerEvents="none"
      />

      {/* Interactive content wrapper — sits above all overlays via zIndex */}
      <View
        style={[
          {
            flex: 1,
            zIndex: 10,
            paddingHorizontal: 24,
            paddingVertical: 40,
            justifyContent: "center",
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function AuthLogo() {
  return (
    <View style={{ alignItems: "center", marginBottom: 40, paddingTop: 32 }}>
      <View style={{ height: 128, width: 128, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Image
          source={require("@/assets/images/the_stork.svg")}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
        />
      </View>
      <RNText style={{ color: "white", fontWeight: "bold", fontSize: 36, letterSpacing: -0.5 }}>
        Storks
      </RNText>
      <RNText style={{ color: "#737373", fontSize: 14, marginTop: 12, textAlign: "center", paddingHorizontal: 24, lineHeight: 20 }}>
        A secure ride for your precious~
      </RNText>
    </View>
  );
}

export function OAuthButtons() {
  const router = useRouter();
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: "oauth_apple" });

  const onGooglePress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleOAuthFlow({
        redirectUrl: Linking.createURL("/(tabs)", { scheme: "parentapp" }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("OAuth Google Error", err);
    }
  }, [startGoogleOAuthFlow, router]);

  const onApplePress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startAppleOAuthFlow({
        redirectUrl: Linking.createURL("/(tabs)", { scheme: "parentapp" }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("OAuth Apple Error", err);
    }
  }, [startAppleOAuthFlow, router]);

  return (
    <View style={{ width: "100%", marginTop: 24 }}>
      {/* Divider */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: "#262626" }} />
        <RNText style={{ color: "#737373", marginHorizontal: 16, fontWeight: "600", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
          Or continue with
        </RNText>
        <View style={{ flex: 1, height: 1, backgroundColor: "#262626" }} />
      </View>

      {/* Google Button — using TouchableOpacity for reliable touch on all platforms */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onGooglePress}
        style={styles.oauthButton}
      >
        <FontAwesome name="google" size={20} color="white" style={{ marginRight: 12 }} />
        <RNText style={styles.oauthButtonText}>Continue with Google</RNText>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onApplePress}
          style={[styles.oauthButton, { marginTop: 12 }]}
        >
          <FontAwesome name="apple" size={20} color="white" style={{ marginRight: 12 }} />
          <RNText style={styles.oauthButtonText}>Continue with Apple</RNText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topOrb: {
    position: "absolute",
    top: -150,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#ea580c",
    opacity: 0.15,
  },
  bottomOrb: {
    position: "absolute",
    bottom: -150,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#fb923c",
    opacity: 0.1,
  },
  oauthButton: {
    width: "100%",
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#404040",
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  oauthButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
