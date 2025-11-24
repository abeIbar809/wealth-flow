import { AppText } from "@/src/components/common/app-text";
import CustomNavBar from "@/src/components/navigation/navigation-bar";
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { View } from 'react-native';

function TabsHeader(props: BottomTabHeaderProps) {
  return (
    <View className=" h-[90] justify-end items-center bg-white" >
      <AppText type="subtitle" className="text-[#03BF62]" >
        WealthFlow
      </AppText>
    </View>
  )
}

export default function _layout() {
  return (
    <Tabs tabBar={(props) => <CustomNavBar {...props} />}>
      <Tabs.Screen name="(home)" options={{ header: (props) => (<TabsHeader {...props} />) }} />
      <Tabs.Screen name="(bills)" options={{ header: (props) => (<TabsHeader {...props} />) }} />
      <Tabs.Screen name="(forums)" options={{ title: "forums" }} />
      <Tabs.Screen name="(investments)" options={{ title: "investments" }} />
      <Tabs.Screen name="(planner)" options={{ title: "planner" }} />
    </Tabs>
  );
}