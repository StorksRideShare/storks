import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ActivityScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
      </View>
      
      <View style={styles.alertCard}>
        <Ionicons name="information-circle" size={24} color="#ff9800" />
        <Text style={styles.alertText}>
          Activity feed connects to matching-intelligence (offline in demo).
        </Text>
      </View>

      <View style={styles.skeletonItem} />
      <View style={styles.skeletonItem} />
      <View style={styles.skeletonItem} />
      <View style={styles.skeletonItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
  alertText: {
    color: "#ff9800",
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  skeletonItem: {
    height: 80,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    marginBottom: 12,
  },
});
