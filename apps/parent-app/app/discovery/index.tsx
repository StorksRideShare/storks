import { searchDrivers, type Driver } from "@/app/api/matching";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

export default function DiscoveryScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [seats, setSeats] = useState("1");
  const [ac, setAc] = useState(false);
  const [nfc, setNfc] = useState(false);
  const [error, setError] = useState("");

  const runSearch = async () => {
    try {
      setLoading(true);
      const data = await searchDrivers({
        seats: Number(seats),
        ac,
        nfc,
      });
      setDrivers(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search a Driver</Text>
      <Text style={styles.resultsText}>Showing {drivers.length} results</Text>
      <View style={styles.filters}>
        <TextInput
          style={styles.seatsInput}
          placeholder="Seats"
          placeholderTextColor="#8B8B8B"
          keyboardType="numeric"
          value={seats}
          onChangeText={setSeats}
        />
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>AC</Text>
          <Switch value={ac} onValueChange={setAc} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>NFC</Text>
          <Switch value={nfc} onValueChange={setNfc} />
        </View>
        <Pressable style={styles.searchButton} onPress={runSearch}>
          <Text style={styles.searchButtonText}>Search Again</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#F97316" size="large" />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.empty}>No drivers found.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/discovery/[driverId]",
                  params: { driverId: String(item.id) },
                })
              }
            >
              <Text style={styles.driverName}>
                {item.name} {item.verified ? "✓" : ""}
              </Text>
              <Text style={styles.meta}>{item.vehicle}</Text>
              <Text style={styles.meta}>Plate: {item.plate}</Text>
              <Text style={styles.meta}>
                Seats: {item.availableSeats}/{item.totalSeats} | AC: {item.ac ? "Yes" : "No"} | NFC:{" "}
                {item.nfc ? "Yes" : "No"}
              </Text>
            </Pressable>
          )}
        />
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#140A07", padding: 20, paddingTop: 50 },
  header: { color: "#F97316", fontSize: 34, fontWeight: "700", marginBottom: 14 },
  resultsText: { color: "#FFFFFF", fontSize: 18, marginBottom: 10 },
  filters: { backgroundColor: "#1E120E", borderRadius: 12, padding: 12, marginBottom: 14 },
  seatsInput: {
    borderWidth: 1,
    borderColor: "#F97316",
    borderRadius: 10,
    color: "#FFF",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchText: { color: "#FFF", fontSize: 16 },
  searchButton: { backgroundColor: "#F97316", borderRadius: 10, marginTop: 10, paddingVertical: 10 },
  searchButtonText: { color: "#FFF", textAlign: "center", fontSize: 16, fontWeight: "700" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#F97316",
  },
  driverName: { color: "#DF6C00", fontSize: 20, fontWeight: "700" },
  meta: { color: "#222", marginTop: 2 },
  empty: { color: "#DDD", textAlign: "center", marginTop: 40 },
  error: { color: "#FF8E8E", marginTop: 6, textAlign: "center" },
});
