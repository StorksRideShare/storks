import * as Device from "expo-device";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";

import { AnimatedIcon } from "@/components/animated-icon";
import { HintRow } from "@/components/hint-row";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useEffect, useState } from "react";

function getDevMenuHint() {
  if (Platform.OS === "web") {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === "android" ? "cmd+m (or ctrl+m)" : "cmd+d";
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const [coords, setCoords] = useState<any>([]);
  const [eta, setEta] = useState('');

  const fetchRoute = async () => {
    try {
      const response = await fetch(
        'http://10.0.2.2:8080/api/navigation/route?origin=6.9271,79.8612&destination=6.9067,79.8707'
      );
      const data = await response.json();

      const points = polyline.decode(data.polyline);
      const coordsArray = points.map(point => ({
        latitude: point[0],
        longitude: point[1],
      }));

      setCoords(coordsArray);
      setEta(data.duration);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 6.9271,
          longitude: 79.8612,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* 2. Draw the route on the map */}
        {coords.length > 0 && (
          <Polyline 
            coordinates={coords} 
            strokeWidth={4} 
            strokeColor="blue" 
          />
        )}
        
        <Marker coordinate={{ latitude: 6.9271, longitude: 79.8612 }} title="Pickup" />
        <Marker coordinate={{ latitude: 6.9067, longitude: 79.8707 }} title="School" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: "center",
  },
  code: {
    textTransform: "uppercase",
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
