import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { X } from "lucide-react-native";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <Center className="flex-1 p-6 bg-background-0">
        <Text className="text-lg font-bold mb-4 text-center">
          Camera Access Required
        </Text>
        <Text className="text-sm text-typography-500 mb-8 text-center">
          We need your permission to use the camera to scan verification QR codes.
        </Text>
        <Button size="md" variant="solid" action="primary" onPress={requestPermission} className="bg-orange-500">
          <ButtonText>Grant Permission</ButtonText>
        </Button>
        <TouchableOpacity onPress={onClose} className="mt-8">
          <Text className="text-sm text-orange-600 font-medium">Cancel</Text>
        </TouchableOpacity>
      </Center>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      
      {/* Overlay UI */}
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X color="white" size={28} />
        </TouchableOpacity>
        
        <View style={styles.scanFrameContainer}>
          <View style={styles.scanFrame} />
          <Text className="text-white text-base font-semibold mt-8 text-center">
            Align the QR code within the frame to scan
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 30,
    zIndex: 10,
    padding: 8,
  },
  scanFrameContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#d47706ff",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
});
