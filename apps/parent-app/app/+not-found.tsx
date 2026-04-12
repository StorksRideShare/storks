import { Link, Stack } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-950">
      <Stack.Screen options={{ title: 'Oops!' }} />
      <VStack className="flex-1 items-center justify-center p-5" space="lg">
        <Text className="text-white font-bold text-2xl">This screen doesn't exist.</Text>

        <Link href="/" asChild>
          <Box className="mt-4 p-4 rounded-full border border-brand">
            <Text className="text-brand font-bold text-base">Go to home screen!</Text>
          </Box>
        </Link>
      </VStack>
    </SafeAreaView>
  );
}
