import * as React from "react";
import { Linking } from "react-native";
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
        stroke="#E66B00"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      <Line x1="38" y1="40" x2="58" y2="58" stroke="#E66B00" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="58" y1="40" x2="38" y2="58" stroke="#E66B00" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

export default function BannedScreen() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleContactSupport = () =>
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Account%20Suspended%20-%20Appeal`);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/signin");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#171412]">
      {/* Logo */}
      <Box className="px-6 pt-5">
        <Text className="text-white font-bold text-2xl">
          <Text className="text-brand">S</Text>torks
        </Text>
      </Box>

      {/* Center content */}
      <VStack className="flex-1 items-center justify-center px-9">
        <Box className="mb-8">
          <BannedIcon />
        </Box>

        <Text className="text-brand font-bold text-2xl text-center mb-5">
          Account Suspended
        </Text>

        <Box className="w-12 h-0.5 bg-brand/50 rounded-full mb-6" />

        <Text className="text-white text-sm text-center leading-6 mb-4">
          Your account has been suspended due to a violation of our community
          guidelines or terms of service.
        </Text>
        <Text className="text-typography-500 text-sm text-center leading-5 mb-7">
          If you believe this is a mistake, please reach out to our support team.
          We'll review your case as soon as possible.
        </Text>

        <Box className="border border-brand rounded-full px-5 py-2">
          <Text className="text-brand font-semibold text-sm">{SUPPORT_EMAIL}</Text>
        </Box>
      </VStack>

      {/* Actions */}
      <VStack className="px-8 pb-8" space="md">
        <Button
          className="h-14 bg-brand rounded-full"
          onPress={handleContactSupport}
        >
          <ButtonText className="text-white font-bold">Contact Support</ButtonText>
        </Button>

        <Button
          variant="outline"
          className="h-14 rounded-full border-outline-700"
          onPress={handleSignOut}
        >
          <ButtonText className="text-typography-500 font-semibold">Sign Out</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}