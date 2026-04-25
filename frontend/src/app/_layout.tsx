import { Stack } from "expo-router";
import React, { useEffect, useRef } from "react";
import useAuthStore from "../stores/useAuthStore";
import transactionService from "../services/TransactionService";

export default function Rootlayout() {
  const { isAuthenticated, user } = useAuthStore();

  // prevents repeated sync spam in the same app session
  const didSyncForUser = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?._id;

    // Only sync if logged in and we have a userId
    if (!isAuthenticated || !userId) return;

    // Only once per user per app session
    if (didSyncForUser.current === userId) return;
    didSyncForUser.current = userId;

    transactionService
      .syncTransactions()
      .catch((e: any) => console.warn("Transaction sync failed on app open:", e?.response?.data || e));
  }, [isAuthenticated, user?._id]);

  return (
    <Stack>
      {/* Protected Routes. When isAuth is true tabs page is Open. */}
      <Stack.Protected guard={!!isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="walkthrough" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Protected Routes. When isAuth is false authScreen is open. */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="authentication" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
