import "@/global.css";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import GroupedPageSection from "@/src/components/layout/grouped-page-section";
import HapticButton from "@/src/components/navigation/haptic-button";
import LottieView from 'lottie-react-native';

export default function SignUp() {
  const router = useRouter();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [phone, setPhone] = useState("");

  function onBackPressed() {
    router.dismiss();
  }

  async function onNextPressed() {
    // validate
    if (!email || !password || !retypePassword) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    if (password !== retypePassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://10.0.2.2:3000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "User created! ID: " + data.id);
        // navigate to main dashboard
        router.push("/(tabs)/(home)");
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (err: any) {
      Alert.alert("Network error", err.message);
    }
  }

  return (
    <>
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-between bg-[#03BF62]">
        <View className="justify-between flex-row pt-20 w-full pl-5 pr-5">
          <HapticButton onPressed={onBackPressed}>
            <Ionicons name="arrow-back-circle" size={30} color={"#FFF"} />
          </HapticButton>
          <Text className=" font-bold text-3xl text-white">Create your Account 🚀</Text>
        </View>

        <View className="h-5/6 w-full bg-white rounded-[40] items-center justify-evenly">
          <LottieView 
            source={require('@/assets/lottie/Finance guru.json')} 
            style={{width:100,height:100}}  
            autoPlay loop 
          />

          <GroupedPageSection className="items-center">
            <TextInput
              className="h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              className="h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              className="h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2"
              placeholder="Retype Password"
              secureTextEntry
              value={retypePassword}
              onChangeText={setRetypePassword}
            />
            <TextInput
              className="h-[40] bg-[#F4F6FA] rounded-[10] w-5/6 mb-2"
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
            />
          </GroupedPageSection>

          <GroupedPageSection>
            <TouchableOpacity
              className="bg-[#03BF62] w-4/5 rounded-[20] h-[35] items-center justify-center"
              onPress={onNextPressed}
            >
              <Text className="text-white font-bold text-xl">Next</Text>
            </TouchableOpacity>
          </GroupedPageSection>
        </View>
      </View>
    </>
  );
}







