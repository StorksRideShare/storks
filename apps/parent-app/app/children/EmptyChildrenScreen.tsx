import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import styles from "../../constants/EmptyChildrenScreenstyle";

const EmptyChildrenScreen = () => {
  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.back}>←</Text>
        <Text style={styles.title}>My children</Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          You currently don’t have a child profile set up. Create one to fully
          unlock the use of Storks. Click here to add a new child profile.
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Add a child</Text>
      </TouchableOpacity>

    </View>
  );
};

export default EmptyChildrenScreen;