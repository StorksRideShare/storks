import { addChild } from "@/app/api/matching";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const GROUP_ID = 1;

export default function AddChildScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [age, setAge] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const displayName = preferredName || `${firstName} ${lastName}`.trim();
    if (!displayName || !age || !pickupLocation || !dropLocation) {
      Alert.alert("Missing data", "Please fill all child fields.");
      return;
    }

    try {
      setSaving(true);
      await addChild(GROUP_ID, {
        name: displayName,
        age: Number(age),
        pickupLocation,
        dropLocation,
      });
      router.replace("/children");
    } catch (e) {
      Alert.alert("Failed", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Child</Text>
      <TextInput
        placeholder="First name"
        placeholderTextColor="#7E7E7E"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        placeholder="Last name"
        placeholderTextColor="#7E7E7E"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        placeholder="Preferred name"
        placeholderTextColor="#7E7E7E"
        style={styles.input}
        value={preferredName}
        onChangeText={setPreferredName}
      />
      <TextInput
        placeholder="Age"
        keyboardType="numeric"
        placeholderTextColor="#7E7E7E"
        style={styles.input}
        value={age}
        onChangeText={setAge}
      />
      <TextInput
        placeholder="Pickup location"
        placeholderTextColor="#7E7E7E"
        style={styles.input}
        value={pickupLocation}
        onChangeText={setPickupLocation}
      />
      <TextInput
        placeholder="Drop location"
        placeholderTextColor="#7E7E7E"
        style={styles.input}
        value={dropLocation}
        onChangeText={setDropLocation}
      />
      <Pressable style={styles.button} onPress={onSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Saving..." : "Add child"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#140A07", padding: 20, paddingTop: 50 },
  header: { color: "#FFFFFF", fontSize: 34, fontWeight: "700", marginBottom: 22 },
  input: {
    borderWidth: 1,
    borderColor: "#F97316",
    borderRadius: 28,
    color: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: { backgroundColor: "#F97316", borderRadius: 28, paddingVertical: 14, marginTop: 8 },
  buttonText: { color: "#FFFFFF", textAlign: "center", fontSize: 18, fontWeight: "700" },
});
