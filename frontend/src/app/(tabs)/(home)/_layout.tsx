import { Stack } from "expo-router";
import React from "react";

export default function Homelayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="addAccountActionSheet" options={{ headerShown: false, presentation: "transparentModal" }} />
      <Stack.Screen name="addManualAccountPopup" options={{ headerShown: false, presentation: "transparentModal" }} />
<<<<<<< HEAD
      <Stack.Screen name="creditScoreSheet" options={{ headerShown: false, presentation: "modal" }} />
=======
      <Stack.Screen name="MorningBriefing" options={{ headerShown: false }} />
>>>>>>> origin/main
    </Stack>
  );
}