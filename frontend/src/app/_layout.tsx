import { Stack } from "expo-router";
import React from "react";
import { useEffect } from "react";
import useAuthStore from "../stores/useAuthStore";

export default function Rootlayout() {

  const { isAuthenticated } = useAuthStore()
  return (
    <Stack>
      {/* Protected Routes. When isAuth is true tabs page is Open.*/}
      <Stack.Protected guard={!!isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      {/* Protected Routes. When isAuth is false authScreen is open.*/}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="authentication" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

