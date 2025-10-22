import React from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";

export default function Modalslayout() {
  return (
    <Stack>
        <Stack.Screen name="settings" options={{headerShown: false, presentation:"modal"} }/>
    </Stack>
  );
}