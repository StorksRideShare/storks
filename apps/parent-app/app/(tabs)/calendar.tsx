import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
      </View>
      
      <View style={styles.alertCard}>
        <Ionicons name="information-circle" size={24} color="#ff9800" />
        <Text style={styles.alertText}>
          Schedule data connects to user-service and booking-service (offline in demo).
        </Text>
      </View>

      <View style={styles.skeletonHeader} />
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonDot} />
        <View style={styles.skeletonLine} />
      </View>
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonDot} />
        <View style={styles.skeletonLine} />
      </View>
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonDot} />
        <View style={styles.skeletonLine} />
      </View>
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
  skeletonHeader: {
    height: 60,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    marginBottom: 24,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  skeletonDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2c2c2c",
    marginRight: 16,
  },
  skeletonLine: {
    flex: 1,
    height: 60,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
  },
});
