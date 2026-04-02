import React, { useRef, useState } from "react";
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  Keyboard 
} from "react-native";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Center } from "@/components/ui/center";

interface PINInputProps {
  onComplete: (pin: string) => void;
  title?: string;
}

export const PINInput: React.FC<PINInputProps> = ({ 
  onComplete, 
  title = "Enter Verification PIN" 
}) => {
  const [pin, setPin] = useState("");
  const inputRef = useRef<TextInput>(null);
  const maxLength = 6;

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, "");
    setPin(cleaned);
    
    if (cleaned.length === maxLength) {
      onComplete(cleaned);
      Keyboard.dismiss();
    }
  };

  // Create an array for the 6 boxes
  const boxes = new Array(maxLength).fill(0);

  return (
    <Center className="p-4">
      <Text className="text-lg font-bold mb-6 text-typography-700">{title}</Text>
      
      <Pressable onPress={handlePress}>
        <HStack space="sm" className="justify-center">
          {boxes.map((_, index) => {
            const digit = pin[index] || "";
            const isFocused = pin.length === index;
            
            return (
              <View 
                key={index} 
                style={[
                  styles.box,
                  { borderColor: isFocused ? "#f97316" : (digit ? "#f97316" : "#e5e7eb") },
                  isFocused && styles.focusedBox
                ]}
              >
                <Text style={styles.digitText}>{digit}</Text>
              </View>
            );
          })}
        </HStack>
      </Pressable>

      {/* Hidden TextInput */}
      <TextInput
        ref={inputRef}
        value={pin}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={maxLength}
        style={styles.hiddenInput}
        autoFocus={true}
      />
    </Center>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 45,
    height: 60,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  focusedBox: {
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  digitText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  hiddenInput: {
    position: "absolute",
    width: 0,
    height: 0,
    opacity: 0,
  },
});
