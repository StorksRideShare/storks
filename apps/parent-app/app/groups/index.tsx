import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Home, 
  ClipboardList, 
  Calendar, 
  Smartphone, 
  User, 
  ChevronLeft, 
  Plus, 
  Search, 
  Edit2,
  Phone,
  Settings
} from 'lucide-react-native';
import api from '../api/axios';
import styles from '../../constants/GroupScreenstyle';

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  pickupLocation: string;
  dropLocation: string;
}

interface GroupData {
  groupName: string;
  driverName: string | null;
  hasDriver: boolean;
  status: string;
  bookingDate: string | null;
}

const GroupScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [group, setGroup] = useState<GroupData | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const groupId = 1; // Assuming hardcoded group ID for this module
      const [groupRes, childrenRes] = await Promise.all([
        api.get(`/api/groups/${groupId}`),
        api.get(`/api/children/group/${groupId}`)
      ]);
      setGroup(groupRes.data);
      setChildren(childrenRes.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch group data:', err);
      setError('Failed to load group details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6a00" />
      </View>
    );
  }

  const hasChildren = children.length > 0;
  const hasDriver = group?.hasDriver;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6a00" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Storks</Text>
          <TouchableOpacity style={styles.profile}>
            <View style={{ padding: 4 }}>
              <User color="white" size={24} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Banner / Cover */}
        <View style={styles.banner}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400" }} 
            style={styles.coverImage} 
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#ff6a00" size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editGroupBtn}>
            <Text style={styles.editGroupText}>edit group</Text>
          </TouchableOpacity>
        </View>

        {/* Group Info */}
        <Text style={styles.groupName}>{group?.groupName || 'Loading...'}</Text>

        {/* Members Section */}
        <Text style={styles.sectionTitle}>Members</Text>
        {hasChildren ? (
          children.map((child) => (
            <View key={child.id} style={styles.row}>
              <View style={styles.avatarPlaceholder}>
                <User color="#ff6a00" size={20} />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.primaryText}>{`${child.firstName} ${child.lastName}`}</Text>
                <Text style={styles.secondaryText}>Age {child.age}</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionIcon}
                onPress={() => router.push('/children/MyChildrenScreen')}
              >
                <Edit2 color="white" size={18} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <TouchableOpacity 
            style={styles.dashedBox}
            onPress={() => router.push('/children/AddChildScreen')}
          >
            <Text style={styles.dashedBoxText}>
              This group has no children.{"\n"}Would you like to add one?
            </Text>
            <Plus color="#ff6a00" size={24} style={styles.dashedBoxIcon} />
          </TouchableOpacity>
        )}

        {/* Locations Section (only if children exist) */}
        {hasChildren && (
          <>
            <Text style={styles.sectionTitle}>Pick up</Text>
            {children.map((child) => (
              <View key={`pickup-${child.id}`} style={styles.row}>
                <View style={styles.avatarPlaceholder}>
                  <Home color="#ff6a00" size={20} />
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.primaryText}>{`${child.firstName} ${child.lastName}`}</Text>
                  <Text style={styles.secondaryText}>{child.pickupLocation}</Text>
                </View>
                <Edit2 color="white" size={18} style={styles.actionIcon} />
              </View>
            ))}

            <Text style={styles.sectionTitle}>Drop off</Text>
            {children.map((child) => (
              <View key={`drop-${child.id}`} style={styles.row}>
                <View style={styles.avatarPlaceholder}>
                  <Home color="#ff6a00" size={20} />
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.primaryText}>{`${child.firstName} ${child.lastName}`}</Text>
                  <Text style={styles.secondaryText}>{child.dropLocation}</Text>
                </View>
                <Edit2 color="white" size={18} style={styles.actionIcon} />
              </View>
            ))}
          </>
        )}

        {/* Driver Section */}
        <Text style={styles.sectionTitle}>Driver</Text>
        {hasDriver ? (
          <TouchableOpacity 
            style={styles.driverCard}
            onPress={() => router.push('/driver/DriverProfileScreen')}
          >
            <View style={styles.avatarPlaceholder}>
              <User color="#ff6a00" size={24} />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.primaryText}>{group?.driverName}</Text>
              <Text style={styles.secondaryText}>Professional Driver</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>VERIFIED</Text>
              </View>
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehiclePlate}>ABC - 1234</Text>
              <View style={styles.paymentStatus}>
                <Text style={styles.paymentText}>PAID</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.dashedBox}
            onPress={() => router.push('/driver/SearchScreen')}
          >
            <Text style={styles.dashedBoxText}>
              This group has no driver. Would you like to search a driver who serve these destinations?
            </Text>
            <Search color="#ff6a00" size={24} style={styles.dashedBoxIcon} />
          </TouchableOpacity>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {!hasDriver ? (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/driver/SearchScreen')}
            >
              <Text style={styles.primaryButtonText}>Search a Driver</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.primaryButton}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Phone color="white" size={18} style={{marginRight: 8}} />
                  <Text style={styles.primaryButtonText}>Call Driver</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/driver/DriverProfileScreen')}
              >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Settings color="white" size={18} style={{marginRight: 8}} />
                  <Text style={styles.secondaryButtonText}>Manage</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/groups/')}>
          <Home color="#ff6a00" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <ClipboardList color="white" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Calendar color="white" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Smartphone color="white" size={24} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GroupScreen;
