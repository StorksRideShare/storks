import { useState, useEffect } from "react";
import { ScrollView, Pressable, ActivityIndicator, Platform } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronDown,
  Filter,
  Users,
  CheckCircle2,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoggedParentID } from "@/logged_parent";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/components/ui/actionsheet";

interface DriverCardProps {
  name: string;
  vehicle: string;
  plate: string;
  seats: number;
  capacity: number;
  features: string[];
}

const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP || (Platform.OS === "android" ? "10.0.2.2" : "localhost");
const API_BASE_URL = `http://${SERVER_IP}:8080`;

const DriverCard = ({ name, vehicle, plate, seats, capacity, features }: DriverCardProps) => {
  return (
    <Box className="bg-white rounded-3xl p-4 mb-4 relative overflow-hidden">
      <Box className="absolute -right-4 -bottom-4 w-32 h-32 bg-orange-100 rounded-full opacity-50" />
      <Box className="absolute -right-8 -bottom-8 w-32 h-32 bg-orange-200 rounded-full opacity-50" />
      <Box className="absolute -right-12 -bottom-12 w-32 h-32 bg-orange-300 rounded-full opacity-50" />

      <HStack space="md" className="items-center">
        <Avatar size="lg" className="bg-purple-200">
          <AvatarFallbackText>{name}</AvatarFallbackText>
        </Avatar>
        <VStack className="flex-1">
          <HStack className="items-center" space="xs">
            <Text className="text-orange-500 font-bold text-lg">{name}</Text>
            <CheckCircle2 size={16} color="#F97316" />
          </HStack>
          <Text className="text-gray-600 text-sm">{vehicle}</Text>
          <Box className="bg-orange-500 self-start px-3 py-0.5 rounded-full mt-1">
            <Text className="text-white text-xs font-bold">{plate}</Text>
          </Box>
        </VStack>
        <Button size="xs" className="bg-orange-500 rounded-full px-4">
          <ButtonText className="text-xs">Hide</ButtonText>
        </Button>
      </HStack>

      <HStack space="sm" className="mt-4">
        <Box className="flex-row items-center border border-gray-300 rounded-lg px-3 py-1 bg-white">
          <Users size={16} color="#333" className="mr-2" />
          <Text className="text-gray-800 font-medium">
            {seats}/{capacity}
          </Text>
        </Box>
        {features.map((feature, index) => (
          <Box
            key={index}
            className="border border-gray-300 rounded-lg px-3 py-1 bg-white"
          >
            <Text className="text-gray-800 font-medium">{feature}</Text>
          </Box>
        ))}
      </HStack>
    </Box>
  );
};

