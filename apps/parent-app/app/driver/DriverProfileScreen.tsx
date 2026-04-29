import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  ChevronLeft, 
  Bookmark, 
  Star, 
  CheckCircle2, 
  MapPin, 
  ChevronDown, 
  Home, 
  ClipboardList, 
  Calendar, 
  Smartphone,
  User
} from "lucide-react-native";
import api from "../api/axios";
import styles from "../../constants/DriverProfileScreenstyle";

interface DriverDetails {
  id: number;
  name: string;
  vehicle: string;
  plate: string;
  availableSeats: number;
  totalSeats: number;
  ac: boolean;
  nfc: boolean;
  verified: boolean;
}

const DriverProfileScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const fetchDriverDetails = useCallback(async () => {
    try {
      const response = await api.get(`/api/search/drivers/${id}`);
      setDriver(response.data);
    } catch (err) {
      console.error("Failed to fetch driver details:", err);
      Alert.alert("Error", "Could not load driver profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchDriverDetails();
  }, [id, fetchDriverDetails]);

  const handleBook = async () => {
    setBooking(true);
    try {
      const groupId = 1; // Assuming hardcoded group context
      await api.post(`/api/search/drivers/${id}/book?groupId=${groupId}`);
      
      Alert.alert("Success", `You have successfully booked ${driver?.name}!`, [
        { text: "View Group", onPress: () => router.push("/groups") }
      ]);
    } catch (err) {
      console.error("Booking failed:", err);
      Alert.alert("Booking Failed", "Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a0f0a' }}>
        <ActivityIndicator size="large" color="#ff6a00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#ff6a00" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>Driver Profile</Text>
          <TouchableOpacity>
            <Bookmark color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.center}>
          <View style={[styles.avatar, { backgroundColor: '#3a2a24', justifyContent: 'center', alignItems: 'center' }]}>
            <User color="#ff6a00" size={50} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Text style={styles.name}>{driver?.name}</Text>
            {driver?.verified && <CheckCircle2 color="#ff6a00" size={18} style={{ marginLeft: 6 }} />}
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Star color="#ffcc00" size={20} fill="#ffcc00" />
            <Text style={styles.statSub}>4.8 Rated</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statMain}>5 Years</Text>
            <Text style={styles.statSub}>Experience</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statMain}>+500</Text>
            <Text style={styles.statSub}>Safe Trips</Text>
          </View>
        </View>

        {/* Vehicle Details */}
        <Text style={styles.section}>Vehicle Details</Text>
        <View style={styles.vehicleBox}>
          <View style={styles.imageRow}>
            <View style={[styles.image, { backgroundColor: '#2a1a14' }]} />
            <View style={[styles.image, { backgroundColor: '#2a1a14' }]} />
          </View>

          <Text style={styles.vehicleName}>
            {driver?.vehicle} {driver?.verified && <CheckCircle2 color="#ff6a00" size={14} />}
          </Text>

          <Text style={styles.plate}>{driver?.plate}</Text>
        </View>

        {/* Destinations */}
        <Text style={styles.section}>Offered Destinations</Text>
        <View style={styles.destinationBox}>
          {[
            "President’s college - Maharagama",
            "Central college - Maharagama",
          ].map((item, index) => (
            <View key={index} style={styles.destinationRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <MapPin color="#ff6a00" size={16} />
                <Text style={[styles.location, { marginLeft: 8 }]}>{item}</Text>
              </View>
              <TouchableOpacity style={styles.matchBtn}>
                <Text style={styles.matchText}>Match</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Linked Group Info */}
        <View style={styles.groupRow}>
          <View style={[styles.avatarSmall, { backgroundColor: '#3a2a24', justifyContent: 'center', alignItems: 'center' }]}>
            <User color="#ff6a00" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.groupTitle}>Group: Chooti</Text>
            <Text style={styles.groupSub}>Members pending booking...</Text>
          </View>
          <ChevronDown color="white" size={20} />
        </View>

        {/* Primary Booking Button */}
        <TouchableOpacity 
          style={[
            { height: 56, backgroundColor: '#ff6a00', borderRadius: 28, margin: 16, justifyContent: 'center', alignItems: 'center' },
            booking && { opacity: 0.7 }
          ]} 
          onPress={handleBook}
          disabled={booking}
        >
          {booking ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Book {driver?.name}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.replace('/groups')}>
          <Home color="#ff6a00" size={24} />
        </TouchableOpacity>
        <ClipboardList color="white" size={24} />
        <Calendar color="white" size={24} />
        <Smartphone color="white" size={24} />
      </View>
    </SafeAreaView>
  );
};

export default DriverProfileScreen;