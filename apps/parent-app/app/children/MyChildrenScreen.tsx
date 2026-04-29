import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, User, Edit2, PlusCircle } from "lucide-react-native";
import api from "../api/axios";
import styles  from "../../constants/MyChildrenScreenstyle";

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  pickupLocation: string;
  dropLocation: string;
}

const MyChildrenScreen = () => {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChildren = useCallback(async () => {
    try {
      const groupId = 1;
      const response = await api.get(`/api/groups/${groupId}/children`);
      setChildren(response.data);
    } catch (err) {
      console.error("Failed to fetch children:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChildren();
  };

  const renderItem = ({ item }: { item: Child }) => (
    <View style={styles.itemContainer}>
      <View style={styles.left}>
        <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#3a2a24', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
          <User color="#ff6a00" size={24} />
        </View>

        <View>
          <Text style={styles.name}>{`${item.firstName} ${item.lastName}`}</Text>
          <Text style={styles.sub}>Age {item.age} • {item.dropLocation}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push('/children/CustomScheduleScreen')}>
        <Edit2 color="white" size={18} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/groups')}>
          <ChevronLeft color="#ff6a00" size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>My Children</Text>
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ff6a00" />
        </View>
      ) : (
        /* List */
        <FlatList
          data={children}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6a00" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <Text style={{ color: '#888' }}>No children profiles added yet.</Text>
            </View>
          }
        />
      )}

      {/* Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/children/AddChildScreen')}
      >
        <PlusCircle color="white" size={20} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Add a child</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MyChildrenScreen;