import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import styles from "../../constants/GroupWithDriverScreenstyle";

const GroupWithDriverScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Storks</Text>
          <Text style={styles.profile}>👤</Text>
        </View>

        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/400x200" }}
            style={styles.cover}
          />
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editText}>edit group</Text>
          </TouchableOpacity>
        </View>

        {/* Group Name */}
        <Text style={styles.groupName}>Chooti</Text>

        {/* Members */}
        <Text style={styles.section}>Members</Text>
        <View style={styles.row}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Vihanga Janaka</Text>
            <Text style={styles.sub}>Age 12</Text>
          </View>
          <Text style={styles.icon}>✏️</Text>
        </View>

        {/* Pickup */}
        <Text style={styles.section}>Pick up</Text>
        <View style={styles.row}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Vihanga Janaka</Text>
            <Text style={styles.sub}>Home</Text>
          </View>
          <Text style={styles.icon}>✏️</Text>
        </View>

        {/* Dropoff */}
        <Text style={styles.section}>Drop off</Text>
        <View style={styles.row}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Vihanga Janaka</Text>
            <Text style={styles.sub}>
              Ananda college - Maharagama
            </Text>
          </View>
          <Text style={styles.icon}>✏️</Text>
        </View>

        {/* Driver */}
        <Text style={styles.section}>Driver</Text>
        <View style={styles.driverRow}>
          <View style={styles.avatar} />

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Ranidu Sampath</Text>
            <Text style={styles.sub}>Honda Caravan</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>4 months</Text>
            </View>
          </View>

          <View>
            <Text style={styles.vehicle}>ABC - 1234</Text>
            <View style={styles.paidBox}>
              <Text style={styles.paidText}>Paid</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.callBtn}>
            <Text style={styles.callText}>Call Driver</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.manageBtn}>
            <Text style={styles.manageText}>Manage Driver</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.nav}>
        <Text style={styles.active}>🏠</Text>
        <Text style={styles.navIcon}>📄</Text>
        <Text style={styles.navIcon}>📅</Text>
        <Text style={styles.navIcon}>📱</Text>
      </View>
    </View>
  );
};

export default GroupWithDriverScreen;