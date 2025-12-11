import { Stack } from "expo-router";
import React from "react";
import { useEffect } from "react";

export default function Rootlayout() {

  return (
    <Stack>
      <Stack.Screen name="authentication"options={{headerShown:false}}/>
      <Stack.Protected guard={true}>
        <Stack.Screen name="(tabs)" options={{headerShown:false}}/>
      </Stack.Protected>
    </Stack>
  );
}

