import { useFonts, Syne_400Regular, Syne_600SemiBold, Syne_700Bold } from "@expo-google-fonts/syne";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { childFormStore, type DaySchedule } from "@/utils/childFormStore";

export default function CustomScheduleScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Syne_400Regular, Syne_600SemiBold, Syne_700Bold });

  const [schedule, setSchedule] = useState<DaySchedule[]>(() =>
    childFormStore.getSchedule().map((d) => ({ ...d }))
  );

  const updateAddress = (index: number, value: string) => {
    const updated = schedule.map((d, i) =>
      i === index ? { ...d, customDropoffAddress: value } : d
    );
    setSchedule(updated);
  };

  const save = () => {
    childFormStore.setSchedule(schedule);
    router.back();
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Custom Schedule</Text>

          <Text style={styles.infoText}>
            By default the home address becomes the drop off location. Leave
            empty to use the default drop off.
          </Text>

          {schedule.map((day, i) => (
            <TextInput
              key={day.day}
              style={styles.input}
              placeholder={day.label}
              placeholderTextColor="#7A726E"
              value={day.customDropoffAddress}
              onChangeText={(v) => updateAddress(i, v)}
            />
          ))}

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              These schedules repeat every week. To add custom schedules for
              specific dates, You can customize them through the schedule. Click
              here to go to schedule.
            </Text>
          </View>

          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={save}>
            <Text style={styles.saveBtnText}>Customize schedule</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171412",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 48,
    gap: 16,
  },
  pageTitle: {
    fontFamily: "Syne_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  infoText: {
    fontFamily: "Syne_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 22,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E66B00",
    borderRadius: 28,
    paddingHorizontal: 20,
    color: "#FFFFFF",
    fontFamily: "Syne_400Regular",
    fontSize: 15,
    backgroundColor: "transparent",
    textAlign: "center",
  },
  noteBox: {
    borderWidth: 1.5,
    borderColor: "#E66B00",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  noteText: {
    fontFamily: "Syne_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
  },
  saveBtn: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    fontFamily: "Syne_700Bold",
    fontSize: 15,
    color: "#000000",
  },
});
