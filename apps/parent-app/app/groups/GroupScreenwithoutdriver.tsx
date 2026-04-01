import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import styles from "../../constants/GroupScreenwithoutdriverstyle";

const GroupScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Storks</Text>
          <Text style={styles.profile}>👤</Text>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.back}>←</Text>
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
          <Text style={styles.editIcon}>✏️</Text>
        </View>

        {/* Pick up */}
        <Text style={styles.section}>Pick up</Text>
        <View style={styles.row}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Vihanga Janaka</Text>
            <Text style={styles.sub}>Home</Text>
          </View>
          <Text style={styles.editIcon}>✏️</Text>
        </View>

        {/* Drop off */}
        <Text style={styles.section}>Drop off</Text>
        <View style={styles.row}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Vihanga Janaka</Text>
            <Text style={styles.sub}>Ananda college - Maharagama</Text>
          </View>
          <Text style={styles.editIcon}>✏️</Text>
        </View>

        {/* Driver Section */}
        <Text style={styles.section}>Driver</Text>

        <View style={styles.driverBox}>
          <Text style={styles.driverText}>
            This group has no driver. Would you like to search a driver who serve these destinations?
          </Text>
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Search a Driver</Text>
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

export default GroupScreen;