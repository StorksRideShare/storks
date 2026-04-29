import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
} from "react-native";

import styles from "../../constants/OfferScreenstyle";

const OfferScreen = () => {
  const [isActive, setIsActive] = useState(true);

  return (
    <View style={styles.container}>
      <ScrollView>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Storks</Text>
          <Text style={styles.offer}>Offer</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Offer Status</Text>

        {/* Active Box */}
        <View style={styles.activeBox}>
          <View>
            <Text style={styles.activeTitle}>Your Offer is active</Text>
            <Text style={styles.activeSub}>
              Toggle the accepting requests to take you offline.
            </Text>
          </View>
          <Text style={styles.check}>✔</Text>
        </View>

        {/* Occupancy */}
        <View style={styles.center}>
          <Text style={styles.occupancy}>OCCUPANCY</Text>
          <Text style={styles.count}>
            10 <Text style={styles.total}>/12</Text>
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Seats Filled</Text>
          </View>
        </View>

        {/* Manage */}
        <TouchableOpacity style={styles.box}>
          <Text style={styles.boxText}>Manage Passangers</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Toggle */}
        <View style={styles.box}>
          <Text style={styles.boxText}>Accepting Requests</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#555", true: "#ff6a00" }}
            thumbColor={"#fff"}
          />
        </View>

        {/* Payment */}
        <View style={styles.box}>
          <Text style={styles.boxText}>Payment Method</Text>
          <View style={styles.row}>
            <Text style={styles.manual}>Manual</Text>
            <Text style={styles.arrow}>⇄</Text>
          </View>
        </View>

        {/* Vehicle */}
        <View style={styles.vehicleBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.boxText}>Offered Vehicle</Text>
            <Text style={styles.sub}>Toyota Hiace</Text>

            <View style={styles.plate}>
              <Text style={styles.plateText}>ABC-1234</Text>
            </View>
          </View>

          <Image
            source={{ uri: "https://via.placeholder.com/150" }}
            style={styles.vehicleImg}
          />
        </View>

        {/* Destinations */}
        <View style={styles.destBox}>
          <Text style={styles.boxText}>Offered destinations</Text>

          <View style={styles.input}>
            <Text style={styles.inputText}>1  School 1</Text>
          </View>

          <View style={styles.input}>
            <Text style={styles.inputText}>2  School 2</Text>
          </View>

          <Text style={styles.add}>+ Add More</Text>

          <Text style={styles.note}>
            To update your offered Destinations, Please take the offer offline.
          </Text>
        </View>

        {/* Requests */}
        <Text style={styles.title}>Requests</Text>

        <TouchableOpacity style={styles.requestBox}>
          <Text style={styles.requestText}>6 pending requests</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

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

export default OfferScreen;