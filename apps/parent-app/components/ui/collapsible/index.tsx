import React, { useState } from "react";
import { View, Pressable, ViewProps } from "react-native";

interface CollapsibleProps extends ViewProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Collapsible = ({
  trigger,
  children,
  defaultOpen = false,
  ...props
}: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <View {...props}>
      <Pressable onPress={() => setIsOpen((prev) => !prev)}>
        {trigger}
      </Pressable>
      {isOpen && <View>{children}</View>}
    </View>
  );
};