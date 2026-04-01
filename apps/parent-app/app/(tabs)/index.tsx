import { useState, useEffect } from "react";
import { ScrollView, Pressable, ActivityIndicator, Platform, BackHandler } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import {
  ChevronDown,
  Filter,
  Users,
  CheckCircle2,
  X,
} from "lucide-react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoggedParentID } from "@/logged_parent";

interface DriverCardProps {
  id: string;
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

export default function HomeScreen() {
  const [childGroups, setChildGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildGroups();
  }, []);

  const fetchChildGroups = async () => {
    try {
      const parentId = LoggedParentID;
      const response = await fetch(`${API_BASE_URL}/api/child-groups?parentId=${parentId}`);
      if (response.ok) {
        const data = await response.json();
        setChildGroups(data);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0E0E]">
      <HStack className="px-5 py-4 items-center justify-between">
        <Text className="text-white font-bold text-2xl">Storks</Text>
        <Avatar className="bg-orange-500">
           <AvatarFallbackText>Parent</AvatarFallbackText>
        </Avatar>
      </HStack>

      <ScrollView className="flex-1 px-5 pt-4">
        <VStack space="lg" className="mb-10">
          <Text className="text-white font-bold text-3xl">Welcome Back!</Text>
          <Text className="text-gray-400 text-lg">Your children's safety is our priority.</Text>
        </VStack>

        <Text className="text-white font-bold text-xl mb-4">Your Child Groups</Text>
        {loading ? (
           <ActivityIndicator color="#F97316" />
        ) : childGroups.map((group) => (
           <Box key={group.groupId} className="bg-[#1A1919] p-6 rounded-3xl mb-4 border border-gray-800">
              <HStack space="md" className="items-center mb-3">
                 <Box className="bg-orange-500/20 p-3 rounded-2xl">
                    <Users color="#F97316" size={24} />
                 </Box>
                 <VStack>
                    <Text className="text-white font-bold text-xl">{group.groupName}</Text>
                    <Text className="text-gray-400 text-sm">
                       {group.children?.length} Children
                    </Text>
                 </VStack>
              </HStack>
              <HStack className="flex-wrap gap-2">
                 {group.children?.map((child: any, idx: number) => (
                    <Box key={idx} className="bg-[#262626] px-3 py-1.5 rounded-full border border-gray-700">
                       <Text className="text-white text-xs">{child.preferredName || child.firstName}</Text>
                    </Box>
                 ))}
              </HStack>
              
              <Button 
                variant="outline" 
                className="mt-6 border-orange-500 rounded-2xl h-12"
                onPress={() => router.push({
                   pathname: "/(tabs)/booking",
                   params: { groupId: group.groupId }
                })}
              >
                 <ButtonText className="text-orange-500 font-bold">New Booking</ButtonText>
              </Button>
           </Box>
        ))}

        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
