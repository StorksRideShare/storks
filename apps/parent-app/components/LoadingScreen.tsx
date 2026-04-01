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
import { StorkIllustration } from "./common/StorkIllustration";

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
        <StorkIllustration width={width * 0.55} height={height * 0.32} />
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