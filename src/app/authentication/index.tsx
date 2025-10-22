import "@/global.css";
import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, TextInput, TouchableOpacity, View, Image, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import GroupedPageSection from "@/src/components/layout/grouped-page-section";

export default function authentication() {
  const router = useRouter();

  function onLoginAttemp() {
    router.push("/(tabs)/(home)");
  }

  function onSignUpPressed() {}

  function onForgotPassWordPressed() {}

  return (
    // Mark Page
    <>
    <StatusBar style="light" />
    <View className="flex-1 items-center align-middle justify-evenly bg-[#03BF62]">

      <Text className=" font-bold text-4xl text-white ">WealthFlow</Text>
      
      <View className=" h-[500] w-4/5 bg-white rounded-[20] items-center justify-evenly">

        <Text className=" font-bold text-3xl ">Sign in to your account </Text>

        <GroupedPageSection className="items-center" > 
          <View className=" items-start w-5/6"> 
            <Text className="font-bold pb-3"> Email </Text>
          </View>

          <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Email"/>
        
          <View className=" items-start w-5/6"> 
            <Text className="font-bold "> Password </Text>
          </View>
          
          <TextInput className=" h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2" placeholder=" Password"/>

          <View className="items-start w-5/6"> 
          <TouchableOpacity onPress={onForgotPassWordPressed}>
            <Text className=" text-blue-400 font-bold pl-2">
              Forgot password ?
            </Text>
          </TouchableOpacity>
          </View>
        </GroupedPageSection>
        
        <GroupedPageSection>
          <TouchableOpacity className=" bg-[#03BF62] w-4/5 rounded-[20] h-[35] items-center justify-center mb-2" onPress={onLoginAttemp}>
            <Text className="text-white font-bold text-xl" > Login </Text>
            {/*<Button title="Login" onPress={onLoginAttemp} />*/}
          </TouchableOpacity>
          <TouchableOpacity className=" bg-[#03BF62] w-4/5 rounded-[20] h-[35] items-center justify-center" onPress={onLoginAttemp}>
            <Text className="text-white font-bold text-xl" > Signup </Text>
            {/*<Button title="Login" onPress={onLoginAttemp} />*/}
          </TouchableOpacity>
        </GroupedPageSection>

      </View>
    </View>
    </>
  );
}


