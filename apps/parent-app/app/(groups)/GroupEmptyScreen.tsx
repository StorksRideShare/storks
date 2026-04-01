import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import styles from "../../constants/GroupEmptyScreenstyle";

const GroupEmptyScreen = () => {
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
        <View style={styles.dashedBox}>
          <Text style={styles.boxText}>
            This group has no children.{"\n"}
            Would you like to add one?
          </Text>
          <Text style={styles.plus}>＋</Text>
        </View>

        {/* Pick up */}
        <Text style={styles.section}>Pick up</Text>
        <View style={styles.dashedBoxSmall}>
          <Text style={styles.boxText}>Add a child first</Text>
        </View>

        {/* Drop off */}
        <Text style={styles.section}>Drop off</Text>
        <View style={styles.dashedBoxSmall}>
          <Text style={styles.boxText}>Add a child first</Text>
        </View>

        {/* Driver */}
        <Text style={styles.section}>Driver</Text>
        <View style={styles.dashedBox}>
          <Text style={styles.boxText}>
            This group has no driver. Would you like to search a driver who serve these destinations?
          </Text>
          <Text style={styles.search}>🔍</Text>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Search a Driver</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.nav}>
        <Text style={styles.active}>🏠</Text>
        <Text style={styles.navIcon}>📋</Text>
        <Text style={styles.navIcon}>📅</Text>
        <Text style={styles.navIcon}>📱</Text>
      </View>
    </View>
  );
};

export default GroupEmptyScreen;