import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import styles from "../../constants/TrackingScreenstyle";

const TrackingScreen = () => {
  const [tripData, setTripData] = useState<any>(null);

  // 🔥 Fetch data every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://YOUR-IP:8080/api/trip/status");
        const data = await res.json();
        setTripData(data);
      } catch (err) {
        console.log(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // fallback
  if (!tripData) return <Text style={{ color: "white" }}>Loading...</Text>;

 const state = tripData?.status || "ARRIVING";

  // 🔥 Dynamic UI text
  const getMessage = () => {
    if (state === "ARRIVING") return "Arriving in 5 minutes";
    if (state === "PIN") return "Please give the PIN to driver";
    if (state === "PICKUP") return "Child will be picked up next";
    if (state === "DROPOFF") return "Child will be dropped off soon";
    if (state === "ABSENT") return "Student absent today";
    return "";
  };

  return (
    <View style={styles.container}>

      {/* MAP */}
<MapView
  style={styles.map}
  initialRegion={{
    latitude: tripData?.latitude,
    longitude: tripData?.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }}
>
  {/* Driver */}
        <Marker
          coordinate={{
            latitude: tripData.latitude,
            longitude: tripData.longitude,
          }}
          title="Driver"
        />

        {/* Route */}
        <Polyline
          coordinates={tripData.route || []}
          strokeColor="#ff6600"
          strokeWidth={4}
        />
      </MapView>

      {/* STATUS BADGE */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{getMessage()}</Text>
      </View>

      {/* BOTTOM PANEL */}
      <View style={styles.bottomCard}>

        {/* DRIVER INFO */}
        <Text style={styles.driverName}>
          {tripData.driverName}
        </Text>
        <Text style={styles.vehicle}>
          {tripData.vehicle} • {tripData.plate}
        </Text>

        {/* CONDITIONAL UI */}
        {state === "PIN" && (
          <View style={styles.pinBox}>
            <Text style={styles.pinLabel}>PIN:</Text>
            <View style={styles.pinRow}>
              {tripData.pin?.split("").map((n: string, i: number) => (
                <Text key={i} style={styles.pinDigit}>{n}</Text>
              ))}
            </View>
          </View>
        )}

        {/* CHILD STATUS */}
        <Text style={styles.childText}>
          {tripData.childMessage}
        </Text>

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.callBtn}>
            <Text style={styles.btnText}>Call Driver</Text>
          </TouchableOpacity>

          {state === "PIN" ? (
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Requested 🔑</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.emergencyBtn}>
              <Text style={styles.btnText}>Emergency</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </View>
  );
};

export default TrackingScreen;