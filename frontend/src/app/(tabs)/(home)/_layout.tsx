import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function Homelayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false} }/>
      <Stack.Screen name="settings" options={{headerShown: false, presentation:"modal"} }/>
      <Stack.Screen name="accounts" options={{headerShown: false, presentation:"modal"} }/>
    </Stack>
  );
}