import React from "react";
import { View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Center } from "@/components/ui/center";

interface QRShowcaseProps {
  payload: string;
  title?: string;
  description?: string;
}

export const QRShowcase: React.FC<QRShowcaseProps> = ({
  payload,
  title = "Your Verification QR",
  description = "Show this to the driver at pick-up or drop-off",
}) => {
  return (
    <Card className="p-6 m-4 bg-background-50 rounded-2xl shadow-premium">
      <Center>
        <Text className="text-xl font-bold mb-2 text-orange-500">{title}</Text>
        <Text className="text-sm text-typography-500 mb-6 text-center">
          {description}
        </Text>
        
        <View style={styles.qrContainer}>
          <QRCode
            value={payload}
            size={220}
            color="black"
            backgroundColor="white"
          />
        </View>

        <Text className="text-xs text-typography-400 mt-6 italic">
          Valid for a limited time. Do not share with others.
        </Text>
      </Center>
    </Card>
  );
};

const styles = StyleSheet.create({
  qrContainer: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
});
