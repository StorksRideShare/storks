import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ModalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-950">
      <VStack className="flex-1 items-center justify-center p-6" space="md">
        <Text className="text-white font-bold text-2xl">Info Modal</Text>
        <Box className="w-16 h-1 bg-brand rounded-full my-4" />
        <Text className="text-typography-500 text-center">
          This is a placeholder for app information, support, and help.
          Future versions will include links to the help center and documentation.
        </Text>
      </VStack>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  );
}
