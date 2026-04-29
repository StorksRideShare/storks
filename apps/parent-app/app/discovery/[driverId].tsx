import { bookDriver, getDriver, type Driver } from "@/app/api/matching";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";

const GROUP_ID = 1;

export default function DriverProfileScreen() {
  const { driverId } = useLocalSearchParams<{ driverId: string }>();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!driverId) return;
        setLoading(true);
        const data = await getDriver(Number(driverId));
        setDriver(data);
      } catch (e) {
        Alert.alert("Error", (e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [driverId]);

  const onBook = async () => {
    if (!driver) return;
    try {
      setBooking(true);
      const message = await bookDriver(driver.id, GROUP_ID);
      Alert.alert("Booking", message);
      router.replace("/discovery");
    } catch (e) {
      Alert.alert("Booking failed", (e as Error).message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#F97316" size="large" />
      </View>
    );
  }

  if (!driver) {
    return (
      <View style={styles.loader}>
        <Text style={styles.heading}>Driver not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>Search a Driver</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>
          {driver.name} {driver.verified ? "✓" : ""}
        </Text>
        <Text style={styles.text}>Vehicle: {driver.vehicle}</Text>
        <Text style={styles.text}>Plate: {driver.plate}</Text>
        <Text style={styles.text}>
          Seats: {driver.availableSeats}/{driver.totalSeats}
        </Text>
        <Text style={styles.text}>AC: {driver.ac ? "Yes" : "No"}</Text>
        <Text style={styles.text}>NFC: {driver.nfc ? "Yes" : "No"}</Text>
      </View>
      <Pressable style={styles.button} onPress={onBook} disabled={booking}>
        <Text style={styles.buttonText}>{booking ? "Booking..." : `Book ${driver.name}`}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#140A07", padding: 20, paddingTop: 45 },
  loader: { flex: 1, backgroundColor: "#140A07", justifyContent: "center", alignItems: "center" },
  back: { color: "#F97316", fontSize: 18, marginBottom: 14 },
  title: { color: "#F97316", fontSize: 32, fontWeight: "700", marginBottom: 18 },
  card: {
    borderWidth: 1,
    borderColor: "#6F625A",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#1E120E",
  },
  heading: { color: "#FFFFFF", fontSize: 24, fontWeight: "700", marginBottom: 12 },
  text: { color: "#EAEAEA", fontSize: 16, marginBottom: 5 },
  button: { backgroundColor: "#F97316", borderRadius: 28, paddingVertical: 14, marginTop: 20 },
  buttonText: { color: "#FFF", textAlign: "center", fontSize: 18, fontWeight: "700" },
});
