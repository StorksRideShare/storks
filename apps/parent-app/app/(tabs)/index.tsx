import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { LogOut } from "lucide-react-native";

export default function IndexScreen() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity 
          onPress={() => signOut()}
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <LogOut color="#ff9800" size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.alertCard}>
        <Ionicons name="information-circle" size={24} color="#ff9800" />
        <Text style={styles.alertText}>
          Dashboard connects to user-service (offline in demo).
        </Text>
      </View>

      <View style={styles.skeletonCard} />
      <View style={styles.skeletonCard} />
      <View style={styles.skeletonCard} />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
  logoutText: {
    color: "#ff9800",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
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
  skeletonCard: {
    height: 120,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    marginBottom: 16,
    opacity: 0.6,
  },
});
