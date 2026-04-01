import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import styles from "../../constants/ManageRequestsScreenstyle";

const ManageRequestsScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.back}>←</Text>
          <Text style={styles.title}>Manage Requests</Text>
        </View>

        {/* Occupancy */}
        <Text style={styles.section}>Remaining Seats</Text>

        <View style={styles.center}>
          <Text style={styles.occupancy}>OCCUPANCY</Text>
          <Text style={styles.count}>
            10 <Text style={styles.total}>/12</Text>
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Seats Filled</Text>
          </View>
        </View>

        {/* Requests Title */}
        <Text style={styles.section}>All Requests</Text>

        {/* Request Card 1 */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>Kaushalya Viracon</Text>
              <Text style={styles.verified}>Verified</Text>
            </View>
            <Text style={styles.seats}>🪑 2</Text>
          </View>

          <View style={styles.routeBox}>
            <Text style={styles.route}>0   12/v, Bashwille Road, Colombo 7</Text>
          </View>

          <Text style={styles.dots}>⋮</Text>

          <View style={styles.routeBox}>
            <Text style={styles.route}>1   Anula Balika - Nugegoda</Text>
          </View>

          <View style={styles.routeBox}>
            <Text style={styles.route}>2   Samudradevi Balika - Nugegoda</Text>
          </View>

          <Text style={styles.note}>
            This request will add approximately 1.2 KM and 6.5 minutes to the daily route.
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.acceptBtn}>
              <Text style={styles.acceptText}>Accept request</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rejectBtn}>
              <Text style={styles.rejectText}>Reject request</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Request Card 2 */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>Madavi Williams</Text>
              <Text style={styles.verified}>Verified</Text>
            </View>
            <Text style={styles.seats}>🪑 1</Text>
          </View>

          <View style={styles.routeBox}>
            <Text style={styles.route}>0   12/v, Kaashyapa Road, Colombo 7</Text>
          </View>

          <View style={styles.routeBox}>
            <Text style={styles.route}>1   Anula Balika - Nugegoda</Text>
          </View>

          <Text style={styles.note}>
            This request will add approximately 0.2 KM and 3 minutes to the daily route.
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.acceptBtn}>
              <Text style={styles.acceptText}>Accept request</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rejectBtn}>
              <Text style={styles.rejectText}>Reject request</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.nav}>
        <Text style={styles.navIcon}>🏠</Text>
        <Text style={styles.navIcon}>📄</Text>
        <Text style={styles.navIcon}>📅</Text>
        <Text style={styles.active}>🧾</Text>
        <Text style={styles.navIcon}>🔔</Text>
      </View>
    </View>
  );
};

export default ManageRequestsScreen;