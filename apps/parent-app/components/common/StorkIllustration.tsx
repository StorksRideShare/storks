import * as React from "react";
import { Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

interface StorkIllustrationProps {
  width?: number;
  height?: number;
}

export function StorkIllustration({ width: propWidth = 200, height: propHeight = 220 }: StorkIllustrationProps) {
  return (
    <Svg width={propWidth} height={propHeight} viewBox="0 0 220 260" fill="none">
      <Path d="M10 42 L68 42" stroke="#C97A3A" strokeWidth="4" strokeLinecap="round" />
      <Path d="M68 42 Q90 42 96 56" stroke="#D4C5B5" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M96 56 Q110 90 100 130 Q92 155 105 175" stroke="#D4C5B5" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M105 175 Q130 160 155 175 Q175 188 165 215 Q155 238 130 242 Q108 245 100 228 Q88 208 105 175 Z" stroke="#D4C5B5" strokeWidth="3" fill="none" />
      <Path d="M115 242 L112 260" stroke="#D4C5B5" strokeWidth="3" strokeLinecap="round" />
      <Path d="M138 242 L140 260" stroke="#D4C5B5" strokeWidth="3" strokeLinecap="round" />
      <Path d="M150 185 Q185 172 210 180 Q195 195 165 195" stroke="#D4C5B5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}
