import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function Plannerlayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{headerShown: false} }/>
      
    </Stack>
  );
}