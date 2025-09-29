import { useRoute } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";

export default function Rootlayout() {
  return (
    <Stack>
      <Stack.Screen name="authentication"options={{headerShown:false}}/>
      <Stack.Screen name="(tabs)" options={{headerShown:false}}/>
    </Stack>
  );
}