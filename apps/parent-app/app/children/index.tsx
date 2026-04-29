import { getChildren, getGroup, type Child } from "@/app/api/matching";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const GROUP_ID = 1;

export default function ChildrenScreen() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [groupName, setGroupName] = useState("My children");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [group, childList] = await Promise.all([
          getGroup(GROUP_ID),
          getChildren(GROUP_ID),
        ]);
        setGroupName(group.groupName || "My children");
        setChildren(childList);
        setError("");
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{groupName}</Text>

      {loading ? (
        <ActivityIndicator color="#F97316" size="large" />
      ) : children.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            You currently do not have a child profile set up. Add a child to unlock discovery.
          </Text>
        </View>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item, index) => `${item.id ?? index}`}
          renderItem={({ item }) => (
            <View style={styles.childCard}>
              <Text style={styles.childName}>{item.name}</Text>
              <Text style={styles.childMeta}>Age {item.age}</Text>
              <Text style={styles.childMeta}>{item.dropLocation}</Text>
            </View>
          )}
        />
      )}

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable style={styles.button} onPress={() => router.push("/children/add")}>
        <Text style={styles.buttonText}>Add a child</Text>
      </Pressable>
      {!!children.length && (
        <Pressable style={styles.secondaryButton} onPress={() => router.push("/discovery")}>
          <Text style={styles.secondaryButtonText}>Search a Driver</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#140A07", padding: 20, paddingTop: 50 },
  header: { color: "#F97316", fontSize: 34, fontWeight: "700", marginBottom: 22 },
  emptyCard: {
    borderWidth: 1,
    borderColor: "#8D5A3A",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  emptyText: { color: "#FFFFFF", fontSize: 16, textAlign: "center" },
  childCard: {
    backgroundColor: "#1F130F",
    borderWidth: 1,
    borderColor: "#2E211A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  childName: { color: "#FFFFFF", fontSize: 20, fontWeight: "700", marginBottom: 6 },
  childMeta: { color: "#C4BDB8", fontSize: 14 },
  button: { backgroundColor: "#F97316", borderRadius: 28, paddingVertical: 14, marginTop: 16 },
  buttonText: { color: "#FFFFFF", textAlign: "center", fontSize: 18, fontWeight: "700" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#F97316",
    borderRadius: 28,
    paddingVertical: 14,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#F97316",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  errorText: { color: "#FF8E8E", marginTop: 10, marginBottom: 4, textAlign: "center" },
});
