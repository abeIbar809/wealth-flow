import CustomNavBar from "@/src/components/navigation/navigation-bar";
import { ThemedText } from "@/src/components/theme/themed-text";
import { ThemedView } from "@/src/components/theme/themed-view";
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from 'react-native';



function TabsHeader(props : BottomTabHeaderProps) {
  return (
    <ThemedView className=" h-[100] justify-end items-center" darkColor="#151517">
      <ThemedText type={undefined} style={{fontSize:23, fontWeight:"bold", paddingBottom:10}} >
        WealthFlow
        </ThemedText>
    </ThemedView>
  )
}


export default function _layout() {
  return (
    <Tabs tabBar={(props) => <CustomNavBar {...props} />}>
      <Tabs.Screen name="(home)" options={{header: (props) =>  (<TabsHeader {...props}/>)}}/>
      <Tabs.Screen name="(bills)" options={{header: (props) =>  (<TabsHeader {...props}/>)}}/>
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
