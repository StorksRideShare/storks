import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

import styles from "../../constants/DriverProfileScreenstyle";

const DriverProfileScreen = () => {
  let status = "request";

  const getButtonText = () => {
    if (status === "normal") return "Book Ranidu";
    else if (status === "request") return "Request Sent";
    return "Driving for Loku";
  };

  return (
    <View style={styles.container}>
      <ScrollView>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.back}>←</Text>
          <Text style={styles.title}>Search a Driver</Text>
          <Text style={styles.bookmark}>🔖</Text>
        </View>

        {/* Avatar */}
        <View style={styles.center}>
          <View style={styles.avatar} />
          <Text style={styles.name}>
            Ranidu Sampath <Text style={styles.verify}>✔</Text>
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statMain}>⭐</Text>
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

        {/* Vehicle */}
        <Text style={styles.section}>Vehicle Details</Text>
        <View style={styles.vehicleBox}>
          <View style={styles.imageRow}>
            <View style={styles.image} />
            <View style={styles.image} />
          </View>

          <Text style={styles.vehicleName}>
            Toyota Hiace <Text style={styles.verify}>✔</Text>
          </Text>

          <Text style={styles.plate}>ABC 1223</Text>
        </View>

        {/* Destinations */}
        <Text style={styles.section}>Offered Destinations</Text>

        <View style={styles.destinationBox}>
          {[
            "President’s college - Maharagama",
            "Central college - Maharagama",
            "Vidyakara Balika - Maharagama",
          ].map((item, index) => (
            <View key={index} style={styles.destinationRow}>
              <Text style={styles.location}>📍 {item}</Text>
              <TouchableOpacity style={styles.matchBtn}>
                <Text style={styles.matchText}>Match</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Group */}
        <View style={styles.groupRow}>
          <View style={styles.avatarSmall} />
          <View>
            <Text style={styles.groupTitle}>Group: Chooti</Text>
            <Text style={styles.groupSub}>
              Sadun Janaka, Kanchana Janaka
            </Text>
          </View>
          <Text style={styles.arrow}>▼</Text>
        </View>

  {/* Button */}
  <TouchableOpacity>
    <Text>{getButtonText()}</Text>
  </TouchableOpacity>


      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.nav}>
        <Text style={styles.active}>🏠</Text>
        <Text style={styles.navIcon}>📋</Text>
        <Text style={styles.navIcon}>📅</Text>
        <Text style={styles.navIcon}>📱</Text>
      </View>
    </View>
  );
};

export default DriverProfileScreen;