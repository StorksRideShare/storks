import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";

interface PINShowcaseProps {
  pin: string;
  title?: string;
  description?: string;
}

export const PINShowcase: React.FC<PINShowcaseProps> = ({
  pin,
  title = "Your Verification PIN",
  description = "Share this 6-digit PIN with the driver",
}) => {
  // Split PIN into digits for display
  const digits = pin.split("");

  return (
    <Card className="p-6 m-4 bg-background-50 rounded-2xl shadow-premium">
      <Center>
        <Text className="text-xl font-bold mb-2 text-orange-500">{title}</Text>
        <Text className="text-sm text-typography-500 mb-8 text-center">
          {description}
        </Text>
        
        <HStack space="md" className="justify-center">
          {digits.map((digit, index) => (
            <View key={index} style={styles.digitBox}>
              <Text style={styles.digitText}>{digit}</Text>
            </View>
          ))}
        </HStack>

        <Text className="text-xs text-typography-400 mt-8 italic text-center">
          This PIN is unique to your current ride.
        </Text>
      </Center>
    </Card>
  );
};

const styles = StyleSheet.create({
  digitBox: {
    width: 45,
    height: 60,
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  digitText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
});
