import { Stack } from "expo-router";
import { WebSocketService } from "./webSocketService";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    console.log("Going to create a new websocket connection");
    WebSocketService.createWebSocket();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false, // hides headers globally
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="about" />
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="login" />
      <Stack.Screen name="slogin" />
      <Stack.Screen name="signUp" />
      <Stack.Screen name="studentWaiting" />
      <Stack.Screen name="createdecks" />
      <Stack.Screen name="teacherwaiting" />
      <Stack.Screen name="incorrect" />
      <Stack.Screen name="correct" />
      <Stack.Screen name="view-decks" />
      <Stack.Screen name="studentClicks" />
      <Stack.Screen name="answerchoices" />
      <Stack.Screen name="endgame" />
      <Stack.Screen name="roundend" />
      <Stack.Screen name="finalscorers" />
      <Stack.Screen name="waiting" />
      <Stack.Screen name="roundScorers" />
      <Stack.Screen name="createdecks/[id]" />
      <Stack.Screen name="review" />
    </Stack>
  );
}