export default function SearchDriverScreen() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [childGroups, setChildGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActionsheet, setShowActionsheet] = useState(false);

  useEffect(() => {
    fetchDrivers();
    fetchChildGroups();
  }, []);

  const fetchChildGroups = async () => {
    try {
      const parentId = LoggedParentID;
      const response = await fetch(`${API_BASE_URL}/api/child-groups?parentId=${parentId}`);
      if (response.ok) {
        const data = await response.json();
        setChildGroups(data);
        if (data.length > 0) {
          setSelectedGroup(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching child groups:", err);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/offers`);
      if (!response.ok) {
        throw new Error("Failed to fetch drivers");
      }
      const data = await response.json();

      const transformedData = data.map((offer: any) => ({
        id: offer.offerId,
        name: offer.driverName,
        vehicle: offer.vehicleName,
        plate: offer.licensePlate,
        seats: offer.seats,
        capacity: offer.capacity,
        features: offer.features,
      }));
      setDrivers(transformedData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0E0E]">
      <HStack className="px-5 py-4 items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft color="#F97316" size={28} />
        </Pressable>
        <Text className="text-orange-500 font-bold text-2xl">Search a Driver</Text>
        <Box className="w-7" />
      </HStack>

      <ScrollView className="flex-1 px-5">
        <Pressable onPress={() => setShowActionsheet(true)}>
          <HStack className="items-center justify-between mb-6">
            <HStack space="md" className="items-center">
              <Avatar className="bg-purple-200">
                <AvatarFallbackText>{selectedGroup?.groupName?.charAt(0) || "G"}</AvatarFallbackText>
              </Avatar>
              <VStack>
                <Text className="text-white font-bold text-lg">
                  Group: {selectedGroup?.groupName || "No Group Selected"}
                </Text>
                <Text className="text-gray-400 text-sm">
                  {selectedGroup?.children?.map((c: any) => c.preferredName || c.firstName).join(", ") || "No children found"}
                </Text>
              </VStack>
            </HStack>
            <ChevronDown color="#F97316" size={24} />
          </HStack>
        </Pressable>

        <HStack space="sm" className="mb-8">
          <Button
            variant="outline"
            className="border-orange-500 rounded-xl px-4 flex-row items-center"
          >
            <Filter size={18} color="#F97316" className="mr-2" />
            <ButtonText className="text-orange-500">Filters</ButtonText>
          </Button>

          <Box className="border border-white rounded-xl px-4 justify-center">
            <Text className="text-white">1 Seat</Text>
          </Box>
          <Box className="border border-white rounded-xl px-4 justify-center">
            <Text className="text-white">AC</Text>
          </Box>
          <Box className="border border-white rounded-xl px-4 justify-center">
            <Text className="text-white">+4 More</Text>
          </Box>
        </HStack>

        <Box className="h-[1px] bg-gray-700 w-full mb-6" />
        <Text className="text-white text-center mb-6">
          {loading ? "Loading drivers..." : `Showing ${drivers.length} results`}
        </Text>

        {loading ? (
          <Box className="py-20">
            <ActivityIndicator size="large" color="#F97316" />
          </Box>
        ) : error ? (
          <Box className="py-20 items-center">
            <Text className="text-red-500 mb-4">{error}</Text>
            <Button onPress={fetchDrivers} className="bg-orange-500 rounded-xl">
              <ButtonText>Retry</ButtonText>
            </Button>
          </Box>
        ) : drivers.length === 0 ? (
          <Text className="text-gray-400 text-center py-20">No drivers found matching your criteria.</Text>
        ) : (
          drivers.map((driver, index) => (
            <Pressable key={index} onPress={() => router.push({
              pathname: "/(home)/driver-details",
              params: { 
                offerId: driver.id,
                groupId: selectedGroup?.groupId 
              }
            })}>
              <DriverCard {...driver} />
            </Pressable>
          ))
        )}

        <Box className="h-20" />
      </ScrollView>

      <Box className="absolute bottom-24 left-0 right-0 px-5">
        <Button className="bg-orange-500 h-16 rounded-3xl w-full">
          <ButtonText className="text-white font-bold text-xl">
            Search Again
          </ButtonText>
        </Button>
      </Box>

      <Actionsheet isOpen={showActionsheet} onClose={() => setShowActionsheet(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-[#1A1919] border-gray-800">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack className="w-full pt-4" space="md">
            <Text className="text-white font-bold text-lg px-4 mb-2">Select a Child Group</Text>
            {childGroups.map((group) => (
              <ActionsheetItem 
                key={group.groupId} 
                onPress={() => {
                  setSelectedGroup(group);
                  setShowActionsheet(false);
                }}
                className="hover:bg-gray-800 active:bg-gray-800 rounded-xl"
              >
                <VStack>
                  <ActionsheetItemText className="text-white font-bold text-lg">{group.groupName}</ActionsheetItemText>
                  <Text className="text-gray-400 text-sm">
                    {group.children?.map((c: any) => c.preferredName || c.firstName).join(", ")}
                  </Text>
                </VStack>
              </ActionsheetItem>
            ))}
            {childGroups.length === 0 && (
              <Text className="text-gray-500 text-center py-4">No groups available</Text>
            )}
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
}