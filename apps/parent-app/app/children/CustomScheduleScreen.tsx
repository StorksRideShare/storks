import React from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Info, Calendar } from "lucide-react-native";
import styles from "../../constants/CustomScheduleScreenstyle";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const CustomScheduleScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#ff6a00" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>Child Schedule</Text>
        </View>

        <View style={{ padding: 16 }}>
          {/* Title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Calendar color="#ff6a00" size={24} style={{ marginRight: 10 }} />
            <Text style={styles.mainTitle}>Custom Schedule</Text>
          </View>

          {/* Description */}
          <Text style={styles.desc}>
            By default the home address becomes the drop off location. Leave empty
            to use the default drop off.
          </Text>

          {/* Days */}
          {days.map((day, index) => (
            <TouchableOpacity key={index} style={styles.dayBox}>
              <Text style={styles.dayText}>{day}</Text>
              <ChevronLeft color="#555" size={18} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          ))}

          {/* Info Box */}
          <View style={[styles.infoBox, { flexDirection: 'row', alignItems: 'flex-start' }]}>
            <Info color="#ffd700" size={18} style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={[styles.infoText, { flex: 1 }]}>
              These schedules repeat every week. To add custom schedules for
              specific dates, you can customize them through the main calendar.
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity 
            style={[styles.button, { marginTop: 20 }]} 
            onPress={() => router.push('/groups')}
          >
            <Text style={styles.buttonText}>Apply Schedule</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomScheduleScreen;