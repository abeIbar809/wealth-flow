
import CustomNavBar from "@/src/components/navigation-bar";
import { Tabs } from "expo-router";
import React from "react";

export default function _layout() {
  return (
    <Tabs tabBar={(props) => <CustomNavBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home" , headerShown:false}} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}