import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        headerTitle: "Tappt",
        headerLeft: () => <></>,
      }}/>
      <Stack.Screen name="about" options={{
        headerTitle: "About",
      }} />
      <Stack.Screen name="+not-found" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="login" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="rules" options={{
        headerShown: false,
      }} />
    </Stack>
  );
}
