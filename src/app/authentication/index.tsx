import "@/global.css";
import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";

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
    <View className="flex-1 items-center align-middle justify-between pb-40 bg-[#03BF62]">
      <Text className=" font-bold text-4xl text-white pt-40">WealthFlow</Text>
      <View className=" h-2/3 w-4/5 bg-white rounded-[20] items-center justify-evenly">
        <Text className=" font-bold text-3xl ">Sign in to your account </Text>
        <View className=" w-full p-10 h-1/3 justify-between ">
          <Text className="font-bold pb-3"> Email </Text>
          <TextInput
            className=" h-[40] bg-[#F4F6FA] rounded-[10] "
            placeholder=" Email"
          />
          <Text className="font-bold pb-3 pt-3"> Password </Text>
          <TextInput
            className=" h-[40] bg-[#F4F6FA] rounded-[10] "
            placeholder=" Password"
          />
          <TouchableOpacity onPress={onForgotPassWordPressed}>
            <Text className=" text-blue-400 font-bold pb-3 pt-3">
              Forgot password ?
            </Text>
          </TouchableOpacity>
        </View>
        <View className="w-full h-1/4 align-middle items-center justify-evenly">
          <View className=" bg-[#03BF62] w-4/5 rounded-[20]">
            <Button title="Login" color="white" onPress={onLoginAttemp} />
          </View>
          <View className="bg-[#03BF62] w-4/5 rounded-[20]">
            <Button title="Signup" color="white" onPress={onSignUpPressed} />
          </View>
        </View>
      </View>
    </View>
    </>
  );
}
