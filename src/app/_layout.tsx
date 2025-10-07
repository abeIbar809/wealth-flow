import { Stack } from "expo-router";
import React from "react";

export default function Rootlayout() {
  return (
    <Stack>
      <Stack.Screen name="authentication"options={{headerShown:false}}/>
      <Stack.Screen name="(tabs)" options={{headerShown:false}}/>
    </Stack>
  );
}