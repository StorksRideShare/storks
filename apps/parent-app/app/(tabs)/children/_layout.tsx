import { Stack } from "expo-router";

export default function ChildrenLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#171412" },
        headerTintColor: "#E66B00",
        headerTitleStyle: { fontFamily: "Syne_700Bold", color: "#E66B00" },
        headerTitle: "My children",
        contentStyle: { backgroundColor: "#171412" },
      }}
    />
  );
}
