import { Stack } from "expo-router";
import React from "react";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="addAccount"
      options={{
          headerShown: false,
          headerTitle: "AddAccount",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerBackButtonDisplayMode:"default",
          headerBackButtonMenuEnabled: true,
          headerBackVisible: true,
          headerBackTitle: "home",
          
        
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 25,
            color: "#03BF62",
          },
        }}
      />
      <Stack.Screen name="details"options={{headerShown:false, }}/>
    </Stack>
  );
}
