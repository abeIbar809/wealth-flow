import CustomNavBar from "@/src/components/navigation/navigation-bar";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from 'react-native';

export default function _layout() {
  return (
    <Tabs tabBar={(props) => <CustomNavBar {...props} />}>
      <Tabs.Screen name="(home)" options={{title:"home",headerShadowVisible:false,headerTitle: "WealthFlow", headerTitleStyle: styles.headerStyle}}/>
      <Tabs.Screen name="(bills)" options={{ title: "bills" }} />
      <Tabs.Screen name="(forums)" options={{ title: "forums" }} />
      <Tabs.Screen name="(investments)" options={{ title: "investments" }} />
      <Tabs.Screen name="(planner)" options={{ title: "planner" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerStyle: { 
    fontWeight: "bold",
    fontSize: 25,
    color: "#03BF62",
  } 
})
