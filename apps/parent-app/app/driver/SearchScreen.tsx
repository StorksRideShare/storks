import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
    ChevronLeft, 
    Search as SearchIcon, 
    User, 
    CheckCircle2, 
    Filter, 
    Home, 
    ClipboardList, 
    Calendar, 
    Smartphone 
} from "lucide-react-native";
import api from "../api/axios";
import styles from "../../constants/SearchScreenstyle";

interface Driver {
    id: number;
    name: string;
    vehicle: string;
    plate: string;
    availableSeats: number;
    totalSeats: number;
    ac: boolean;
    nfc: boolean;
    verified: boolean;
}

const SearchScreen = () => {
    const router = useRouter();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDrivers = useCallback(async () => {
        try {
            const response = await api.get("/api/search/drivers/search");
            setDrivers(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch drivers:", err);
            setError("Failed to load available drivers.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDrivers();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft color="#ff6a00" size={28} />
                </TouchableOpacity>
                <Text style={styles.title}>Search a Driver</Text>
            </View>

            {/* Group Info Context */}
            <View style={styles.groupRow}>
                <View style={[styles.avatar, { backgroundColor: '#443322', justifyContent: 'center', alignItems: 'center' }]}>
                    <User color="#ff6a00" size={24} />
                </View>
                <View>
                    <Text style={styles.groupTitle}>Group: Chooti</Text>
                    <Text style={styles.groupSub}>Searching for transport...</Text>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter color="#ff6a00" size={18} />
                    <Text style={styles.filterText}>Filters</Text>
                </TouchableOpacity>

                <View style={styles.tag}><Text style={{ color: 'white' }}>1 Seat</Text></View>
                <View style={styles.tag}><Text style={{ color: 'white' }}>AC</Text></View>
            </View>

            <View style={styles.divider} />

            {loading && !refreshing ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#ff6a00" />
                </View>
            ) : (
                <>
                    <Text style={styles.resultText}>Showing {drivers.length} results</Text>
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6a00" />}
                    >
                        {drivers.length > 0 ? (
                            drivers.map((driver) => (
                                <TouchableOpacity 
                                    key={driver.id} 
                                    style={styles.card} 
                                    onPress={() => router.push({
                                        pathname: '/driver/DriverProfileScreen',
                                        params: { id: driver.id }
                                    })}
                                >
                                    <View style={styles.cardTop}>
                                        <View style={[styles.avatarSmall, { backgroundColor: '#3a2a24', justifyContent: 'center', alignItems: 'center' }]}>
                                            <User color="#ff6a00" size={20} />
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.driverName}>{driver.name}</Text>
                                                {driver.verified && <CheckCircle2 color="#ff6a00" size={14} style={{ marginLeft: 4 }} />}
                                            </View>
                                            <Text style={styles.vehicle}>{driver.vehicle}</Text>

                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{driver.plate}</Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity style={styles.hideBtn}>
                                            <Text style={styles.hideText}>Hide</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Bottom info */}
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoBox}>
                                            <Text style={{ color: 'white' }}>👤 {driver.totalSeats - driver.availableSeats}/{driver.totalSeats}</Text>
                                        </View>
                                        {driver.ac && (
                                            <View style={styles.infoBox}>
                                                <Text style={{ color: 'white' }}>AC</Text>
                                            </View>
                                        )}
                                        {driver.nfc && (
                                            <View style={styles.infoBox}>
                                                <Text style={{ color: 'white' }}>NFC</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <SearchIcon color="#555" size={48} />
                                <Text style={{ color: '#aaa', marginTop: 10, textAlign: 'center' }}>
                                    No drivers found matching your criteria.
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </>
            )}

            {/* Bottom Button */}
            <TouchableOpacity style={styles.searchBtn} onPress={onRefresh}>
                <Text style={styles.searchText}>Refresh Results</Text>
            </TouchableOpacity>

            {/* Bottom Nav */}
            <View style={styles.nav}>
                <TouchableOpacity onPress={() => router.replace('/groups')}>
                    <Home color="#ff6a00" size={24} />
                </TouchableOpacity>
                <ClipboardList color="white" size={24} />
                <Calendar color="white" size={24} />
                <Smartphone color="white" size={24} />
            </View>
        </SafeAreaView>
    );
};

export default SearchScreen;