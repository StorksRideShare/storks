import { useFonts, Syne_400Regular, Syne_600SemiBold, Syne_700Bold } from "@expo-google-fonts/syne";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useApiClient } from "@/middleware/apiClient";
import type { ChildProfile } from "@/utils/api";

const { width } = Dimensions.get("window");

// ── Placeholder avatar ───────────────────────────────────────────────────────
function AvatarPlaceholder() {
  return (
    <View style={styles.avatarWrap}>
      <View style={styles.avatarPlaceholder} />
    </View>
  );
}

// ── Edit icon (pencil-square) ────────────────────────────────────────────────
function EditIcon() {
  return (
    <View style={styles.editIcon}>
      <Text style={styles.editIconText}>✎</Text>
    </View>
  );
}

// ── Child list row ───────────────────────────────────────────────────────────
function ChildRow({ child }: { child: ChildProfile }) {
  const subtitle =
    child.schoolName
      ? child.schoolName
      : child.age != null
      ? `Age ${child.age}`
      : "Home";

  return (
    <View style={styles.childRow}>
      {child.frontPictureUrl ? (
        <Image source={{ uri: child.frontPictureUrl }} style={styles.avatarWrap} />
      ) : (
        <AvatarPlaceholder />
      )}
      <View style={styles.childInfo}>
        <Text style={styles.childName}>
          {child.firstName} {child.lastName}
        </Text>
        <Text style={styles.childSub}>{subtitle}</Text>
      </View>
      <EditIcon />
    </View>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          You currently don't have a child profile set up, Create one to fully
          unlock the use of Storks. Click here to add a new child profile.
        </Text>
      </View>
      <TouchableOpacity style={styles.orangeBtn} activeOpacity={0.85} onPress={onAdd}>
        <Text style={styles.orangeBtnText}>Add a child</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function MyChildrenScreen() {
  const router = useRouter();
  const api = useApiClient();

  const [fontsLoaded] = useFonts({ Syne_400Regular, Syne_600SemiBold, Syne_700Bold });
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api
        .get<ChildProfile[]>("/api/children")
        .then((data) => { if (active) setChildren(data); })
        .catch(() => { if (active) setChildren([]); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const goAdd = () => router.push("/(tabs)/children/add");

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#E66B00" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (children.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState onAdd={goAdd} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={children}
        keyExtractor={(c) => c.childId}
        renderItem={({ item }) => <ChildRow child={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.addBtnWrap}>
        <TouchableOpacity style={styles.orangeBtn} activeOpacity={0.85} onPress={goAdd}>
          <Text style={styles.orangeBtnText}>Add a child</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171412",
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  childRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    gap: 16,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D9D9D9",
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontFamily: "Syne_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  childSub: {
    fontFamily: "Syne_400Regular",
    fontSize: 13,
    color: "#7A726E",
    marginTop: 2,
  },
  editIcon: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  editIconText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 32,
  },
  infoBox: {
    borderWidth: 1.5,
    borderColor: "#E66B00",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
  },
  infoText: {
    fontFamily: "Syne_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
  },
  orangeBtn: {
    height: 56,
    backgroundColor: "#E66B00",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  orangeBtnText: {
    fontFamily: "Syne_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  addBtnWrap: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
