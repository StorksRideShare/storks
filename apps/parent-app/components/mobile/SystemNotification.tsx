import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";

type SystemNotificationProps = {
  content: string;
};

export default function SystemNotification({ content }: SystemNotificationProps) {
  return (
    <Center className="my-4 px-10">
      <Box className="bg-gray-100 dark:bg-gray-800 px-4 py-1 rounded-full border border-gray-200 dark:border-gray-700">
        <Text className="text-[10px] text-gray-500 font-medium text-center uppercase tracking-wider">
          {content}
        </Text>
      </Box>
    </Center>
  );
}
