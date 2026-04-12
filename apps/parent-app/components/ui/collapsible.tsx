import React, { PropsWithChildren, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box className="my-1">
      <TouchableOpacity
        className="flex-row items-center py-3"
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <ChevronRight
          size={18}
          color="#E66B00"
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <Text className="ml-2 font-semibold text-white">{title}</Text>
      </TouchableOpacity>
      {isOpen && <VStack className="pl-6 pb-3">{children}</VStack>}
    </Box>
  );
}
