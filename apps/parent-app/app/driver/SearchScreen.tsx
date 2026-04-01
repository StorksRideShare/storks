import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";

import styles from "../../constants/SearchScreenstyle";

const SearchScreen = () => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.back}>←</Text>
                <Text style={styles.title}>Search a Driver</Text>
            </View>

            {/* Group Info */}
            <View style={styles.groupRow}>
                <View style={styles.avatar} />
                <View>
                    <Text style={styles.groupTitle}>Group: Chooti</Text>
                    <Text style={styles.groupSub}>Vihanga Janaka</Text>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
                <TouchableOpacity style={styles.filterBtn}>
                    <Text style={styles.filterText}>Filters</Text>
                </TouchableOpacity>

                <View style={styles.tag}><Text>1 Seat</Text></View>
                <View style={styles.tag}><Text>AC</Text></View>
                <View style={styles.tag}><Text>+4 More</Text></View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.resultText}>Showing 50 results</Text>

            {/* Driver List */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {[1, 2, 3].map((item) => (
                    <View key={item} style={styles.card}>
                        <View style={styles.cardTop}>
                            <View style={styles.avatarSmall} />

                            <View style={{ flex: 1 }}>
                                <Text style={styles.driverName}>
                                    Ranidu Sampath ✓
                                </Text>
                                <Text style={styles.vehicle}>Toyota Caravan</Text>

                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>ABC 1223</Text>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.hideBtn}>
                                <Text style={styles.hideText}>Hide</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bottom info */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text>👤 2/15</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text>AC</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text>NFC</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Bottom Button */}
            <TouchableOpacity style={styles.searchBtn}>
                <Text style={styles.searchText}>Search Again</Text>
            </TouchableOpacity>

            {/* Bottom Nav */}
            <View style={styles.nav}>
                <Text style={styles.navIcon}>🏠</Text>
                <Text style={styles.navIcon}>📋</Text>
                <Text style={styles.navIcon}>📅</Text>
                <Text style={styles.navIcon}>📱</Text>
            </View>
        </View>
    );
};

export default SearchScreen;