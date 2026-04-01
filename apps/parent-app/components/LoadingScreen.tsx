import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import {
  Syne_700Bold,
  Syne_400Regular,
} from "@expo-google-fonts/syne";
import { useFonts } from "expo-font";

const { width, height } = Dimensions.get("window");

// Animated spinner using react-native Animated API
function Spinner() {
  const rotation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Svg width={36} height={36} viewBox="0 0 36 36">
        {/* Full circle background (dim) */}
        <Circle
          cx="18"
          cy="18"
          r="15"
          stroke="#3E2A18"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Arc — roughly 270deg arc to mimic the spinner in the image */}
        <Path
          d="M 18 3 A 15 15 0 1 1 3 18"
          stroke="#E66B00"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

// Stork line-art SVG matching the illustration in the bottom-right
function StorkIllustration() {
  return (
    <Svg
      width={width * 0.55}
      height={height * 0.32}
      viewBox="0 0 220 260"
      fill="none"
    >
      {/* Beak — orange/brown horizontal line */}
      <Path
        d="M 10 42 L 68 42"
        stroke="#B85C20"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Head curve */}
      <Path
        d="M 68 42 Q 90 42 96 56"
        stroke="#B0A99A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Long neck sweeping down */}
      <Path
        d="M 96 56 Q 110 90 100 130 Q 92 155 105 175"
        stroke="#B0A99A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Body / chest oval */}
      <Path
        d="M 105 175 Q 130 160 155 175 Q 175 188 165 215 Q 155 238 130 242 Q 108 245 100 228 Q 88 208 105 175 Z"
        stroke="#B0A99A"
        strokeWidth="3"
        fill="none"
      />
      {/* Left leg */}
      <Path
        d="M 115 242 L 112 260"
        stroke="#B0A99A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Right leg */}
      <Path
        d="M 138 242 L 140 260"
        stroke="#B0A99A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Wing hint */}
      <Path
        d="M 150 185 Q 185 172 210 180 Q 195 195 165 195"
        stroke="#B0A99A"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Initializing...",
}: LoadingScreenProps) {
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    Syne_400Regular,
  });

  // Fade-in animation for the whole screen
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Center content */}
      <View style={styles.centerContent}>
        <Text
          style={[
            styles.logoText,
            fontsLoaded ? { fontFamily: "Syne_700Bold" } : { fontWeight: "700" },
          ]}
        >
          <Text style={styles.logoHighlight}>S</Text>torks
        </Text>
        <Text
          style={[
            styles.tagline,
            fontsLoaded
              ? { fontFamily: "Syne_400Regular" }
              : { fontWeight: "400" },
          ]}
        >
          Safe, Secure and Cared.
        </Text>

        {/* Spinner */}
        <View style={styles.spinnerContainer}>
          <Spinner />
        </View>
      </View>

      {/* Stork illustration — bottom right */}
      <View style={styles.storkContainer} pointerEvents="none">
        <StorkIllustration />
      </View>

      {/* Initializing text — bottom center */}
      <Text
        style={[
          styles.initText,
          fontsLoaded
            ? { fontFamily: "Syne_400Regular" }
            : { fontWeight: "400" },
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171412",
    position: "relative",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 80,
  },
  logoText: {
    fontSize: 48,
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 8,
  },
  logoHighlight: {
    color: "#E66B00",
  },
  tagline: {
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 0.3,
    marginBottom: 48,
  },
  spinnerContainer: {
    marginTop: 8,
  },
  storkContainer: {
    position: "absolute",
    bottom: 40,
    right: -10,
  },
  initText: {
    position: "absolute",
    bottom: 52,
    alignSelf: "center",
    color: "#FFFFFF",
    fontSize: 14,
    letterSpacing: 0.3,
  },
});