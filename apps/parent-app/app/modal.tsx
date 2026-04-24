import { StatusBar } from "expo-status-bar";
import { Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useUser, useAuth } from "@clerk/expo";
import {
  Users,
  Baby,
  LogOut,
  ChevronRight,
  X,
  User,
  Calendar,
  Activity,
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Pressable } from "@/components/ui/pressable";

function MenuRow({
  icon: Icon,
  label,
  onPress,
  danger,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress}>
      <HStack
        className="items-center py-4 border-b border-outline-800"
        space="md"
      >
        <Box className="w-9 h-9 rounded-xl bg-outline-800 items-center justify-center">
          <Icon size={18} color={danger ? "#ef4444" : "#E66B00"} />
        </Box>
        <Text
          className={`flex-1 font-semibold text-base ${
            danger ? "text-error-500" : "text-white"
          }`}
        >
          {label}
        </Text>
        <ChevronRight size={18} color="#7A726E" />
      </HStack>
    </Pressable>
  );
}

export default function ModalScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/signin");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-950">
      {/* Close button */}
      <HStack className="px-5 pt-4 pb-2 justify-end">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-outline-800 items-center justify-center"
        >
          <X size={18} color="#E66B00" />
        </Pressable>
      </HStack>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <VStack className="items-center py-6 mb-4">
          <Avatar size="2xl" className="bg-brand mb-4" style={{ width: 80, height: 80 }}>
            {user?.imageUrl ? (
              <AvatarImage source={{ uri: user.imageUrl }} />
            ) : null}
            <AvatarFallbackText>
              {user?.firstName?.[0] ?? "P"}
            </AvatarFallbackText>
          </Avatar>
          <Text className="text-white font-bold text-2xl">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-typography-500 text-sm mt-1">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
          <Box className="bg-brand/20 border border-brand/40 rounded-full px-3 py-1 mt-2">
            <Text className="text-brand text-xs font-bold uppercase">Parent</Text>
          </Box>
        </VStack>

        {/* Navigation menu */}
        <Text className="text-typography-500 text-xs font-bold uppercase mb-2">
          Manage
        </Text>
        <MenuRow
          icon={Baby}
          label="My Children"
          onPress={() => {
            router.back();
            setTimeout(() => router.push("/(children)"), 100);
          }}
        />
        <MenuRow
          icon={Users}
          label="My Groups"
          onPress={() => {
            router.back();
            setTimeout(() => router.push("/(groups)"), 100);
          }}
        />

        <Text className="text-typography-500 text-xs font-bold uppercase mb-2 mt-6">
          Quick Access
        </Text>
        <MenuRow
          icon={Activity}
          label="Booking Activity"
          onPress={() => {
            router.back();
            setTimeout(() => router.push("/(tabs)/activity"), 100);
          }}
        />
        <MenuRow
          icon={Calendar}
          label="Schedule"
          onPress={() => {
            router.back();
            setTimeout(() => router.push("/(tabs)/calendar"), 100);
          }}
        />
        <MenuRow
          icon={User}
          label="Profile Settings"
          onPress={() => {}}
        />

        <Text className="text-typography-500 text-xs font-bold uppercase mb-2 mt-6">
          Account
        </Text>
        <MenuRow
          icon={LogOut}
          label="Sign Out"
          onPress={handleSignOut}
          danger
        />

        <Box className="h-12" />
      </ScrollView>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </SafeAreaView>
  );
}
