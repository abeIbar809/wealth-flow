import { useRouter } from "expo-router";
import React, { useEffect } from "react";

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const isAuth = false;
  
    useEffect(() => {
      router.replace("/(tabs)/(bills)");
    });
  
    return <>{children}</>;
  }