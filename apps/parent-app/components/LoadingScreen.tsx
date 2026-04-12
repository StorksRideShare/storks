import * as React from "react";
import { Dimensions, Animated, Easing, View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { StorkIllustration } from "./common/StorkIllustration";

const { width, height } = Dimensions.get("window");

function BrandSpinner() {
  const rotation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
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
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Circle cx="20" cy="20" r="16" stroke="#3E2A18" strokeWidth="3" fill="none" />
        <Path
          d="M 20 4 A 16 16 0 1 1 4 20"
          stroke="#E66B00"
          strokeWidth="3"
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

export default function LoadingScreen({ message = "Initializing..." }: LoadingScreenProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: "#171412",
        position: "relative",
        opacity: fadeAnim,
      }}
    >
      {/* Center wordmark + spinner */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 80,
        }}
      >
        {/* Wordmark */}
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <Animated.Text
            style={{ fontSize: 48, color: "#E66B00", fontWeight: "700" }}
          >
            S
          </Animated.Text>
          <Animated.Text
            style={{ fontSize: 48, color: "#FFFFFF", fontWeight: "700" }}
          >
            torks
          </Animated.Text>
        </View>

        {/* Tagline */}
        <Animated.Text
          style={{
            fontSize: 14,
            color: "#FFFFFF",
            letterSpacing: 0.3,
            marginBottom: 52,
            opacity: 0.8,
          }}
        >
          Safe, Secure and Cared.
        </Animated.Text>

        <BrandSpinner />
      </View>

      {/* Stork illustration — bottom right */}
      <View
        style={{ position: "absolute", bottom: 40, right: -10 }}
        pointerEvents="none"
      >
        <StorkIllustration width={width * 0.55} height={height * 0.32} />
      </View>

      {/* Status message — bottom center */}
      <Animated.Text
        style={{
          position: "absolute",
          bottom: 52,
          alignSelf: "center",
          color: "#FFFFFF",
          fontSize: 13,
          letterSpacing: 0.3,
          opacity: 0.6,
        }}
      >
        {message}
      </Animated.Text>
    </Animated.View>
  );
}